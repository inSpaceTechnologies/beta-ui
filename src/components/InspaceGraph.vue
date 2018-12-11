<!--
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->
<template>
  <div
    ref="container"
    class="graph-container"
  />
</template>
<style scoped>
.graph-container {
  display: flex;
  flex-grow: 1;
}
</style>
<script>
import { Controller, Folder, File } from 'inspace-graph';
import fontFnt from 'inspace-graph/test/public/fonts/roboto.fnt';
import fontPng from 'inspace-graph/test/public/fonts/roboto.png';
import 'inspace-graph/src/style/style.css';

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

function createIGFolder(folder) {
  const igFolder = new Folder(folder.name);
  igFolder.id = folder.id;
  igFolder.object = folder;
  return igFolder;
}

function createIGFile(file) {
  const igFile = new File(file.name);
  igFile.id = file.id;
  igFile.date = file.currentVersion.date;
  igFile.ipfsHash = file.currentVersion.ipfs_hash;
  igFile.sha256 = file.currentVersion.sha256;
  igFile.object = file;
  return igFile;
}

export default {
  props: {
    root: {
      type: Object,
      required: true,
    },
  },
  mounted() {
    const { container } = this.$refs;

    const controller = new Controller();

    const dataFunctions = {
      newFolder: (parentIGFolder) => {
        this.$store.dispatch('openStringPrompt', {
          text: 'Enter folder name',
          value: '',
        }).then((name) => {
          if (name) {
            this.$store.dispatch('addFolder', { id: Date.now(), name, parent: parentIGFolder.object }).then((folder) => {
              const newIGFolder = createIGFolder(folder);
              controller.addFilespaceItem(parentIGFolder, newIGFolder);
            }, (err) => {
              notifyError(err);
            });
          }
        });
      },
      downloadURL: igFile => `${process.env.IPFS_GATEWAY}/ipfs/${igFile.ipfsHash}`,
      canUpload: () => true,
      uploadFile: async (parentIGFolder, file) => {
        const formData = new FormData();
        // This should automatically set the file name and type.
        formData.append('file', file);

        const config = {
          headers: {
            'content-type': 'multipart/form-data',
            Accept: 'application/json',
          },
        };

        const axiosInstance = await inspaceAPI.getAxiosInstance();

        axiosInstance.post('/ipfs/upload', formData, config).then((response) => {
          const id = Date.now();
          this.$store.dispatch('addFile', {
            id,
            name: file.name,
            date: Date.now(),
            ipfsHash: response.data.ipfsHash,
            sha256: response.data.sha256,
            parent: parentIGFolder.object,
          }).then((newFile) => {
            const newIGFile = createIGFile(newFile);
            controller.addFilespaceItem(parentIGFolder, newIGFile);
          }, (err) => {
            notifyError(err);
          });
        }, (err) => {
          notifyError(err);
        });
      },
      deleteFolder: async (igFolder) => {
        try {
          await this.$store.dispatch('deleteFolder', {
            object: igFolder.object,
            parent: igFolder.parentFolder().object,
          });
          controller.removeFilespaceItem(igFolder);
        } catch (err) {
          notifyError(err);
        }
      },
      deleteFile: async (igFile) => {
        const { object } = igFile;
        const hash = object.currentVersion.ipfs_hash;
        try {
          await this.$store.dispatch('deleteFile', {
            object,
            parent: igFile.parentFolder().object,
          });
          controller.removeFilespaceItem(igFile);
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
    };

    controller.init(container, dataFunctions, { fnt: fontFnt, png: fontPng }, () => {
      function addObject(parentIgFolder, folder) {
        const igFolder = createIGFolder(folder);
        controller.addFilespaceItem(parentIgFolder, igFolder);

        if (folder.childFolders) {
          folder.childFolders.forEach((childFolder) => {
            addObject(igFolder, childFolder);
          });
        }

        if (folder.childFiles) {
          folder.childFiles.forEach((childFile) => {
            const igFile = createIGFile(childFile);
            controller.addFilespaceItem(igFolder, igFile);
          });
        }
      }

      addObject(null, this.root);

      controller.animate();
    });
  },
};
</script>
