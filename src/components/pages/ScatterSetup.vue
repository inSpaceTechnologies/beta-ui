<!--
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->
<template>
  <div class="central">
    <div class="card">
      <div class="card-header">
        <span class="card-title">
          Scatter setup
        </span>
      </div>
      <div class="card-content">
        <template v-if="!this.$store.state.scatter.scatter">
          <p>Scatter not detected. You can get it from <a target="_blank" href="https://get-scatter.com/">here</a></p> <!-- eslint-disable-line vue/max-attributes-per-line -->
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
        <h2>Scatter</h2>
        <p>"Scatter is a multi-blockchain signature, identity, and reputation provider for Windows, Mac, Linux, Android, and iOS." Get it from <a target="_blank" href="https://get-scatter.com/">here</a>.</p> <!-- eslint-disable-line vue/max-attributes-per-line -->
        <h2>Adding the network</h2>
        <p>inSpace currently runs on a private EOS testnet. To add the network details to Scatter, click 'Add network' above after installing Scatter.</p>
        <h2>Adding your EOS testnet account to your Scatter identity</h2>
        <p>You will need to add your EOS testnet private key to your Scatter 'vault'. (Open your vault, click 'New', then 'Import', then 'Text or QR'.)</p>
        <h2>Setting your identity</h2>
        <p>Once you have completed the above steps, click 'Set identity' above. This will link your Scatter identity to the inSpace website, which will be able to use your EOS account to make transactions (subject to your approval).</p>
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
import logger from '../../logger';

export default {
  computed: {
    done() {
      if (this.$store.state.scatter.identitySet) {
        return true;
      }
      return false;
    },
  },
  watch: {
    done(newValue) {
      if (newValue) {
        // we are done here
        if (this.$route.query && this.$route.query.redirect) {
          this.$router.push({ path: this.$route.query.redirect });
        } else {
          this.$router.push({ path: '/' });
        }
      }
    },
  },
  methods: {
    async addNetwork() {
      try {
        const added = await this.$store.dispatch('suggestNetwork');
        if (added) {
          logger.notify({
            title: 'Success',
            text: 'Network successfully added to Scatter.',
            type: 'success',
            permanent: false,
            sticky: false,
            buttons: null,
          });
        }
      } catch (err) {
        logger.notify({
          title: err.code,
          text: err.message,
          type: 'error',
          permanent: false,
          sticky: true,
          buttons: null,
        });
      }
    },
    requestIdentity() {
      this.$store.dispatch('requestIdentity').then(() => {
      }, (err) => {
        logger.notify({
          title: err.code,
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
