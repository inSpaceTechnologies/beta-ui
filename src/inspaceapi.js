/*
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/
import axios from 'axios';
import auth from './auth';

let axiosInstance = axios.create({ baseURL: process.env.API_SERVER_HOST });

async function getAxiosInstance() {
  // fetch every time in case expired
  const authData = await auth.getAuthData();

  axiosInstance.defaults.headers.common['public-key'] = authData.publicKey;
  axiosInstance.defaults.headers.common.signature = authData.signature;
  axiosInstance.defaults.headers.common['expiration-date'] = authData.expirationDate;

  return axiosInstance;
}

export default {
  init() {
    axiosInstance = axios.create({
      baseURL: process.env.API_SERVER_HOST,
    });
  },
  getAxiosInstance,
};
