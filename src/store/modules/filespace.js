/*
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/
import Vue from 'vue';

const storeState = {
  filespace: null,
};

const storeMutations = {
  setFilespace(state, filespace) {
    state.filespace = filespace;
  },
  setFolder(state, { index, content }) {
    if (!state.filespace) {
      state.filespace = {};
    }
    // https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats
    // state.filespace[index] = content;
    Vue.set(state.filespace, index, content);
  },
  setFilespaceError(state, error) {
    state.filespaceError = error;
  },
};

const storeActions = {
  addFolder({ commit, rootState }, { index, content }) {
    return new Promise((resolve, reject) => {
      rootState.scatter.eos.contract('filespace').then((filespace) => {
        const accountName = rootState.scatter.identity.accounts.find(acc => acc.blockchain === 'eos').name;
        filespace.insert(accountName, index, JSON.stringify(content), { authorization: accountName }).then(() => {
          commit('setFolder', { index, content });
          resolve();
        });
      }, (err) => {
        reject(err);
      });
    });
  },
  addChildFolder({ state, dispatch }, { parentIndex, index, content }) {
    return new Promise((resolve, reject) => {
      dispatch('addFolder', { index, content }).then(() => {
        const parentContent = JSON.parse(JSON.stringify(state.filespace[parentIndex])); // need to clone it
        parentContent.folders.push(index);
        dispatch('addFolder', { index: parentIndex, content: parentContent }).then(() => {
          resolve();
        }, (err) => {
          reject(err);
        });
      }, (err) => {
        reject(err);
      });
    });
  },
  getFilespace({
    commit, rootState, dispatch,
  }) {
    return new Promise((resolve, reject) => {
      const accountName = rootState.scatter.identity.accounts.find(acc => acc.blockchain === 'eos').name;
      // get filespace
      rootState.scatter.eos.getTableRows({
        json: true,
        scope: accountName,
        code: 'filespace',
        table: 'folders',
        limit: 500,
      }).then((result) => {
        const folders = {};
        result.rows.forEach((row) => {
          folders[row.id] = JSON.parse(row.content);
        });

        // make sure there is a root
        const rootIndex = 0;
        if (folders[rootIndex] && folders[rootIndex].name) {
          // there is a root
          commit('setFilespace', folders);
          resolve();
          return;
        }

        // no root, so add one
        const root = { name: process.env.FILESPACE_ROOT_NAME, files: [], folders: [] };
        dispatch('addFolder', { index: rootIndex, content: root }).then(() => {
          resolve();
        }, (err) => {
          reject(err);
        });
      }, (err) => {
        reject(err);
      });
    });
  },
};

export default {
  state: storeState,
  actions: storeActions,
  mutations: storeMutations,
};
