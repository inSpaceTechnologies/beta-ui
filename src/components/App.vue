<template>
  <v-app>
    <div v-if="$auth.ready()">
      <navbar/>
      <v-content>
        <v-container>
          <router-view/>
        </v-container>
      </v-content>
    </div>
    <div v-if="!$auth.ready()">
      Loading ...
    </div>
    <string-prompt/>
  </v-app>
</template>
<script>
</script>
