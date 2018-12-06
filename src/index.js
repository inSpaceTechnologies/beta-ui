/*
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/
import ScatterJS from 'scatterjs-core';
import ScatterEOS from 'scatterjs-plugin-eosjs2';

import Vue from 'vue';
import VueRouter from 'vue-router';

import WebFont from 'webfontloader';

import 'reset-css/reset.css';
import 'noty/lib/noty.css';
import 'noty/lib/themes/relax.css';

// font awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faHome, faSignInAlt, faSignOutAlt, faUser, faUserPlus, faUserFriends, faCaretDown, faCoins, faFolder,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// components

import appComponent from './components/App.vue';

// pages
import homeComponent from './components/pages/Home.vue';
import notFoundComponent from './components/pages/404.vue';
import adminComponent from './components/pages/Admin.vue';
import userComponent from './components/pages/User.vue';
import scatterSetupComponent from './components/pages/ScatterSetup.vue';
import filespace2dPageComponent from './components/pages/Filespace2d.vue';
import filespace3dPageComponent from './components/pages/Filespace3d.vue';
import purchasePageComponent from './components/pages/Purchase.vue';
import iscoinPageComponent from './components/pages/Iscoin.vue';

import navbarComponent from './components/Navbar.vue';
import filespaceItemComponent from './components/FilespaceItem.vue';
import stringPromptComponent from './components/StringPrompt.vue';
import alertComponent from './components/Alert.vue';
import modalDialogComponent from './components/ModalDialog.vue';
import filespace2dComponent from './components/Filespace2d.vue';
import dropdownButtonComponent from './components/DropdownButton.vue';
import dropdownMenuComponent from './components/DropdownMenu.vue';
import friendsComponent from './components/Friends.vue';
import aboutComponent from './components/About.vue';


import logger from './logger';
import auth from './auth';
import inspaceAPI from './inspaceapi';

import store from './store';

// custom CSS
import './style/theme.css';
import './style/card.css';
import './style/form.css';
import './style/modal-dialog.css';
import './style/dropdown.css';

// load font synchronously so it is available immediately
WebFont.load({
  google: {
    families: ['Roboto'],
  },
});

// register components
Vue.component('navbar', navbarComponent);
Vue.component('filespace-item', filespaceItemComponent);
Vue.component('string-prompt', stringPromptComponent);
Vue.component('alert', alertComponent);
Vue.component('modal-dialog', modalDialogComponent);
Vue.component('filespace-2d', filespace2dComponent);
Vue.component('dropdown-button', dropdownButtonComponent);
Vue.component('dropdown-menu', dropdownMenuComponent);
Vue.component('about', aboutComponent);
Vue.component('friends', friendsComponent);

// font awesome
library.add(faHome);
library.add(faSignInAlt);
library.add(faSignOutAlt);
library.add(faUser);
library.add(faUserPlus);
library.add(faUserFriends);
library.add(faCaretDown);
library.add(faCoins);
library.add(faFolder);
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.config.productionTip = false;

// vue-router

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: homeComponent,
      meta: { scatter: true },
    },
    {
      path: '/scattersetup',
      name: 'scattersetup',
      component: scatterSetupComponent,
      meta: { scatter: false },
    },
    {
      path: '/admin',
      component: adminComponent,
    },
    {
      path: '/about/:accountName',
      name: 'about',
      component: userComponent,
      props(route) {
        return {
          tab: 'about',
          accountName: route.params.accountName,
        };
      },
      meta: { scatter: true },
    },
    {
      path: '/friends/:accountName',
      name: 'friends',
      component: userComponent,
      props(route) {
        return {
          tab: 'friends',
          accountName: route.params.accountName,
        };
      },
      meta: { scatter: true },
    },
    {
      path: '/filespace2d/:accountName',
      name: 'filespace-2d',
      component: filespace2dPageComponent,
      meta: { scatter: true },
    },
    {
      path: '/filespace3d/:accountName',
      name: 'filespace-3d',
      component: filespace3dPageComponent,
      meta: { scatter: true },
    },
    {
      path: '/iscoin',
      name: 'iscoin',
      component: iscoinPageComponent,
      meta: { scatter: true },
    },
    {
      path: '/purchase',
      name: 'purchase',
      component: purchasePageComponent,
      meta: { scatter: true },
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

// enforce 'scatter' meta field for requiring the Scatter identity to have been set
router.beforeEach((to, from, next) => {
  let hasScatterMetaField = false;
  let scatterMetaFieldValue = null;

  to.matched.forEach((record) => {
    if (Object.prototype.hasOwnProperty.call(record.meta, 'scatter')) {
      hasScatterMetaField = true;
      scatterMetaFieldValue = record.meta.scatter;
    }
  });

  if (!hasScatterMetaField) {
    next();
    return;
  }

  const hasScatter = store.state.scatter.identitySet;

  if (scatterMetaFieldValue) {
    if (!hasScatter) {
      next({
        path: '/scattersetup',
        query: { redirect: to.fullPath },
      });
    } else {
      // scatter requirement met
      next();
    }
  } else if (hasScatter) {
    // has scatter, so fails requirement
    next({
      path: '/',
    });
  } else {
    // no scatter requirement met
    next();
  }
});

Vue.use(VueRouter);
Vue.router = router;

// do some things when the identity has been set

store.watch(state => state.scatter.identitySet, async () => {
  store.dispatch('getFilespace')
    .then(() => store.dispatch('getFriends'))
    .then(() => store.dispatch('getIscoinData'))
    .then(() => auth.getAuthData())
    .then(() => {
    }, (err) => {
      logger.error(err.message);
    });
});

inspaceAPI.init();

// Scatter

const network = {
  protocol: process.env.EOS_PROTOCOL,
  blockchain: 'eos',
  host: process.env.EOS_HOST,
  port: process.env.EOS_PORT,
  chainId: process.env.EOS_CHAIN_ID,
};

// Scatter

ScatterJS.plugins(new ScatterEOS());

// wait for Scatter before creating the Vue app
ScatterJS.scatter.connect(process.env.APP_NAME).then((connected) => {
  if (connected) {
    const { scatter } = ScatterJS;
    store.commit('setScatter', { network, scatter });
    window.ScatterJS = null;
  }

  // Vue app

  // eslint-disable-next-line no-new
  new Vue({
    el: '#app',
    store,
    router: Vue.router,
    render: h => h(appComponent),
  });
});
