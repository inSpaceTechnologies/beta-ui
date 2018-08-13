<!--
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->
<template>
  <li class="filespace-item">
    <alert
      :title="alertTitle"
      :text="alertText"
      :trigger-show="showAlert"
    />
    <div
      :class="{ folder: isFolder }"
    >
      {{ object.name }}
      <span
        v-if="isFolder"
        class="filespace-button primary"
        @click="toggle"
      >
        [{{ open ? '-' : '+' }}]
      </span>
      <a
        v-if="!isFolder && object.currentVersion"
        :href="ipfsGateway + '/ipfs/' + object.currentVersion.ipfs_hash"
        :download="object.name"
        target="_blank"
      >
        [Download]
      </a>
      <span
        v-if="!isFolder"
        class="filespace-button primary"
        @click="deleteFile"
      >
        [Delete]
      </span>
    </div>
    <ul
      v-show="open"
      v-if="isFolder"
    >
      <filespace-item
        v-for="(folder, index) in object.childFolders"
        :key="index + '-folder'"
        :object="folder"
        :parent="object"
        :is-folder="true"
      />
      <filespace-item
        v-for="(file, index) in object.childFiles"
        :key="index + '-file'"
        :object="file"
        :parent="object"
        :is-folder="false"
      />
      <li v-if="isFolder">
        <span
          class="filespace-button primary"
          @click="addChildFolder"
        >
          [New folder]
        </span>
      </li>
      <li v-if="isFolder">
        <span
          class="filespace-button primary"
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
      <li v-if="isFolder">
        <span
          class="filespace-button primary"
          @click="deleteFolder"
        >
          [Delete]
        </span>
      </li>
    </ul>
  </li>
</template>
<style scoped>
.folder {
  font-weight:bold;
  list-style-type: disc;
}
.filespace-button {
  cursor: pointer;
}
</style>
<script>
import logger from '../logger';

function notifyError(message) {
  logger.notify({
    title: 'Error',
    text: message,
    type: 'error',
    permanent: false,
    sticky: true,
    buttons: [],
  });
}

export default {
  props: {
    object: {
      type: Object,
      required: true,
    },
    parent: {
      type: Object,
      required: false,
      default: null,
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
      showAlert: false,
      alertTitle: '',
      alertText: '',
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
        if (value) {
          this.$store.dispatch('addFolder', { id: Date.now(), name: value, parent: this.object }).then(() => {
          }, (err) => {
            notifyError(err);
          });
        }
      });
    },
    startUpload() {
      if (!this.$auth.check()) {
        notifyError('Please log in to upload files to inSpace storage.');
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
        this.$store.dispatch('addFile', {
          id: Date.now(),
          name: file.name,
          date: Date.now(),
          ipfsHash: response.data.ipfsHash,
          sha256: response.data.sha256,
          parent: this.object,
        }).then(() => {

        }, (err) => {
          notifyError(err);
        });
      }, (err) => {
        notifyError(err);
      });
    },
    deleteFolder() {
      this.$store.dispatch('deleteFolder', {
        object: this.object,
        parent: this.parent,
      }).then(() => {
      }, (err) => {
        notifyError(err);
      });
    },
    deleteFile() {
      const hash = this.object.currentVersion.ipfs_hash;
      this.$store.dispatch('deleteFile', {
        object: this.object,
        parent: this.parent,
      }).then(() => {
        // unpin if there are no instances of the file in filespace
        if (!this.$store.getters.containsHash(hash)) {
          this.axios.put(`/ipfs/unpin/${hash}`).then((response) => {
            logger.log(response.data.pinset);
          });
        } else {
          logger.log('Did not unpin');
        }
      }, (err) => {
        notifyError(err);
      });
    },
  },
};
</script>
