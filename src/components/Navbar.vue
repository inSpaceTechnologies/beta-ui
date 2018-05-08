<template>
  <v-toolbar>
    <v-btn active-class exact :to="{name: 'home'}" flat>
      <v-toolbar-title>inSpace</v-toolbar-title>
    </v-btn>
    <v-spacer></v-spacer>
    <v-toolbar-items>
      <v-btn exact :to="{name: 'home'}" flat>Home</v-btn>
    </v-toolbar-items>
    <v-toolbar-items v-show="!$auth.check()">
      <v-btn exact :to="{name: 'login'}" flat>Log in</v-btn>
      <v-btn exact :to="{name: 'signup'}" flat>Sign up</v-btn>
    </v-toolbar-items>
    <v-toolbar-items v-show="$auth.check()">
      <v-btn v-on:click="logout()" flat>Log out</v-btn>
    </v-toolbar-items>
  </v-toolbar>
</template>

<script>
    export default {
      methods: {
        logout() {
          this.$auth.logout({
              makeRequest: false, // just delete token
          });
        }
      }
    }
</script>
