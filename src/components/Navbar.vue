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
      class="navbar-button logo-link"
    >
      <img
        class="logo-img"
        src="../images/inspace-logo.png"
      >
    </router-link>
    <router-link
      v-if="this.$store.state.scatter.identitySet"
      :to="{ name: 'about', params: { accountName: this.$store.getters.accountName }}"
      exact
      class="navbar-button"
    >
      <font-awesome-icon icon="user" />
      {{ this.$store.getters.accountName }}
    </router-link>
    <router-link
      :to="{name: 'home'}"
      exact
      class="navbar-button"
    >
      <font-awesome-icon icon="home" />
      Home
    </router-link>
    <router-link
      v-if="this.$store.state.scatter.identitySet"
      :to="{name: 'filespace-2d', params: { accountName: this.$store.getters.accountName }}"
      exact
      class="navbar-button"
    >
      <font-awesome-icon icon="folder" />
      Filespace (2D)
    </router-link>
    <router-link
      v-if="this.$store.state.scatter.identitySet"
      :to="{name: 'filespace-3d', params: { accountName: this.$store.getters.accountName }}"
      exact
      class="navbar-button"
    >
      <font-awesome-icon icon="folder" />
      Filespace (3D)
    </router-link>
    <router-link
      v-if="this.$store.state.iscoin.balance !== null"
      :to="{name: 'iscoin'}"
      exact
      class="navbar-button"
    >
      <font-awesome-icon icon="coins" />
      {{ this.$store.state.iscoin.balance + ' ' + currencySymbol }}
    </router-link>
    <div v-if="this.$store.state.scatter.identitySet">
      <dropdown-button
        identifier="friend-requests"
        class="navbar-button"
      >
        Friend requests <font-awesome-icon icon="caret-down"/>
      </dropdown-button>
      <dropdown-menu
        class="dropdown-menu"
        identifier="friend-requests"
      >
        <ul>
          <li v-if="$store.state.friends.receivedRequests.length == 0">
            No friend requests.
          </li>
          <li
            v-for="(request, index) in $store.state.friends.receivedRequests"
            v-else
            :key="index + '-received'"
          >
            {{ request }}
            <!-- Accept a friend request by sending a friend request to the requester -->
            <button
              type="button"
              @click="sendFriendRequest(request)"
            >
              Accept
            </button>
          </li>
        </ul>
      </dropdown-menu>
    </div>
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
.navbar-button {
    color: rgba(255,255,255,0.5);
    padding: 0.5rem;
    text-decoration: none;
    cursor: pointer;
    user-select: none;
}
.navbar-button:hover:not(.router-link-exact-active) {
  color: rgba(255,255,255,0.75);
}
.navbar > .router-link-exact-active {
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
import logger from '../logger';

export default {
  data() {
    return {
      currencySymbol: process.env.CURRENCY_SYMBOL, // can't have this in {{ }} because webpack deals with setting it
    };
  },
  methods: {
    sendFriendRequest(recipient) {
      this.$store.dispatch('addFriendRequest', recipient).then(() => this.$store.dispatch('getFriends')).then(() => {
      }, (err) => {
        logger.error(err);
      });
    },
  },
};
</script>
