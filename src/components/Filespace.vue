<!--
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->
<template>
  <div id="root-wrapper">
    <div
      v-if="root"
      id="filespace-background"
      class="semitransparent"
    >
      <ul
        class="central filespace"
      >
        <filespace-item
          :object="root"
          :is-folder="true"
        />
      </ul>
    </div>
    <div v-else>
      <p>Loading...</p>
    </div>
  </div>
</template>
<style scoped>
#root-wrapper {
  display: flex;
  flex-grow: 1;
}
#filespace-background {
  display: flex;
  flex-grow: 1;
  /* make it fill the region */
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  /* for narrow screens (#content padding no longer applied due to the above) */
  padding: 0 2rem;
}
.filespace {
  line-height: 1.5;
  margin-top: 2rem;
}
</style>
<script>
import logger from '../logger';

export default {
  props: {
    accountName: {
      type: String,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      otherRoot: null,
    };
  },
  computed: {
    root() {
      if (this.accountName) {
        return this.otherRoot;
      }
      // NB this.$store.state.filespace.root might not be available immediately
      return this.$store.state.filespace.root;
    },
  },
  created() {
    if (this.accountName) {
      this.$store.dispatch('getOtherFilespace', { accountName: this.accountName }).then((otherRoot) => {
        this.otherRoot = otherRoot;
      }, (err) => {
        logger.error(err.message);
      });
    }
  },
};
</script>
