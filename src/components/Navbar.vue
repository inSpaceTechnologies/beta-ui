<!--
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->
<template>
  <v-toolbar>
    <v-btn
      :to="{ name: 'home' }"
      active-class
      exact
      flat
    >
      <v-toolbar-title>inSpace</v-toolbar-title>
    </v-btn>
    <v-spacer/>
    <v-toolbar-items>
      <v-btn
        :to="{name: 'home'}"
        exact
        flat
      >
        Home
      </v-btn>
    </v-toolbar-items>
    <v-toolbar-items v-show="!$auth.check()">
      <v-btn
        :to="{name: 'login'}"
        exact
        flat
      >
        Log in
      </v-btn>
      <v-btn
        :to="{name: 'signup'}"
        exact
        flat
      >
        Sign up
      </v-btn>
    </v-toolbar-items>
    <v-toolbar-items v-show="$auth.check()">
      <v-btn
        flat
        @click="logout()"
      >
        Log out
      </v-btn>
    </v-toolbar-items>
  </v-toolbar>
</template>

<script>
export default {
  methods: {
    logout() {
      this.$auth.logout({
        makeRequest: false, // just delete token
      });
    },
  },
};
</script>
