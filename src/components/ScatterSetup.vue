<!--
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->
<template>
  <div>
    <div class="card">
      <div class="card-header">
        <span class="card-title">
          Scatter setup
        </span>
      </div>
      <div class="card-content">
        <template v-if="!this.$store.state.scatter.scatter">
          <p>Scatter not detected. You can get it <a href="https://chrome.google.com/webstore/detail/scatter/ammjpmhgckkpcamddpolhchgomcojkle">here.</a></p>
        </template>
        <template v-else-if="!this.$store.state.scatter.identitySet">
          <p>Scatter detected. You must now set your identity. Please click 'Set identity' when you are ready to do so.</p>
          <p>If you need to add the temporary inSpace EOS testnet network details to Scatter, you can do that too.</p>
          <div class="card-footer">
            <button
              class="primary"
              @click="requestIdentity"
            >
              Set identity
            </button>
            <button
              @click="addNetwork"
            >
              Add network
            </button>
          </div>
        </template>
      </div>
    </div>
    <div class="card">
      <div class="card-header">
        <span class="card-title">
          Scatter help
        </span>
      </div>
      <div class="card-content">
        <h2>What is Scatter?</h2>
        <p>"Scatter is a browser extension that allows you to sign transactions for multiple blockchains and provide personal information to web applications without ever exposing your keys or filling out forms."</p>
        <h2>Getting Scatter</h2>
        <p>Get Scatter <a target="_blank" href="https://chrome.google.com/webstore/detail/scatter/ammjpmhgckkpcamddpolhchgomcojkle">from the Chrome Store</a>. Currently only the <a target="_blank" href="https://www.google.com/chrome/">Chrome</a> web browser is supported.</p> <!-- eslint-disable-line vue/max-attributes-per-line -->
        <h2>Accessing Scatter</h2>
        <p>Access Scatter by clicking the Scatter icon on Chrome's toolbar.</p>
        <h2>Adding your EOS key pair</h2>
        <ul>
          <li>Click 'Key Pairs' on Scatter's main menu.</li>
          <li>Click 'New'.</li>
          <li>Select 'EOS' in the drop down menu.</li>
          <li>Enter a name for the key pair in the 'Name' box.</li>
          <li>Enter your private key in the 'Private Key' box.</li>
          <li>Click 'Save'.</li>
        </ul>
        <h2>Adding the EOS network</h2>
        <ul>
          <li>Click the cog icon on Scatter's main menu.</li>
          <li>Click 'Networks'</li>
          <li>Click 'New'.</li>
          <li>Select 'EOS' in the drop down menu.</li>
          <li>Enter a name for the network in the 'Name' box.</li>
          <li>Select 'http' or 'https' as appropriate from the protocal menu.</li>
          <li>Enter the domain or IP address in the 'Domain or IP' box.</li>
          <li>Enter the port in the 'Port' box.</li>
          <li>Click 'Save'.</li>
        </ul>
        <h2>Creating your identity</h2>
        <ul>
          <li>Click 'Identities' on Scatter's main menu.</li>
          <li>Click 'New'.</li>
          <li>Select the network and key pair from the drop down menus.</li>
          <li>Click 'Import'.</li>
          <li>Click 'Save'.</li>
        </ul>
      </div>
    </div>
  </div>
</template>
<style scoped>
.help {
  vertical-align: super;
  font-size: 80%;
}
</style>
<script>
import logger from '../logger';

export default {
  methods: {
    addNetwork() {
      this.$store.dispatch('suggestNetwork');
    },
    requestIdentity() {
      this.$store.dispatch('requestIdentity').then(() => {
      }, (err) => {
        logger.notify({
          title: 'Error',
          text: err.message,
          type: 'error',
          permanent: false,
          sticky: true,
          buttons: [],
        });
      });
    },
    /*
    forgetIdentity() {
      this.$store.dispatch('forgetIdentity').then(() => {
      }, (err) => {
        logger.error(err.message);
      });
    },
    */
    confirmIdentity() {
      this.$store.dispatch('confirmIdentity');
    },
  },
};
</script>
