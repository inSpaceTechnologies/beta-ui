/*
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/
/* eslint no-shadow: ["error", { "allow": ["state"] }] */

const eosjs = require('eosjs');
const fetch = require('node-fetch');

const state = {
  network: null,
  scatter: null,
  api: null,
  rpc: null,
  // scatter.identity cannot be watched, so we add this
  identitySet: false,
};

const getters = {
  accountName: state => state.scatter.identity.accounts.find(acc => acc.blockchain === 'eos').name,
  publicKey: state => state.scatter.identity.accounts.find(acc => acc.blockchain === 'eos').publicKey,
};

const mutations = {
  setScatter(state, { network, scatter }) {
    state.scatter = scatter;
    state.network = network;

    const rpc = new eosjs.Rpc.JsonRpc(`${network.protocol}://${network.host}:${network.port}`, { fetch });
    const api = new eosjs.Api({ rpc, signatureProvider: scatter.eosHook(network) });

    state.rpc = rpc;
    state.api = api;

    if (scatter.identity) {
      state.identitySet = true;
    }
  },
  setIdentitySet(state, identitySet) {
    state.identitySet = identitySet;
  },
};

const actions = {
  async requestIdentity({ state, commit }) {
    // You can require certain fields
    await state.scatter.getIdentity({ accounts: [state.network] });
    commit('setIdentitySet', true);
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
