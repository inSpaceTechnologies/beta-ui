<!--
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->
<template>
  <div>
    <button
      type="button"
      @click="sendFriendRequest()"
    >
      Send a new friend request...
    </button>
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
        <!-- Accept a friend request by sending a friend request to the requester -->
        <button
          type="button"
          @click="sendFriendRequest(request)"
        >
          Accept
        </button>
      </li>
    </ul>
    <h2>Friends</h2>
    <ul>
      <li
        v-for="(friend, index) in $store.state.friends.friends"
        :key="index + '-friend'"
      >
        <router-link
          :to="{name: 'filespace', params: { accountname: friend }}"
          exact
          class="router-link"
        >
          {{ friend }}
        </router-link>
      </li>
    </ul>
  </div>
</template>
<script>
import logger from '../../logger';

export default {
  methods: {
    sendFriendRequest(r) {
      const send = (recipient) => {
        this.$store.dispatch('addFriendRequest', recipient).then(() => this.$store.dispatch('getFriends')).then(() => {
        }, (err) => {
          logger.error(err);
        });
      };
      if (r) {
        send(r);
      } else {
        this.$store.dispatch('openStringPrompt', {
          text: 'Enter account name',
          value: '',
        }).then((value) => {
          if (value) {
            send(value);
          }
        });
      }
    },
  },
};
</script>
