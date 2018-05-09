<template>
  <div>
    <h1>Sign up</h1>

    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
    >

      <v-alert
        v-show="error"
        :value="true"
        type="error"
      >
        {{ error }}
      </v-alert>

      <v-text-field
        v-model="data.body.email"
        :rules="emailRules"
        label="Email address"
        required
      />

      <v-text-field
        v-model="data.body.password"
        :append-icon="passwordVisible ? 'visibility_off' : 'visibility'"
        :append-icon-cb="() => (passwordVisible = !passwordVisible)"
        :type="passwordVisible ? 'password' : 'text'"
        label="Password"
      />

      <v-checkbox
        v-model="data.autoLogin"
        label="Auto Login"
      />

      <v-checkbox
        v-model="data.rememberMe"
        label="Remember Me"
      />

      <v-btn
        :disabled="!valid"
        @click="signup"
      >
        Sign up
      </v-btn>
    </v-form>
  </div>
</template>
<script>
export default {
  data() {
    return {
      valid: true,
      passwordVisible: true,
      emailRules: [
        v => !!v || 'Email is required',
        v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'Email must be valid',
      ],
      data: {
        body: {
          email: '',
          password: '',
        },
        autoLogin: false,
        rememberMe: false,
      },
      error: null,
    };
  },
  methods: {
    signup() {
      if (this.$refs.form.validate()) {
        let redirect = 'login';
        if (this.data.autoLogin) {
          redirect = 'home';
        }
        this.$auth.register({
          // url: '/signup',
          data: this.data.body,
          autoLogin: this.data.autoLogin,
          rememberMe: this.data.rememberMe,
          redirect: { name: redirect },
          success() {
          },
          error(res) {
            this.error = res.response.data;
          },
        });
      }
    },
  },
};
</script>
