<!--
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->
<template>
  <div class="central">
    <div
      v-if="profileLoaded"
      class="card"
    >
      <div class="card-header">
        <span class="card-title">
          Profile
        </span>
        <button
          v-if="isMe && !editing"
          type="button"
          @click="edit()"
        >
          Edit
        </button>
        <button
          v-if="isMe && editing"
          type="button"
          @click="save()"
        >
          Save
        </button>
        <button
          v-if="isMe && editing"
          type="button"
          @click="cancel()"
        >
          Cancel
        </button>
        <button
          v-if="isMe && profileEncrypted && !editing"
          type="button"
          @click="shareKey()"
        >
          Share encrypted profile
        </button>
      </div>
      <div class="card-content">
        <p v-if="errorMessage !== ''">{{ errorMessage }}</p>
        <div v-if="editing">
          <div
            v-for="(item, index) in editedProfile"
            :key="index + '-editedProfile'"
          >
            <input v-model="item.key">
            <input v-model="item.value">
            <button
              type="button"
              @click="removeProfileField(index)"
            >
              -
            </button>
          </div>
          <button
            type="button"
            @click="addProfileField()"
          >
            +
          </button>
          <div>
            <label>
              <input
                v-model="encryptProfile"
                type="checkbox"
              >
              Encrypt profile
            </label>
          </div>
        </div>
        <div v-else>
          <p
            v-for="(item, index) in profile"
            :key="index + '-profile'"
          >
            {{ item.key }}: {{ item.value }}
          </p>
        </div>
      </div>
    </div>
    <span v-else>Loading...</span>
  </div>
</template>
<script>
import axios from 'axios';
import inspaceAPI from '../inspaceapi';
import logger from '../logger';
import encryption from '../encryption';

export default {
  props: {
    accountName: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      editing: false,
      profile: [],
      editedProfile: [],
      profileLoaded: false,
      profileEncKey: null,
      profileKey: null,
      encryptProfile: false,
      errorMessage: '',
    };
  },
  computed: {
    isMe() {
      if (this.accountName === this.$store.getters.accountName) {
        return true;
      }
      return false;
    },
    profileEncrypted() {
      if (this.profileKey) {
        return true;
      }
      return false;
    },
  },
  async mounted() {
    try {
      const { publicKey } = this.$store.getters;

      const profile = await this.$store.dispatch('getProfile', { accountName: this.accountName, ownPublicKey: publicKey });
      if (profile) {
        if (profile.key !== 0) {
          // profile is encrypted
          this.profileKey = profile.key;

          if (!profile.encKey) {
            this.errorMessage = 'You do not have access to this encrypted profile.';
            this.profileLoaded = true;
            return;
          }

          this.profileEncKey = profile.encKey;

          const url = `${process.env.IPFS_GATEWAY}/ipfs/${profile.ipfs_hash}`;
          const response = await axios.get(url, { responseType: 'arraybuffer' });
          const arrayBuffer = response.data;

          // decrypt the profile
          const { nonce } = profile.encKey;
          const wrappingIVString = profile.encKey.iv;
          const wrappedKeyString = profile.encKey.value;

          const ownerPublicKey = await this.$store.dispatch('getActivePublicKey', { accountName: this.accountName });

          const decryptedArrayBuffer = await encryption.decrypt({
            nonce,
            wrappingIVString,
            wrappedKeyString,
            arrayBuffer,
            ownerPublicKey,
            myPublicKey: profile.encKey.public_key,
            encryptionIVString: profile.key.iv,
            $store: this.$store,
          });

          // convert profile from array buffer
          const decoder = new TextDecoder('utf-8');
          const profileString = decoder.decode(decryptedArrayBuffer);
          this.profile = JSON.parse(profileString);
        } else {
          const url = `${process.env.IPFS_GATEWAY}/ipfs/${profile.ipfs_hash}`;
          const response = await axios.get(url);
          this.profile = response.data;
        }
      }
      this.profileLoaded = true;
    } catch (err) {
      logger.notifyError(err);
    }
  },
  methods: {
    async uploadProfile(blob) {
      // TODO: delete previous
      const formData = new FormData();
      formData.append('file', blob);
      const config = {
        headers: {
          'content-type': 'multipart/form-data',
          Accept: 'application/json',
        },
      };
      const axiosInstance = await inspaceAPI.getAxiosInstance();
      const response = await axiosInstance.post('/ipfs/upload', formData, config);
      return response;
    },
    async saveUnencrypted() {
      // upload to IPFS
      const blob = new Blob([JSON.stringify(this.editedProfile)], { type: 'text/plain' });
      const response = await this.uploadProfile(blob);
      // update contract
      await this.$store.dispatch('setProfile', { ipfsHash: response.data.ipfsHash });
      this.profileKey = null;
      this.profileEncKey = null;
    },
    async saveEncrypted() {
      const { publicKey } = this.$store.getters;

      // convert profile to array buffer
      const encoder = new TextEncoder('utf-8');
      const arrayBuffer = encoder.encode(JSON.stringify(this.profile));

      // encrypt it
      const {
        wrappingIVString, wrappedKeyString, nonce, encryptionIVString, encrypted,
      } = await encryption.encrypt({ publicKey, arrayBuffer, $store: this.$store });

      // upload to IPFS
      const blob = new Blob([encrypted]);
      const response = await this.uploadProfile(blob);

      // update contract
      const { key, encKey } = await this.$store.dispatch('setProfile', {
        ipfsHash: response.data.ipfsHash,
        keyIV: encryptionIVString,
        encryptedKey: wrappedKeyString,
        publicKey,
        encryptedKeyIV: wrappingIVString,
        nonce,
      });
      this.profileKey = key;
      this.profileEncKey = encKey;
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
          nonce: this.profileEncKey.nonce,
          wrappingIVString: this.profileEncKey.iv,
          wrappedKeyString: this.profileEncKey.value,
          encryptionIVString: this.profileKey.iv,
        });

        await this.$store.dispatch('shareKey', {
          id: Date.now(),
          keyID: this.profileKey.id,
          publicKey: recipientPublicKey,
          encryptedKeyIV: wrappingIVString,
          nonce,
          encryptedKey: wrappedKeyString,
        });
      } catch (err) {
        logger.notifyError(err);
      }
    },
    async edit() {
      try {
        if (this.profileEncrypted) {
          // set appropriate default
          this.encryptProfile = true;
        }
        // need to clone
        this.editedProfile = JSON.parse(JSON.stringify(this.profile));
        this.editing = true;
        if (this.profile.length === 0) {
          this.profile.push({ key: 'name', value: '' });
          this.profile.push({ key: 'about', value: '' });
          this.profile.push({ key: 'location', value: '' });
          this.profile.push({ key: 'status', value: '' });
        }
      } catch (err) {
        logger.notifyError(err);
      }
    },
    async save() {
      try {
        if (this.encryptProfile) {
          await this.saveEncrypted();
        } else {
          await this.saveUnencrypted();
        }
        this.profile = this.editedProfile;
        this.editing = false;
      } catch (err) {
        logger.notifyError(err);
      }
    },
    async cancel() {
      this.editing = false;
    },
    addProfileField() {
      this.editedProfile.push({ key: '', value: '' });
    },
    removeProfileField(index) {
      if (index > -1) {
        this.editedProfile.splice(index, 1);
      }
    },
  },
};
</script>
