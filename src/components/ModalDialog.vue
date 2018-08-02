<!--
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->
<template>
  <div class="modal-dialog">
    <slot v-if="show"/>
  </div>
</template>
<script>
import ModalBackground from '../ui/modal-background';

export default {
  props: {
    show: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  watch: {
    show() {
      if (this.show) {
        ModalBackground.show();
      } else {
        ModalBackground.hide();
      }
    },
  },
};
</script>
