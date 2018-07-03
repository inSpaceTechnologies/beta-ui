<!--
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->
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
      {{ object.name }}
      <span
        v-if="isFolder"
        :style="{ color: this.$vuetify.theme.primary }"
        class="filespace-button"
        @click="toggle"
      >
        [{{ open ? '-' : '+' }}]
      </span>
      <a
        v-if="!isFolder && object.currentVersion"
        :href="ipfsGateway + '/ipfs/' + object.currentVersion.ipfsHash"
        :download="object.name"
        target="_blank"
        class="no-underline"
      >
        [Download]
      </a>
    </div>
    <ul
      v-show="open"
      v-if="isFolder"
    >
      <filespace-item
        v-for="(folder, index) in object.childFolders"
        :key="index"
        :object="folder"
        :is-folder="true"
      />
      <filespace-item
        v-for="(file, index) in object.childFiles"
        :key="index"
        :object="file"
        :is-folder="false"
      />
      <li v-if="isFolder">
        <span
          :style="{ color: this.$vuetify.theme.primary }"
          class="filespace-button"
          @click="addChildFolder"
        >
          [New folder]
        </span>
      </li>
      <li v-if="isFolder">
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
    object: {
      type: Object,
      required: true,
    },
    isFolder: {
      type: Boolean,
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
  methods: {
    toggle() {
      this.open = !this.open;
    },
    addChildFolder() {
      this.$store.dispatch('openStringPrompt', {
        text: 'Enter folder name',
        value: '',
      }).then((value) => {
        const newFolder = {
          id: Date.now(),
          name: value,
        };
        if (value) {
          this.$store.dispatch('addFolder', { id: newFolder.id, name: newFolder.name, parentId: this.object.id }).then(() => {
            this.object.childFolders.push(newFolder);
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
        const id = Date.now();
        const newFile = {
          name: file.name,
          id,
          currentVersion: {
            id,
            date: Date.now(),
            ipfsHash: response.data.ipfsHash,
            sha256: response.data.sha256,
          },
        };
        this.$store.dispatch('addFile', {
          id,
          name: newFile.name,
          parentId: this.object.id,
          date: newFile.currentVersion.date,
          ipfsHash: newFile.currentVersion.ipfsHash,
          sha256: newFile.currentVersion.sha256,
        }).then(() => {
          this.object.childFiles.push(newFile);
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
