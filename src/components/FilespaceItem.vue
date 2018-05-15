<template>
  <li class="filespace-item">
    <div
      :class="{ folder: isFolder }"
      @click="toggle"
    >
      {{ this.$store.state.filespace.filespace[id].name }}
      <span v-if="isFolder">[{{ open ? '-' : '+' }}]</span>
    </div>
    <ul
      v-show="open"
      v-if="isFolder"
    >
      <filespace-item
        v-for="(id, index) in this.$store.state.filespace.filespace[id].folders"
        :key="index"
        :id="id"
      />
      <li
        class="add"
        @click="addChild"
      >
        +
      </li>
    </ul>
  </li>
</template>
<style>
.filespace-item {
  cursor: pointer;
}
.filespace-item ul {
  padding-left: 1em;
}
.filespace-item .folder {
  font-weight:bold;
  list-style-type: disc;
}
</style>
<script>
import logger from '../logger';

export default {
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      open: false,
    };
  },
  computed: {
    isFolder() {
      return this.$store.state.filespace.filespace[this.id].files;
    },
  },
  methods: {
    toggle() {
      if (this.isFolder) {
        this.open = !this.open;
      }
    },
    addChild() {
      const name = prompt('Enter folder name');
      if (name) {
        this.$store.dispatch('addChildFolder', { parentIndex: this.id, index: Date.now(), content: { name, files: [], folders: [] } }).then(() => {
        }, (err) => {
          logger.error(err);
        });
      }
    },
  },
};
</script>
