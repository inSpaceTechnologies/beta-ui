<template>
  <div>
    <router-link :to="{name: 'home'}">Home</router-link>

    <span v-show="!$auth.check()">
      <router-link :to="{name: 'login'}">Log in</router-link>
      <router-link :to="{name: 'signup'}">Sign up</router-link>
    </span>

    <span v-show="$auth.check()">
      {{ $auth.user().email }}
      <a v-on:click="logout()" href="javascript:void(0);">Logout</a>
    </span>
  </div>
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
