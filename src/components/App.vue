<template>
  <v-app>
    <div v-if="$auth.ready()">
      <navbar></navbar>
      <v-content>
        <v-container>
          <router-view></router-view>
        </v-container>
      </v-content>
    </div>
    <div v-if="!$auth.ready()">
      Loading ...
    </div>
  </v-app>
</template>
<script>
</script>
