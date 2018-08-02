<!--
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->
<template>
  <div class="navbar">
    <router-link
      :to="{ name: 'home' }"
      exact
      class="router-link logo-link"
    >
      <img
        class="logo-img"
        src="../images/inspace-logo.png"
      >
    </router-link>
    <router-link
      :to="{name: 'home'}"
      exact
      class="router-link"
    >
      Home
    </router-link>
    <template v-if="!$auth.check()">
      <router-link
        :to="{name: 'login'}"
        exact
        class="router-link"
      >
        Log in
      </router-link>
      <router-link
        :to="{name: 'signup'}"
        exact
        class="router-link"
      >
        Sign up
      </router-link>
    </template>
    <template v-if="$auth.check()">
      <a
        href=""
        class="router-link"
        @click="logout()"
      >
        Log out
      </a>
    </template>
  </div>
</template>
<style scoped>
.navbar {
  display: flex;
  background-color: #404040;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  padding: 0 0.5rem;
}
.router-link {
    color: rgba(255,255,255,0.5);
    padding: 0.5rem;
    text-decoration: none;
}
.router-link-exact-active {
    color: rgba(255,255,255,1.0);
}
.logo-link {
    flex-grow: 1;
}
.logo-img {
  height: 2.45rem;
  width: auto;
}
</style>
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
