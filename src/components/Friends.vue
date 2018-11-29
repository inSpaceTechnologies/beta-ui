<!--
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->
<template>
  <div class="central">
    <div
      v-if="!isMe"
      class="card"
    >
      <div class="card-header">
        <span class="card-title">
          Friends
        </span>
      </div>
      <div class="card-content">
        <ul>
          <li
            v-for="(friend, index) in friends"
            :key="index + '-friend'"
          >
            <router-link
              :to="{name: 'about', params: { accountName: friend }}"
              exact
              class="router-link"
            >
              {{ friend }}
            </router-link>
          </li>
        </ul>
      </div>
    </div>
    <div
      v-if="isMe"
      class="card"
    >
      <div class="card-header">
        <span class="card-title">
          Friends
        </span>
      </div>
      <div class="card-content">
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
              :to="{name: 'about', params: { accountName: friend }}"
              exact
              class="router-link"
            >
              {{ friend }}
            </router-link>
          </li>
        </ul>
        <h2>Seach accounts</h2>
        <input
          type="text"
          @input="onSearch"
        >
        <ul>
          <li
            v-for="(result, index) in searchResults"
            :key="index + '-result'"
          >
            {{ result.accountName }}
            <button
              type="button"
              @click="sendFriendRequest(result.accountName)"
            >
              Send friend request
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
import * as JsSearch from 'js-search';
import logger from '../logger';

export default {
  props: {
    accountName: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      search: null,
      searchResults: [],
    };
  },
  computed: {
    isMe() {
      if (this.accountName === this.$store.getters.accountName) {
        return true;
      }
      return false;
    },
    friends() {
      return this.$store.state.friends.allFriends[this.accountName];
    },
  },
  async created() {
    const accountList = await this.$store.dispatch('getAccountList');
    this.search = new JsSearch.Search('accountName');
    this.search.indexStrategy = new JsSearch.AllSubstringsIndexStrategy();
    this.search.searchIndex = new JsSearch.UnorderedSearchIndex();
    this.search.addIndex('accountName');
    this.search.addDocuments(accountList);
  },
  methods: {
    sendFriendRequest(r) {
      const send = (recipient) => {
        this.$store.dispatch('addFriendRequest', recipient).then(() => this.$store.dispatch('getFriends')).then(() => {
        }, (err) => {
          logger.notify({
            title: 'Error',
            text: err.message,
            type: 'error',
            permanent: false,
            sticky: true,
            buttons: [],
          });
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
    onSearch(evt) {
      const query = evt.target.value;
      this.searchResults = this.search.search(query);
    },
  },
};
</script>
