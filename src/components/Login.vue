<template>
  <div>
    <h1>Log in</h1>
    <form v-on:submit.prevent="login()">
      <label><input v-model="data.body.email"/>Email address</label>
      <label><input v-model="data.body.password" type="password" />Password</label>
      <label><input v-model="data.rememberMe" type="checkbox" />Remember Me</label>
      <button type="submit">Login</button>
      <div v-show="error">{{ error }}</div>
    </form>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        data: {
          body: {
              email: '',
              password: ''
          },
          rememberMe: false
        },
        error: null
      };
    },
    methods: {
      login: function () {

        var redirect = this.$auth.redirect();

        this.$auth.login({
          //url: '/login',
          data: this.data.body,
          rememberMe: this.data.rememberMe,
          // if we were redirected to this login page, go back after login
          redirect: {name: redirect ? redirect.from.name : 'home'},
          success: function () {
          },
          error: function (res) {
            this.error = res.response.data;
          }
        });
      }
    }
  }
</script>
