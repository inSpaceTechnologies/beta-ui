<!--
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->
<template>
  <modal-dialog :show="this.$store.state.stringPrompt.active">
    <div class="card">
      <div class="card-header">
        <span class="card-title">
          {{ this.$store.state.stringPrompt.text }}
        </span>
      </div>
      <div class="card-content">
        <form @submit.prevent="confirm">
          <div class="form-element">
            <input
              v-focus
              id="val"
              :value="value"
              type="text"
              name="val"
              @input="updateValue"
            >
          </div>
          <div class="form-element">
            <button
              type="submit"
            >
              Ok
            </button>
            <button
              type="button"
              @click="cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </modal-dialog>
</template>

<script>
import { mapState } from 'vuex';
import focus from '../directives/focus';

export default {
  directives: {
    focus,
  },
  computed: {
    ...mapState({
      value: state => state.stringPrompt.value,
    }),
  },
  methods: {
    updateValue(event) {
      this.$store.commit('setValue', event.target.value);
    },
    confirm() {
      this.$store.state.stringPrompt.resolve(this.value);
      this.$store.dispatch('closeStringPrompt');
    },
    cancel() {
      this.$store.state.stringPrompt.resolve('');
      this.$store.dispatch('closeStringPrompt');
    },
  },
};
</script>
