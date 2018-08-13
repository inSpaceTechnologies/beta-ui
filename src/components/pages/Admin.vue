<!--
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->
<template>
  <div>
    <h1>IPFS</h1>
    <p>Status: {{ ipfsStatus }}</p>
    <button
      type="button"
      @click="checkIPFSStatus"
    >
      Check status
    </button>
    <button
      type="button"
      @click="startIPFS"
    >
      Start
    </button>
    <button
      type="button"
      @click="stopIPFS"
    >
      Stop
    </button>
    <button
      type="button"
      @click="initIPFS"
    >
      Init
    </button>
    <button
      type="button"
      @click="cleanupIPFS"
    >
      Clean up
    </button>
    <button
      type="button"
      @click="getIPFSConfig"
    >
      Get config
    </button>
    <button
      type="button"
      @click="getIPFSPinned"
    >
      List pinned
    </button>
    <div v-if="ipfsConfig">
      <h2>Config</h2>
      <span
        class="list"
        v-html="ipfsConfig"
      />
    </div>
    <div v-if="ipfsPinned">
      <h2>Pinned</h2>
      <span
        class="list"
        v-html="ipfsPinned"
      />
    </div>
  </div>
</template>
<style>
   .list ul {
     padding-left: 20px;

   }
</style>
<script>
import logger from '../../logger';

function objectToHTML(object) {
  let html = '<ul>';

  Object.keys(object).forEach((key) => {
    html += '<li>';
    const value = object[key];
    html += key;
    if (value && typeof value === 'object') {
      html += objectToHTML(value);
    } else {
      html += ': ';
      html += value;
    }
    html += '</li>';
  });
  html += '</ul>';
  return html;
}

export default {
  data() {
    return {
      ipfsStatus: 'unknown',
      ipfsConfig: null,
      ipfsPinned: null,
    };
  },
  methods: {
    checkIPFSStatus() {
      this.axios.get('/ipfs/started').then((response) => {
        if (response.data) {
          this.ipfsStatus = 'started';
        } else {
          this.ipfsStatus = 'not started';
        }
      }, (err) => {
        logger.error(err);
      });
    },
    startIPFS() {
      this.axios.put('/ipfs/start').then((response) => {
        logger.log(response);
      }, (err) => {
        logger.error(err);
      });
    },
    stopIPFS() {
      this.axios.put('/ipfs/stop').then((response) => {
        logger.log(response);
      }, (err) => {
        logger.error(err);
      });
    },
    initIPFS() {
      this.axios.put('/ipfs/init').then((response) => {
        logger.log(response);
      }, (err) => {
        logger.error(err);
      });
    },
    cleanupIPFS() {
      this.axios.put('/ipfs/cleanup').then((response) => {
        logger.log(response);
      }, (err) => {
        logger.error(err);
      });
    },
    getIPFSConfig() {
      this.axios.get('/ipfs/config').then((response) => {
        this.ipfsConfig = objectToHTML(response.data);
      }, (err) => {
        logger.error(err);
      });
    },
    getIPFSPinned() {
      this.axios.get('/ipfs/pin/ls').then((response) => {
        this.ipfsPinned = objectToHTML(response.data);
      }, (err) => {
        logger.error(err);
      });
    },
  },
};
</script>
