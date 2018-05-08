import Vue from 'vue'
import VueRouter from 'vue-router'
import axios from 'axios';
import VueAxios from 'vue-axios';
import Vuetify from 'vuetify';

import 'vuetify/dist/vuetify.min.css' // Ensure you are using css-loader
import 'material-design-icons-iconfont/dist/material-design-icons.css' // Ensure you are using css-loader

import appComponent from './components/App.vue'
import homeComponent from './components/Home.vue'
import loginComponent from './components/Login.vue'
import signupComponent from './components/Signup.vue'
import navbarComponent from './components/Navbar.vue'
import notFoundComponent from './components/404.vue'

Vue.component('navbar', navbarComponent);

var router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: homeComponent
    },
    // dummy page that requires auth, for testing
    {
        path: '/secure',
        name: 'secure',
        component: { template: '<div>secure</div>'},
        meta: {auth: true}
    },
    {
        path: '/login',
        name: 'login',
        component: loginComponent,
        meta: {auth: false}
    },
    {
        path: '/signup',
        name: 'signup',
        component: signupComponent,
        meta: {auth: false}
    },
    {
       path: '/404',
       name: '404',
       component: notFoundComponent
    },
    {
       path: '*',
       redirect: { name: '404'}
    },
  ]
});

Vue.router = router;

Vue.use(Vuetify);
Vue.use(VueRouter);
Vue.use(VueAxios, axios);
// TODO: this should go in config
Vue.axios.defaults.baseURL = 'http://localhost:3000';
Vue.use(require('@websanova/vue-auth'), {
  auth: require('@websanova/vue-auth/drivers/auth/bearer.js'),
  http: require('@websanova/vue-auth/drivers/http/axios.1.x.js'),
  router: require('@websanova/vue-auth/drivers/router/vue-router.2.x.js')
})

appComponent.router = Vue.router;

const app = new Vue(appComponent).$mount('#app')
