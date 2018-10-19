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
          Purchase iSCoin
        </span>
      </div>
      <div class="card-content">
        <template v-if="bitcoinTransaction">
          <ul>
            <li>
              You are purchasing {{ bitcoinTransaction.purchaseAmount + ' ' + currencySymbol }}.
            </li>
            <li>
              Please send a total of {{ bitcoinTransaction.amount }} BTC to {{ bitcoinTransaction.address }}.
            </li>
            <li>
              {{ bitcoinTransaction.amountReceived ? bitcoinTransaction.amountReceived : '0' }} BTC has already been received.
            </li>
            <li>
              This transaction will expire on {{ new Date(bitcoinTransaction.expiryDate).toLocaleString() }} (local time).
            </li>
          </ul>
        </template>
        <button
          v-else
          type="button"
          @click="bitcoinIscoinPurchase()"
        >
          Purchase iSCoin with Bitcoin
        </button>
        <template v-if="eosTransaction">
          <ul>
            <li>
              You are purchasing {{ eosTransaction.purchaseAmount + ' ' + currencySymbol }}.
            </li>
            <li>
              Please send a total of {{ eosTransaction.amount }} EOS to {{ eosTransaction.eosDepositAccount }} with the memo {{ eosTransaction.memo }}.
            </li>
            <li>
              {{ eosTransaction.amountReceived ? eosTransaction.amountReceived : '0' }} EOS has already been received.
            </li>
            <li>
              This transaction will expire on {{ new Date(eosTransaction.expiryDate).toLocaleString() }} (local time).
            </li>
          </ul>
        </template>
        <button
          v-else
          type="button"
          @click="eosIscoinPurchase()"
        >
          Purchase iSCoin with EOS
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import logger from '../../logger';
import inspaceAPI from '../../inspaceapi';

export default {
  data() {
    return {
      bitcoinTransaction: null,
      eosTransaction: null,
      currencySymbol: process.env.CURRENCY_SYMBOL, // can't have this in {{ }} because webpack deals with setting it
    };
  },
  async mounted() {
    const eosAccount = this.$store.getters.accountName;
    const axiosInstance = await inspaceAPI.getAxiosInstance();
    let response;
    try {
      response = await axiosInstance.get(`/purchase/iscoin/${eosAccount}`);
    } catch (err) {
      logger.error(err.response.data);
      return;
    }
    this.bitcoinTransaction = response.data.bitcoinTransaction;
    this.eosTransaction = response.data.eosTransaction;
  },
  methods: {
    async getPurchaseAmount() {
      const purchaseAmountString = await this.$store.dispatch('openStringPrompt', {
        text: 'Enter amount',
        value: '',
      });
      return parseFloat(purchaseAmountString);
    },
    async bitcoinIscoinPurchase() {
      const eosAccount = this.$store.getters.accountName;
      const purchaseAmount = await this.getPurchaseAmount();
      if (purchaseAmount <= 0) {
        return;
      }
      const axiosInstance = await inspaceAPI.getAxiosInstance();
      let response;
      try {
        response = await axiosInstance.post('/purchase/iscoin/btc', { purchaseAmount, eosAccount });
      } catch (err) {
        logger.error(err.response.data);
        return;
      }
      this.bitcoinTransaction = response.data;
    },
    async eosIscoinPurchase() {
      const eosAccount = this.$store.getters.accountName;
      const purchaseAmount = await this.getPurchaseAmount();
      if (purchaseAmount <= 0) {
        return;
      }
      const axiosInstance = await inspaceAPI.getAxiosInstance();
      let response;
      try {
        response = await axiosInstance.post('/purchase/iscoin/eos', { purchaseAmount, eosAccount });
      } catch (err) {
        logger.error(err.response.data);
        return;
      }
      this.eosTransaction = response.data;
    },
  },
};
</script>
