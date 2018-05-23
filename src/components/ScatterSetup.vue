<!--
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->
<template>
  <v-card v-if="!$store.state.scatter.identity">

    <v-card-title primary-title>
      <h2>Scatter setup</h2>
    </v-card-title>

    <v-stepper :value="val">

      <v-stepper-header>
        <v-stepper-step
          :complete="val > 1"
          step="1"
        >
          Get scatter
        </v-stepper-step>
        <v-divider/>
        <v-stepper-step
          :complete="val > 2"
          step="2"
        >
          Set identity
        </v-stepper-step>
        <v-divider/>
        <v-stepper-step
          :complete="val > 3"
          step="3"
        >
          Check details
        </v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>

        <v-stepper-content step="1">
          <v-card>
            Scatter not detected. You can get it <a href="https://chrome.google.com/webstore/detail/scatter/ammjpmhgckkpcamddpolhchgomcojkle">here</a>
          </v-card>
        </v-stepper-content>

        <v-stepper-content step="2">
          <v-card>
            <v-alert
              v-if="requestIdentityError"
              :value="true"
              type="error"
            >
              {{ requestIdentityError }}
            </v-alert>
            <p>Scatter detected. You must now set your identity. Please click 'Set identity' when you are ready to do so.</p>
            <p>If you need to add the temporary inSpace EOS testnet network details to Scatter, you can do that too.</p>
            <v-card-actions>
              <v-btn
                color="primary"
                @click="requestIdentity"
              >
                Set identity
              </v-btn>
              <v-btn
                @click="addNetwork"
              >
                Add network
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-stepper-content>

        <v-stepper-content step="3">
          <v-card v-if="val === 3">
            <v-alert
              v-if="forgetIdentityError"
              :value="true"
              type="error"
            >
              {{ forgetIdentityError }}
            </v-alert>
            <p><strong>Identity name:</strong> {{ $store.state.scatter.scatter.identity.name }}</p>
            <p><strong>EOS account name:</strong> {{ $store.state.scatter.scatter.identity.accounts.find(acc => acc.blockchain === 'eos').name }}</p>
            <p>If these details are correct, click 'Ok'. Otherwise, click 'Go back' to set a different identity.</p>
            <v-card-actions>
              <v-btn
                color="primary"
                @click="confirmIdentity"
              >
                Ok
              </v-btn>
              <v-btn
                @click="forgetIdentity"
              >
                Go back
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-stepper-content>

      </v-stepper-items>
    </v-stepper>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      requestIdentityError: null,
      forgetIdentityError: null,
    };
  },
  computed: {
    val() {
      if (this.$store.state.scatter.scatter == null) {
        return 1;
      } else if (this.$store.state.scatter.scatter.identity == null) {
        return 2;
      }
      return 3;
    },
  },
  methods: {
    addNetwork() {
      this.$store.dispatch('suggestNetwork');
    },
    requestIdentity() {
      this.requestIdentityError = null;
      this.$store.dispatch('requestIdentity').then(() => {
      }, (err) => {
        this.requestIdentityError = err.message;
      });
    },
    forgetIdentity() {
      this.forgetIdentityError = null;
      this.$store.dispatch('forgetIdentity').then(() => {
      }, (err) => {
        this.forgetIdentityError = err.message;
      });
    },
    confirmIdentity() {
      this.$store.dispatch('confirmIdentity');
    },
  },
};
</script>
