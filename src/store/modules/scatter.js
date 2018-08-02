/*
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/
/* eslint no-shadow: ["error", { "allow": ["state"] }] */

import * as Eos from 'eosjs';

const state = {
  network: null,
  scatter: null,
  eos: null,
  // scatter.identity cannot be watched, so we add this
  identitySet: false,
};

const getters = {
  getIdentity: state => state.identity,
};

const mutations = {
  setScatter(state, { network, scatter }) {
    state.scatter = scatter;
    state.network = network;

    const eosOptions = {};

    const eos = scatter.eos(state.network, Eos, eosOptions);

    state.eos = eos;

    if (scatter.identity) {
      state.identitySet = true;
    }
  },
  setIdentitySet(state, identitySet) {
    state.identitySet = identitySet;
  },
};

const actions = {
  requestIdentity({ state, commit }) {
    return new Promise((resolve, reject) => {
      // You can require certain fields
      state.scatter.getIdentity({ accounts: [state.network] }).then((identity) => {
        // Identities must be bound to scatter to be
        // able to request transaction signatures
        state.scatter.useIdentity(identity);
        commit('setIdentitySet', true);
        resolve(identity);
      }, (err) => {
        reject(err);
      });
    });
  },
  suggestNetwork({ state }) {
    return state.scatter.suggestNetwork(state.network);
  },
  forgetIdentity({ state, commit }) {
    return new Promise((resolve, reject) => {
      state.scatter.forgetIdentity().then(() => {
        commit('setIdentitySet', false);
        resolve();
      }, (err) => {
        reject(err);
      });
    });
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
