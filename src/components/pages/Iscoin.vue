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
          iSCoin
        </span>
      </div>
      <div class="card-content">
        <div v-if="this.$store.state.iscoin.balance !== null">
          Balance: {{ this.$store.state.iscoin.balance + ' ' + currencySymbol }}
          <router-link
            :to="{name: 'purchase'}"
          >
            Purchase more {{ currencySymbol }}.
          </router-link>
          <h2>Stakes</h2>
          <ul>
            <li
              v-for="(stake, index) in $store.state.iscoin.stakes"
              :key="index + '-stake'"
            >
              {{ stake.quantity + ' ' + currencySymbol + ' from ' + stake.start + ' for ' + stake.duration + ' seconds.' }}
            </li>
          </ul>
          <button
            type="button"
            @click="addStake()"
          >
            Add a stake...
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import logger from '../../logger';

export default {
  data() {
    return {
      currencySymbol: process.env.CURRENCY_SYMBOL, // can't have this in {{ }} because webpack deals with setting it
    };
  },
  methods: {
    async addStake() {
      const quantity = await this.$store.dispatch('openStringPrompt', {
        text: 'Enter stake quantity',
        value: '',
      });
      if (!quantity) {
        return;
      }
      const durationString = await this.$store.dispatch('openStringPrompt', {
        text: 'Enter stake duration in seconds',
        value: '',
      });
      const duration = parseInt(durationString, 10);
      if (!duration) {
        return;
      }
      await this.$store.dispatch('addStake', { quantity, duration }).catch((err) => {
        logger.error(err);
      });
      // refresh
      await this.$store.dispatch('getIscoinData');
    },
  },
};
</script>
