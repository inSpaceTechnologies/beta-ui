<!--
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->
<template>
  <modal-dialog :show="showModal">
    <div class="card">
      <div class="card-header">
        <span class="card-title">
          {{ title }}
        </span>
      </div>
      <div class="card-content">
        {{ text }}
        <button
          type="button"
          @click="hide"
        >
          Ok
        </button>
      </div>
    </div>
  </modal-dialog>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    triggerShow: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      showModal: false,
    };
  },
  watch: {
    triggerShow() {
      // set showModal when the triggerShow prop is flipped
      this.showModal = true;
    },
  },
  methods: {
    hide() {
      this.showModal = false;
    },
  },
};
</script>
