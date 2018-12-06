<!--
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->
<template>
  <div class="central">
    <div id="user-banner">
      <div id="profile-picture-column">
        <img
          id="profile-picture"
          src="../../images/profile.png"
        >
      </div>
      <div id="main-column">
        <div id="name-row">
          <span id="name-heading">{{ accountName }}</span>
        </div>
        <div id="buttons-row">
          <router-link
            :to="{ name: 'about', params: { accountName }}"
            class="button"
          >
            About
          </router-link>
          <router-link
            :to="{ name: 'friends', params: { accountName }}"
            class="button"
          >
            Friends
          </router-link>
        </div>
      </div>
    </div>
    <component
      :is="tab"
      :account-name="accountName"
    />
  </div>
</template>
<style scoped>
#user-banner {
  background-color: #555;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
#profile-picture {
  width: 11rem;
  height: 11rem;
  margin: .7rem;
  border: .21rem solid #FFF;
}
#main-column {
  align-self: flex-end;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
#buttons-row {
  background-color: silver;
  display: flex;
}
.button {
  border-style: solid;
  border-color: #666;
  border-width: 1px;
  border-radius: 0;
  color: #292b2c;
  background-color: #fff;
  padding: .5rem 1rem;
}
.button:hover {
  color: #292b2c;
  background-color: #e6e6e6;
  border-color: #adadad;
}
.button.router-link-exact-active {
  opacity: 0.65;
  pointer-events: none;
}
#name-row {
  display: flex;
}
#name-heading {
  padding-left: 1rem;
  padding-bottom: .5rem;
  color: white;
  font-size: 1.75rem;
}
</style>
<script>
export default {
  props: {
    tab: {
      type: String,
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
  },
};
</script>
