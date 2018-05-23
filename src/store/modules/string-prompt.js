/*
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/
/* eslint no-shadow: ["error", { "allow": ["state"] }] */
// based on https://www.reddit.com/r/vuejs/comments/7eoouv/how_to_programmatically_open_a_confirmation/

const initialState = {
  active: false,
  text: '',
  // used for setting a default value
  value: '',
  resolve: null,
  reject: null,
};

const state = Object.assign({}, initialState);

const mutations = {
  setValue(state, value) {
    state.value = value;
  },
  activateStringPrompt(state, payload) {
    Object.assign(state, payload);
  },
  deactivateStringPrompt(state) {
    Object.assign(state, initialState);
  },
};

const actions = {
  openStringPrompt({ commit }, { text, value }) {
    return new Promise((resolve, reject) => {
      commit('activateStringPrompt', {
        active: true,
        text,
        value,
        resolve,
        reject,
      });
    });
  },
  closeStringPrompt({ commit }) {
    commit('deactivateStringPrompt');
  },
};

export default {
  state,
  mutations,
  actions,
};
