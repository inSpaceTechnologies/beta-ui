/*
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/
const FRIENDS_ACCOUNT_NAME = 'friends';

function getTables(eos) {
  return new Promise((resolve) => {
    const data = {};
    eos.getTableRows({
      json: true,
      scope: FRIENDS_ACCOUNT_NAME,
      code: FRIENDS_ACCOUNT_NAME,
      table: 'requests',
      limit: 500,
    })
      .then((result) => {
        data.rawRequests = result.rows;
        return eos.getTableRows({
          json: true,
          scope: FRIENDS_ACCOUNT_NAME,
          code: FRIENDS_ACCOUNT_NAME,
          table: 'friendships',
          limit: 500,
        });
      })
      .then((result) => {
        data.rawFriendships = result.rows;
        resolve(data);
      });
  });
}

function getFriendData(eos, accountName) {
  return new Promise((resolve) => {
    getTables(eos).then(({ rawRequests, rawFriendships }) => {
      const sentRequests = [];
      const receivedRequests = [];
      const friends = [];

      rawRequests.forEach((request) => {
        if (request.from === accountName) {
          sentRequests.push(request.to);
        } else if (request.to === accountName) {
          receivedRequests.push(request.from);
        }
      });

      rawFriendships.forEach((friendship) => {
        if (friendship.account1 === accountName) {
          friends.push(friendship.account2);
        } else if (friendship.account2 === accountName) {
          friends.push(friendship.account1);
        }
      });
      resolve({ sentRequests, receivedRequests, friends });
    });
  });
}

const storeState = {
  sentRequests: [],
  receivedRequests: [],
  friends: [],
};

const storeMutations = {
  setSentRequests(state, sentRequests) {
    state.sentRequests = sentRequests;
  },
  setReceivedRequests(state, receivedRequests) {
    state.receivedRequests = receivedRequests;
  },
  setFriends(state, friends) {
    state.friends = friends;
  },
};


const storeActions = {
  getFriends({ commit, rootState, rootGetters }) {
    return new Promise((resolve) => {
      const { accountName } = rootGetters;
      getFriendData(rootState.scatter.eos, accountName).then(({ sentRequests, receivedRequests, friends }) => {
        commit('setSentRequests', sentRequests);
        commit('setReceivedRequests', receivedRequests);
        commit('setFriends', friends);
        resolve({ sentRequests, receivedRequests, friends });
      });
    });
  },
};

const storeGetters = {};

export default {
  state: storeState,
  actions: storeActions,
  mutations: storeMutations,
  getters: storeGetters,
};
