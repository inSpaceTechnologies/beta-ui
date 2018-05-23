/*
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/
import Vue from 'vue';
import Vuex from 'vuex';
import scatter from './modules/scatter';
import filespace from './modules/filespace';
import stringPrompt from './modules/string-prompt';

import logger from '../logger';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    scatter,
    filespace,
    stringPrompt,
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
