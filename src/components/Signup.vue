<template>
  <div>
    <h1>Sign up</h1>
    <form v-on:submit.prevent="signup()">
      <label><input v-model="data.body.email"/>Email address</label>
      <label><input v-model="data.body.password" type="password" />Password</label>
      <label><input v-model="data.autoLogin" type="checkbox" />Auto Login</label>
      <label><input v-model="data.rememberMe" type="checkbox" />Remember Me</label>
      <button type="submit">Sign up</button>
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
          autoLogin: false,
          rememberMe: false
        },
        error: null
      };
    },
    mounted() {
    },
    methods: {
      signup: function () {
        var redirect = 'login';
        if (this.data.autoLogin) {
          redirect = 'home';
        }
        this.$auth.register({
          //url: '/signup',
          data: this.data.body,
          autoLogin: this.data.autoLogin,
          rememberMe: this.data.rememberMe,
          redirect: { name: redirect },
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
