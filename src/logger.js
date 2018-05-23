/*
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/
/* eslint no-console: 0 */ // --> OFF

const debug = (process.env.NODE_ENV !== 'production');

export default {
  log: (message) => {
    if (debug) {
      console.log(message);
    }
  },
  error: (message) => {
    if (debug) {
      console.error(message);
    }
  },
};
