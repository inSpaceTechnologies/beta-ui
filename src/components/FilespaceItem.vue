<template>
  <li class="filespace-item">
    <v-snackbar
      v-model="errorSnackbar"
      :timeout="6000"
      :top="true"
      color="error"
    >
      {{ errorMessage }}
      <v-btn
        flat
        @click="errorSnackbar = false"
      >
        Close
      </v-btn>
    </v-snackbar>
    <div
      :class="{ folder: isFolder }"
    >
      {{ this.$store.state.filespace.filespace[id].name }}
      <span
        v-if="isFolder"
        :style="{ color: this.$vuetify.theme.primary }"
        class="filespace-button"
        @click="toggle"
      >
        [{{ open ? '-' : '+' }}]
      </span>
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
        v-for="file in this.$store.state.filespace.filespace[id].files"
        :key="file.hash"
      >
        {{ file.name }}
        <a
          :href="ipfsGateway + '/ipfs/' + file.hash"
          :download="file.name"
          target="_blank"
          class="no-underline"
        >
          [Download]
        </a>
      </li>
      <li>
        <span
          :style="{ color: this.$vuetify.theme.primary }"
          class="filespace-button"
          @click="addChild"
        >
          [New folder]
        </span>
      </li>
      <li>
        <span
          :style="{ color: this.$vuetify.theme.primary }"
          class="filespace-button"
          @click="startUpload"
        >
          [Upload file]
        </span>
        <input
          ref="fileInput"
          hidden="true"
          type="file"
          @change="completeUpload"
        >
      </li>
    </ul>
  </li>
</template>
<style scoped>
ul {
  padding-left: 1em;
}
.folder {
  font-weight:bold;
  list-style-type: disc;
}
.filespace-button {
  cursor: pointer;
}
.filespace-button {
  cursor: pointer;
}
.no-underline {
  text-decoration: none;
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
      ipfsGateway: process.env.IPFS_GATEWAY,
      errorSnackbar: false,
      errorMessage: '',
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
      this.$store.dispatch('openStringPrompt', {
        text: 'Enter folder name',
        value: '',
      }).then((value) => {
        if (value) {
          this.$store.dispatch('addChildFolder', { parentIndex: this.id, index: Date.now(), content: { name: value, files: [], folders: [] } }).then(() => {
          }, (err) => {
            logger.error(err);
          });
        }
      });
    },
    startUpload() {
      if (!this.$auth.check()) {
        this.errorMessage = 'Please log in to upload files to inSpace storage.';
        this.errorSnackbar = true;
        return;
      }
      const fileInputElement = this.$refs.fileInput;
      fileInputElement.click();
    },
    completeUpload(event) {
      const file = event.srcElement.files[0];

      const formData = new FormData();
      // This should automatically set the file name and type.
      formData.append('file', file);

      const config = {
        headers: {
          'content-type': 'multipart/form-data',
          Accept: 'application/json',
        },
      };

      this.axios.post('/ipfs/upload', formData, config).then((response) => {
        const newContent = JSON.parse(JSON.stringify(this.$store.state.filespace.filespace[this.id])); // need to clone it
        newContent.files.push({
          name: file.name,
          hash: response.data.hash,
        });

        this.$store.dispatch('addFolder', { index: this.id, content: newContent }).then(() => {
        }, (err) => {
          logger.error(err);
        });
      }, (err) => {
        logger.error(err);
      });
    },
  },
};
</script>
