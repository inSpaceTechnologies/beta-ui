/*
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/
import store from './store';

const KEY = 'authData';
const EXPIRY = parseInt(process.env.AUTH_EXPIRY, 10);

async function generateAuthData() {
  if (!store.state.scatter.identitySet) {
    throw new Error('Identity not set.');
  }
  const expirationDate = Date.now() + EXPIRY;

  const { publicKey } = store.getters;
  const data = `${expirationDate}`; // breaks if this is a number
  const whatFor = 'Verify identity';
  const isHash = false;

  const signature = await store.state.scatter.scatter.getArbitrarySignature(publicKey, data, whatFor, isHash);

  return {
    signature,
    expirationDate,
    publicKey,
  };
}

async function getAuthData() {
  let data = localStorage.getItem(KEY);
  if (data) {
    const parsedData = JSON.parse(data);
    const { publicKey } = store.getters;
    if (parsedData.publicKey === publicKey && parsedData.expirationDate > Date.now()) {
      return parsedData;
    }
  }
  // does not exist
  data = await generateAuthData();
  localStorage.setItem(KEY, JSON.stringify(data));
  return data;
}

export default {
  getAuthData,
};
