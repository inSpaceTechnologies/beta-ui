<!--
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->
<template>
  <v-app>
    <div v-if="$auth.ready()">
      <navbar/>
      <v-content>
        <v-container>
          <router-view/>
        </v-container>
      </v-content>
    </div>
    <div v-if="!$auth.ready()">
      Loading ...
    </div>
    <string-prompt/>
  </v-app>
</template>
<script>
</script>
