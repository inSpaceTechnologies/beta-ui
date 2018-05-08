<template>
  <div>
    <h1>Log in</h1>

    <v-form ref="form" v-model="valid" lazy-validation>

      <v-alert v-show="error" :value="true" type="error">
        {{ error }}
      </v-alert>

      <v-text-field
        v-model="data.body.email"
        :rules="emailRules"
        label="Email address"
        required
      ></v-text-field>

      <v-text-field
        v-model="data.body.password"
        :append-icon="passwordVisible ? 'visibility_off' : 'visibility'"
        :append-icon-cb="() => (passwordVisible = !passwordVisible)"
        :type="passwordVisible ? 'password' : 'text'"
        label="Password"
      ></v-text-field>

      <v-checkbox
        v-model="data.rememberMe"
        label="Remember Me"
      ></v-checkbox>

      <v-btn
        :disabled="!valid"
        @click="login"
      >
        Log in
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
         v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'Email must be valid'
        ],
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

        if (this.$refs.form.validate()) {
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
  }
</script>
