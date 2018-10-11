/*
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/
const ISCOIN_ACCOUNT_NAME = 'iscoin';

async function getBalance(rpc, accountName) {
  const accountRows = (await rpc.get_table_rows({
    json: true,
    scope: accountName,
    code: ISCOIN_ACCOUNT_NAME,
    table: 'accounts',
    limit: 500,
  })).rows;
  let balance = 0;
  accountRows.forEach((accountRow) => {
    const balanceAsset = accountRow.balance.split(' ');
    if (balanceAsset[1] !== process.env.CURRENCY_SYMBOL) {
      return;
    }
    balance = parseFloat(balanceAsset[0]);
  });
  return balance;
}

async function getStakes(rpc, accountName) {
  const stakeRows = (await rpc.get_table_rows({
    json: true,
    scope: accountName,
    code: ISCOIN_ACCOUNT_NAME,
    table: 'stakes',
    limit: 500,
  })).rows;
  const stakes = [];
  stakeRows.forEach((stakeRow) => {
    const quantityAsset = stakeRow.quantity.split(' ');
    if (quantityAsset[1] !== process.env.CURRENCY_SYMBOL) {
      return;
    }
    stakes.push({
      quantity: parseFloat(quantityAsset[0]),
      start: stakeRow.start,
      duration: stakeRow.duration,
    });
  });
  return stakes;
}

const storeState = {
  balance: null,
  stakes: [],
};

const storeMutations = {
  setBalance(state, balance) {
    state.balance = balance;
  },
  setStakes(state, stakes) {
    state.stakes = stakes;
  },
};

const storeActions = {
  async getIscoinData({ commit, rootState, rootGetters }) {
    const { accountName } = rootGetters;
    commit('setBalance', await getBalance(rootState.scatter.rpc, accountName));
    commit('setStakes', await getStakes(rootState.scatter.rpc, accountName));
  },
  async addStake({ rootState, rootGetters }, { quantity, duration }) {
    const quantityFloat = parseFloat(quantity);
    const quantityString = `${quantityFloat.toFixed(process.env.CURRENCY_DECIMAL_PLACES)} ${process.env.CURRENCY_SYMBOL}`;
    const { accountName } = rootGetters;
    await rootState.scatter.api.transact({
      actions: [{
        account: ISCOIN_ACCOUNT_NAME,
        name: 'addstake',
        authorization: [{
          actor: accountName,
          permission: 'active',
        }],
        data: {
          staker: accountName,
          quantity: quantityString,
          duration,
        },
      }],
    }, {
      blocksBehind: parseInt(process.env.BLOCKS_BEHIND, 10),
      expireSeconds: parseInt(process.env.EXPIRE_SECONDS, 10),
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
