<!--
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->
<template>
  <div id="wrapper">
    <template v-if="$auth.ready()">
      <navbar id="navbar"/>
      <div id="content">
        <router-view/>
      </div>
      <string-prompt/>
    </template>
    <template v-else>
      Loading ...
    </template>
  </div>
</template>
<style>
html {
  height: 100%;
  font-size: 80%;
}
body {
  font-size: 1rem;
  font-family: Roboto;
  height: 100%;
  /* makes the body non-scrollable (we will add scrolling to main content container) */
  overflow: hidden;
  display: flex;
  box-sizing: border-box;
}
#wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
#navbar {
  flex-shrink: 0;
}
#content {
  /* ensures that the container will take up the full height of the parent container */
  flex-grow: 1;
  /* adds scroll to this container */
  overflow-y: auto;
  display: flex;
}

.central {
    max-width: 55.5rem;
    margin: 0 auto;
    flex-grow: 1;
}
.central.small {
    max-width: 30rem;
}
</style>
<script>
</script>
