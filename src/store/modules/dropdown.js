/*
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/
const Vue = require('vue');

const storeState = {
  open: {},
};

const storeMutations = {
  setOpen(state, { identifier, value }) {
    Vue.set(state.open, identifier, value);
    // this.$set(this.open, identifier, value);
  },
};


const storeActions = {
  setDropdownOpen({ commit }, { identifier, value }) {
    commit('setOpen', { identifier, value });
  },
};

export default {
  state: storeState,
  actions: storeActions,
  mutations: storeMutations,
};
