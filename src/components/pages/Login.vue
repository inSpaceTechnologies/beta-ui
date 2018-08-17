<!--
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->
<template>
  <div class="central small">
    <div class="card">
      <div class="card-header">
        <span class="card-title">
          Log in
        </span>
      </div>
      <div class="card-content">
        <form @submit.prevent="login">
          <div class="form-element align">
            <label for="email">
              Email:
            </label>
            <input
              v-focus
              id="email"
              v-model="data.body.email"
              type="text"
              name="email"
            >
          </div>
          <div class="form-element align">
            <label for="email">
              Password:
            </label>
            <input
              id="password"
              v-model="data.body.password"
              type="text"
              name="password"
            >
          </div>
          <div class="form-element">
            <input
              id="remember"
              v-model="data.remember"
              type="checkbox"
            >
            <label for="remember">
              Remember me
            </label>
          </div>
          <div class="form-element right">
            <button
              type="submit"
            >
              Log in
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script>
import logger from '../../logger';
import focus from '../../directives/focus';

export default {
  directives: {
    focus,
  },
  data() {
    return {
      data: {
        body: {
          email: '',
          password: '',
        },
        remember: false,
      },
    };
  },
  methods: {
    login() {
      const redirect = this.$auth.redirect();

      this.$auth.login({
        // url: '/login',
        data: this.data.body,
        rememberMe: this.data.remember,
        // if we were redirected to this login page, go back after login
        redirect: { name: redirect ? redirect.from.name : 'home' },
        success() {
        },
        error(res) {
          logger.notify({
            title: 'Error',
            text: res.response.data,
            type: 'error',
            permanent: false,
            sticky: true,
            buttons: [],
          });
        },
      });
    },
  },
};
</script>
