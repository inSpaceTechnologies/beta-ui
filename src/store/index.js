import Vue from 'vue';
import Vuex from 'vuex';
import scatter from './modules/scatter';
import filespace from './modules/filespace';

import logger from '../logger';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    scatter,
    filespace,
  },
});

store.watch(state => state.scatter.identity, (identity) => {
  if (identity) {
    store.dispatch('getFilespace').then(() => {
    }, (err) => {
      logger.error(err.message);
    });
  }
});

export default store;
