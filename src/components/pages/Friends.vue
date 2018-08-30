<!--
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->
<template>
  <div>
    <h2>Sent friend requests</h2>
    <ul>
      <li
        v-for="(request, index) in $store.state.friends.sentRequests"
        :key="index + '-sent'"
      >
        {{ request }}
      </li>
    </ul>
    <h2>Received friend requests</h2>
    <ul>
      <li
        v-for="(request, index) in $store.state.friends.receivedRequests"
        :key="index + '-received'"
      >
        {{ request }}
      </li>
    </ul>
    <h2>Friends</h2>
    <ul>
      <li
        v-for="(friend, index) in $store.state.friends.friends"
        :key="index + '-friend'"
      >
        {{ friend }}
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  methods: {
    sendFriendRequest() {
    },
  },
};
</script>
