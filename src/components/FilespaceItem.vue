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
        v-if="!isFolder && object.currentVersion && object.currentVersion.key && object.currentVersion.encKey"
        class="filespace-button primary"
        @click="decryptFile"
      >
        [Decrypt]
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
      />
      <filespace-item
        v-for="(file, index) in object.childFiles"
        :key="index + '-file'"
        :object="file"
        :parent="object"
        :is-folder="false"
        :account-name="accountName"
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

function notifyError(err) {
  if (!err.message) {
    return;
  }
  logger.notify({
    title: 'Error',
    text: err.message,
    type: 'error',
    permanent: false,
    sticky: true,
    buttons: [],
  });
}

// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function generateNonce(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let text = '';
  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// https://stackoverflow.com/questions/43131242/how-to-convert-a-hexademical-string-of-data-to-an-arraybuffer-in-javascript
function hexStringToArrayBuffer(str) {
  const typedArray = new Uint8Array(str.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16)));
  return typedArray.buffer;
}
// https://stackoverflow.com/questions/40031688/javascript-arraybuffer-to-hex
function arrayBufferToHexString(buffer) {
  return Array
    .from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
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
    // null means it's the user's own account
    accountName: {
      type: String,
      required: false,
      default: null,
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
          notifyError(err);
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
        notifyError(err);
      }
    },
    async completeEncryptedUpload(event) {
      // initialisation vector for AES-CBC
      function generateIV() {
        return window.crypto.getRandomValues(new Uint8Array(16));
      }

      const file = event.srcElement.files[0];

      try {
        // create a reader for the file
        const reader = new FileReader();

        // set up encryption
        reader.onload = async (evt) => {
          // generate key
          const key = await window.crypto.subtle.generateKey({ name: 'AES-CBC', length: 256 }, true, ['encrypt']);

          // generate nonce string
          const nonce = generateNonce(16);

          // get shared secret (between own public and private key)
          const { publicKey } = this.$store.getters;
          // {fromPublicKey, toPublicKey, fromBlockchain, toBlockchain, nonce}
          const sharedSecretString = await this.$store.state.scatter.scatter.getEncryptionKey(publicKey, publicKey, 'eos', 'eos', nonce);
          const sharedSecretArrayBuffer = hexStringToArrayBuffer(sharedSecretString);
          // shared secret is 512 bit hex (Scatter takes the SHA512 hash). we need 256 bits for AES-CBC.
          const sharedSecret256ArrayBuffer = await window.crypto.subtle.digest({ name: 'SHA-256', length: 256 }, sharedSecretArrayBuffer);

          // turn the shared secret into a wrapping key
          const wrappingKey = await window.crypto.subtle.importKey('raw', sharedSecret256ArrayBuffer, { name: 'AES-CBC', length: 256 }, false, ['wrapKey']);

          // generate iv for wrapping
          const wrappingIV = generateIV();

          // convert iv to hex string for storage
          const wrappingIVString = arrayBufferToHexString(wrappingIV.buffer);

          // wrap the key
          const wrappedKeyArrayBuffer = await crypto.subtle.wrapKey('raw', key, wrappingKey, { name: 'AES-CBC', length: 256, iv: wrappingIV });

          // convert the wrapped key to a hex string for storage
          const wrappedKeyString = arrayBufferToHexString(wrappedKeyArrayBuffer);

          // generate iv for encryption
          const encryptionIV = generateIV();

          // convert iv to hex string for storage
          const encryptionIVString = arrayBufferToHexString(encryptionIV.buffer);

          const encrypted = await window.crypto.subtle.encrypt({ name: 'AES-CBC', iv: encryptionIV }, key, evt.target.result);

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
        notifyError(err);
      }
    },
    async decryptFile() {
      const url = `${this.ipfsGateway}/ipfs/${this.object.currentVersion.ipfs_hash}`;
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const { data } = response;

      // get the nonce
      const { nonce } = this.object.currentVersion.encKey;

      // get shared secret (between own public and private key)
      const { publicKey } = this.$store.getters;
      // {fromPublicKey, toPublicKey, fromBlockchain, toBlockchain, nonce}
      const sharedSecretString = await this.$store.state.scatter.scatter.getEncryptionKey(publicKey, publicKey, 'eos', 'eos', nonce);
      const sharedSecretArrayBuffer = hexStringToArrayBuffer(sharedSecretString);
      // shared secret is 512 bit hex (Scatter takes the SHA512 hash). we need 256 bits for AES-CBC.
      const sharedSecret256ArrayBuffer = await window.crypto.subtle.digest({ name: 'SHA-256', length: 256 }, sharedSecretArrayBuffer);

      // turn the shared secret into a wrapping key
      const wrappingKey = await window.crypto.subtle.importKey('raw', sharedSecret256ArrayBuffer, { name: 'AES-CBC', length: 256 }, false, ['unwrapKey']);

      // get the wrapping iv
      const wrappingIVString = this.object.currentVersion.encKey.iv;
      const wrappingIV = new Uint8Array(hexStringToArrayBuffer(wrappingIVString));

      // get the wrapped key
      const wrappedKeyString = this.object.currentVersion.encKey.value;
      const wrappedKeyArrayBuffer = hexStringToArrayBuffer(wrappedKeyString);

      // unwrap the key
      const key = await window.crypto.subtle.unwrapKey('raw', wrappedKeyArrayBuffer, wrappingKey, { name: 'AES-CBC', length: 256, iv: wrappingIV }, { name: 'AES-CBC', length: 256 }, false, ['decrypt']);

      // get the encryption iv
      const encryptionIVString = this.object.currentVersion.key.iv;
      const encryptionIV = new Uint8Array(hexStringToArrayBuffer(encryptionIVString));

      // decrypt the data
      const decryptedArrayBuffer = await window.crypto.subtle.decrypt({ name: 'AES-CBC', iv: encryptionIV }, key, data);
      this.decryptedBlobUrl = URL.createObjectURL(new Blob([decryptedArrayBuffer]));
    },
    async deleteFolder() {
      try {
        await this.$store.dispatch('deleteFolder', {
          object: this.object,
          parent: this.parent,
        });
      } catch (err) {
        notifyError(err);
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
        notifyError(err);
      }
    },
    async likeFile() {
      try {
        await this.$store.dispatch('likeVersion', {
          version: this.object.currentVersion,
          accountName: this.accountName,
        });
      } catch (err) {
        notifyError(err);
      }
    },
  },
};
</script>
