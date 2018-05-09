import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';
import axios from 'axios';
import VueAxios from 'vue-axios';
import Vuetify from 'vuetify';

import VueAuth from '@websanova/vue-auth';
import VueAuthBearer from '@websanova/vue-auth/drivers/auth/bearer';
import VueAuthAxios from '@websanova/vue-auth/drivers/http/axios.1.x';
import VueAuthRouter from '@websanova/vue-auth/drivers/router/vue-router.2.x';

import * as Eos from 'eosjs';

import 'vuetify/dist/vuetify.min.css';
import 'material-design-icons-iconfont/dist/material-design-icons.css';

// pages
import appComponent from './components/App.vue';
import homeComponent from './components/Home.vue';
import loginComponent from './components/Login.vue';
import signupComponent from './components/Signup.vue';
import notFoundComponent from './components/404.vue';

import navbarComponent from './components/Navbar.vue';
import scatterSetupComponent from './components/ScatterSetup.vue';

Vue.component('navbar', navbarComponent);
Vue.component('scatter-setup', scatterSetupComponent);

// vue-router

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: homeComponent,
    },
    // dummy page that requires auth, for testing
    {
      path: '/secure',
      name: 'secure',
      component: { template: '<div>secure</div>' },
      meta: { auth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: loginComponent,
      meta: { auth: false },
    },
    {
      path: '/signup',
      name: 'signup',
      component: signupComponent,
      meta: { auth: false },
    },
    {
      path: '/404',
      name: '404',
      component: notFoundComponent,
    },
    {
      path: '*',
      redirect: { name: '404' },
    },
  ],
});

Vue.use(VueRouter);
Vue.router = router;

// vuex

Vue.use(Vuex);

// TODO: this should go in config
const network = { blockchain: 'eos', host: 'ec2-52-17-24-199.eu-west-1.compute.amazonaws.com', port: 8888 };

const store = new Vuex.Store({
  state: {
    scatter: null,
    eos: null,
    identity: null,
    identityConfirmed: false,
  },
  mutations: {
    setScatter(state, scatter) {
      state.scatter = scatter;

      const eosOptions = {};

      const eos = scatter.eos(network, Eos.Localnet, eosOptions);

      state.eos = eos;
    },
    setIdentity(state, identity) {
      state.identity = identity;
    },
    setIdentityConfirmed(state, identityConfirmed) {
      state.identityConfirmed = identityConfirmed;
    },
  },
  actions: {
    requestIdentity({ commit, state }) {
      return new Promise((resolve, reject) => {
        // You can require certain fields
        state.scatter.getIdentity({ accounts: [network] }).then((identity) => {
          // Identities must be bound to scatter to be
          // able to request transaction signatures
          state.scatter.useIdentity(identity);

          commit('setIdentity', identity);

          resolve(identity);
        }, (err) => {
          reject(err);
        });
      });
    },
    suggestNetwork({ state }) {
      return state.scatter.suggestNetwork(network);
    },
    forgetIdentity({ commit, state }) {
      return new Promise((resolve, reject) => {
        state.scatter.forgetIdentity().then(() => {
          commit('setIdentity', null);
          resolve();
        }, (err) => {
          reject(err);
        });
      });
    },
  },
});


document.addEventListener('scatterLoaded', () => {
  // Scatter will now be available from the window scope.
  // At this stage the connection to Scatter from the application is
  // already encrypted.
  // const scatter = window.scatter;
  const { scatter } = window;

  store.commit('setScatter', scatter);

  // It is good practice to take this off the window once you have
  // a reference to it.
  window.scatter = null;
});

// vuetify

Vue.use(Vuetify);

// vue-axios

Vue.use(VueAxios, axios);
// TODO: this should go in config
Vue.axios.defaults.baseURL = 'http://localhost:3000';

// vue-auth

Vue.use(VueAuth, {
  auth: VueAuthBearer,
  http: VueAuthAxios,
  router: VueAuthRouter,
});

// Vue app

// eslint-disable-next-line no-new
new Vue({
  el: '#app',
  store,
  router: Vue.router,
  render: h => h(appComponent),
});
