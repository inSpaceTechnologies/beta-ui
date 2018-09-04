<!--
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->
<template>
  <div
    v-on-clickaway="clickAway"
    v-if="this.$store.state.dropdown.open[identifier]"
  >
    <slot />
  </div>
</template>
<script>
import { mixin as clickaway } from 'vue-clickaway';

export default {
  mixins: [clickaway],
  props: {
    identifier: {
      type: String,
      required: true,
    },
  },
  methods: {
    clickAway() {
      this.$store.dispatch('setDropdownOpen', { identifier: this.identifier, value: false });
    },
  },
};
</script>
