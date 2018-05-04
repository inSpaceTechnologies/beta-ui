<template>
  <div>
    <div v-if="$auth.ready()">
      <navbar></navbar>
      <router-view></router-view>
    </div>
    <div v-if="!$auth.ready()">
      Loading ...
    </div>
  </div>
</template>
<script>
</script>
