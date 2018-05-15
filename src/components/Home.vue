<template>
  <div>
    <scatter-setup/>
    <ul v-if="$store.state.filespace.filespace">
      <filespace-item
        :id="0"
      />
    </ul>
  </div>
</template>
<script>
</script>
