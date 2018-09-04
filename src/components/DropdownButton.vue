<!--
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->
<template>
  <div @click="clicked">
    <slot />
  </div>
</template>
<script>
export default {
  props: {
    identifier: {
      type: String,
      required: true,
    },
  },
  methods: {
    clicked() {
      this.$store.dispatch('setDropdownOpen', { identifier: this.identifier, value: true });
    },
  },
};
</script>
