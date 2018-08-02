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
        <form>
          <div class="form-element align">
            <label for="email">
              Email:
            </label>
            <input
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
              type="button"
              @click="login"
            >
              Log in
            </button>
          </div>
        </form>
      </div>
    </div>
    <alert
      :title="alertTitle"
      :text="alertText"
      :trigger-show="showAlert"
    />
  </div>
</template>
<script>
export default {
  data() {
    return {
      data: {
        body: {
          email: '',
          password: '',
        },
        remember: false,
      },
      showAlert: false,
      alertTitle: '',
      alertText: '',
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
          this.alertTitle = 'Error';
          this.alertText = res.response.data;
          // need to flip it
          this.showAlert = !this.showAlert;
        },
      });
    },
  },
};
</script>
