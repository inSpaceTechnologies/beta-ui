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
      <span
        v-if="!isFolder && object.currentVersion && object.currentVersion.key"
      >
        (encrypted)
      </span>
      <a
        v-if="!isFolder && object.currentVersion && !object.currentVersion.key"
        :href="ipfsGateway + '/ipfs/' + object.currentVersion.ipfs_hash"
        :download="object.name"
        target="_blank"
      >
        [Download]
      </a>
      <a
        v-if="!isFolder && decryptedBlobUrl"
        :href="decryptedBlobUrl"
        :download="object.name"
        target="_blank"
      >
        [Download decrypted]
      </a>
      <span
        v-if="!isFolder && object.currentVersion && object.currentVersion.key && object.currentVersion.encKey && !decryptedBlobUrl"
        class="filespace-button primary"
        @click="decryptFile"
      >
        [Decrypt]
      </span>
      <span
        v-if="!isFolder && object.currentVersion && object.currentVersion.key && object.currentVersion.encKey"
        class="filespace-button primary"
        @click="shareKey"
      >
        [Share key]
      </span>
      <span
        v-if="!isFolder"
        class="filespace-button primary"
        @click="deleteFile"
      >
        [Delete]
      </span>
      <span
        v-if="!isFolder"
        class="filespace-button primary"
        @click="likeFile"
      >
        [Like]
      </span>
      <span
        v-if="!isFolder"
      >
        {{ object.currentVersion.likes.length }} likes
      </span>
      <span
        v-if="!isFolder"
        class="filespace-button primary"
        @click="post"
      >
        [Post]
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
        :account-name="accountName"
        :public-key="publicKey"
      />
      <filespace-item
        v-for="(file, index) in object.childFiles"
        :key="index + '-file'"
        :object="file"
        :parent="object"
        :is-folder="false"
        :account-name="accountName"
        :public-key="publicKey"
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
          @click="startEncryptedUpload"
        >
          [Upload file encrypted]
        </span>
        <input
          ref="encryptedFileInput"
          hidden="true"
          type="file"
          @change="completeEncryptedUpload"
        >
      </li>
      <li v-if="isFolder">
        <span
          class="filespace-button primary"
          @click="post"
        >
          [Post]
        </span>
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
// for non-api requests
import axios from 'axios';
import logger from '../logger';
import inspaceAPI from '../inspaceapi';
import encryption from '../encryption';

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
    // null means it's the user's own account
    accountName: {
      type: String,
      required: false,
      default: null,
    },
    // the account's active public key
    publicKey: {
      type: String,
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
      decryptedBlobUrl: null,
    };
  },
  methods: {
    toggle() {
      this.open = !this.open;
    },
    async addChildFolder() {
      const value = await this.$store.dispatch('openStringPrompt', {
        text: 'Enter folder name',
        value: '',
      });
      if (value) {
        try {
          await this.$store.dispatch('addFolder', { id: Date.now(), name: value, parent: this.object });
        } catch (err) {
          logger.notifyError(err);
        }
      }
    },
    startUpload() {
      const fileInputElement = this.$refs.fileInput;
      fileInputElement.click();
    },
    startEncryptedUpload() {
      const fileInputElement = this.$refs.encryptedFileInput;
      fileInputElement.click();
    },
    async completeUpload(event) {
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

      try {
        const axiosInstance = await inspaceAPI.getAxiosInstance();
        const response = await axiosInstance.post('/ipfs/upload', formData, config);
        await this.$store.dispatch('addFile', {
          id: Date.now(),
          name: file.name,
          date: Date.now(),
          ipfsHash: response.data.ipfsHash,
          sha256: response.data.sha256,
          parent: this.object,
        });
      } catch (err) {
        logger.notifyError(err);
      }
    },
    async completeEncryptedUpload(event) {
      const file = event.srcElement.files[0];

      try {
        // create a reader for the file
        const reader = new FileReader();

        // set up encryption
        reader.onload = async (evt) => {
          const { publicKey } = this.$store.getters;
          const arrayBuffer = evt.target.result;

          const {
            wrappingIVString, wrappedKeyString, nonce, encryptionIVString, encrypted,
          } = await encryption.encrypt({ publicKey, arrayBuffer, $store: this.$store });

          const formData = new FormData();
          formData.append('file', new Blob([encrypted]), file.name);

          const config = {
            headers: {
              'content-type': 'multipart/form-data',
              Accept: 'application/json',
            },
          };

          const axiosInstance = await inspaceAPI.getAxiosInstance();
          const response = await axiosInstance.post('/ipfs/upload', formData, config);
          await this.$store.dispatch('addFile', {
            id: Date.now(),
            name: file.name,
            date: Date.now(),
            ipfsHash: response.data.ipfsHash,
            sha256: response.data.sha256,
            parent: this.object,
            keyIV: encryptionIVString,
            encryptedKey: wrappedKeyString,
            publicKey,
            encryptedKeyIV: wrappingIVString,
            nonce,
          });
        };

        // start the reader
        reader.readAsArrayBuffer(file);
      } catch (err) {
        logger.notifyError(err);
      }
    },
    async decryptFile() {
      try {
        const url = `${this.ipfsGateway}/ipfs/${this.object.currentVersion.ipfs_hash}`;
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const arrayBuffer = response.data;

        const { nonce } = this.object.currentVersion.encKey;
        const wrappingIVString = this.object.currentVersion.encKey.iv;
        const wrappedKeyString = this.object.currentVersion.encKey.value;

        const decryptedArrayBuffer = await encryption.decrypt({
          nonce,
          wrappingIVString,
          wrappedKeyString,
          arrayBuffer,
          ownerPublicKey: this.publicKey,
          myPublicKey: this.object.currentVersion.encKey.public_key,
          encryptionIVString: this.object.currentVersion.key.iv,
          $store: this.$store,
        });
        this.decryptedBlobUrl = URL.createObjectURL(new Blob([decryptedArrayBuffer]));
      } catch (err) {
        logger.notifyError(err);
      }
    },
    async shareKey() {
      const accountName = await this.$store.dispatch('openStringPrompt', {
        text: 'Enter account name',
        value: '',
      });
      if (!accountName) {
        return;
      }
      try {
        const { publicKey } = this.$store.getters;
        // get the account's public key
        const recipientPublicKey = await this.$store.dispatch('getActivePublicKey', { accountName });

        const {
          wrappingIVString,
          wrappedKeyString,
          nonce,
        } = await encryption.shareKey({
          publicKey,
          recipientPublicKey,
          $store: this.$store,
          nonce: this.object.currentVersion.encKey.nonce,
          wrappingIVString: this.object.currentVersion.encKey.iv,
          wrappedKeyString: this.object.currentVersion.encKey.value,
          encryptionIVString: this.object.currentVersion.key.iv,
        });

        await this.$store.dispatch('shareKey', {
          id: Date.now(),
          keyID: this.object.currentVersion.key.id,
          publicKey: recipientPublicKey,
          encryptedKeyIV: wrappingIVString,
          nonce,
          encryptedKey: wrappedKeyString,
        });
      } catch (err) {
        logger.notifyError(err);
      }
    },
    async deleteFolder() {
      try {
        await this.$store.dispatch('deleteFolder', {
          object: this.object,
          parent: this.parent,
        });
      } catch (err) {
        logger.notifyError(err);
      }
    },
    async deleteFile() {
      try {
        const hash = this.object.currentVersion.ipfs_hash;
        await this.$store.dispatch('deleteFile', {
          object: this.object,
          parent: this.parent,
        });
        // unpin if there are no instances of the file in filespace
        if (!this.$store.getters.containsHash(hash)) {
          const axiosInstance = await inspaceAPI.getAxiosInstance();
          const response = await axiosInstance.put(`/ipfs/unpin/${hash}`);
          logger.log(response.data.pinset);
        } else {
          logger.log('Did not unpin');
        }
      } catch (err) {
        logger.notifyError(err);
      }
    },
    async likeFile() {
      try {
        await this.$store.dispatch('likeVersion', {
          version: this.object.currentVersion,
          accountName: this.accountName,
        });
      } catch (err) {
        logger.notifyError(err);
      }
    },
    async post() {
      try {
        const caption = await this.$store.dispatch('openStringPrompt', {
          text: 'Enter caption',
          value: '',
        });
        if (!caption) {
          return;
        }
        await this.$store.dispatch('addPost', {
          id: Date.now(),
          isFolder: this.isFolder,
          subject: this.object,
          caption,
        });
      } catch (err) {
        logger.notifyError(err);
      }
    },
  },
};
</script>
