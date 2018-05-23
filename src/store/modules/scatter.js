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
  // setting this 'confirms' the identity that was requested
  identity: null,
};

const getters = {
  getIdentity: state => state.identity,
};

const mutations = {
  setScatter(state, { network, scatter }) {
    state.scatter = scatter;
    state.network = network;

    const eosOptions = {};

    const eos = scatter.eos(state.network, Eos.Localnet, eosOptions);

    state.eos = eos;
  },
  setIdentity(state, identity) {
    state.identity = identity;
  },
};

const actions = {
  requestIdentity({ state }) {
    return new Promise((resolve, reject) => {
      // You can require certain fields
      state.scatter.getIdentity({ accounts: [state.network] }).then((identity) => {
        // Identities must be bound to scatter to be
        // able to request transaction signatures
        state.scatter.useIdentity(identity);

        resolve(identity);
      }, (err) => {
        reject(err);
      });
    });
  },
  confirmIdentity({ commit, state }) {
    // set state.identity
    commit('setIdentity', state.scatter.identity);
  },
  suggestNetwork({ state }) {
    return state.scatter.suggestNetwork(state.network);
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
};

export default {
  state,
  getters,
  actions,
  mutations,
};
