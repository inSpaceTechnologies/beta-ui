/*
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/
const ISCOIN_ACCOUNT_NAME = 'iscoin';

async function getBalance(eos, accountName) {
  const accountRows = (await eos.getTableRows({
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

async function getStakes(eos, accountName) {
  const stakeRows = (await eos.getTableRows({
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
    commit('setBalance', await getBalance(rootState.scatter.eos, accountName));
    commit('setStakes', await getStakes(rootState.scatter.eos, accountName));
  },
  async addStake({ rootState, rootGetters }, { quantity, duration }) {
    const quantityFloat = parseFloat(quantity);
    const quantityString = `${quantityFloat.toFixed(process.env.CURRENCY_DECIMAL_PLACES)} ${process.env.CURRENCY_SYMBOL}`;
    const iscoinContract = await rootState.scatter.eos.contract(ISCOIN_ACCOUNT_NAME);
    const { accountName } = rootGetters;
    await iscoinContract.addstake(accountName, quantityString, duration, { authorization: accountName });
  },
};

const storeGetters = {};

export default {
  state: storeState,
  actions: storeActions,
  mutations: storeMutations,
  getters: storeGetters,
};
