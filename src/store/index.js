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
import iscoin from './modules/iscoin';
import stringPrompt from './modules/string-prompt';
import dropdown from './modules/dropdown';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    scatter,
    filespace,
    friends,
    iscoin,
    stringPrompt,
    dropdown,
  },
});

export default store;
