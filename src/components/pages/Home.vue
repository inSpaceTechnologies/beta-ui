<!--
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->
<template>
  <div
    id="home-wrapper"
  >
    <div
      v-if="!$store.state.scatter.scatter || !$store.state.scatter.identitySet"
      class="central"
    >
      <scatter-setup/>
    </div>
    <div
      v-else-if="$store.state.filespace.root"
      id="filespace-background"
      class="semitransparent"
    >
      <ul
        class="central filespace"
      >
        <filespace-item
          :object="$store.state.filespace.root"
          :is-folder="true"
        />
      </ul>
    </div>
  </div>
</template>
<style scoped>
#home-wrapper {
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
</script>
