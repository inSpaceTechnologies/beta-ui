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
import friends from './modules/friends';
import stringPrompt from './modules/string-prompt';

import logger from '../logger';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    scatter,
    filespace,
    friends,
    stringPrompt,
  },
});

store.watch(state => state.scatter.identitySet, () => {
  store.dispatch('getFilespace').then(() => store.dispatch('getFriends')).then(() => {
  }, (err) => {
    logger.error(err.message);
  });
});

export default store;
