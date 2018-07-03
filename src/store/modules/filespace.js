/*
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/
function getTable(eos, accountName, tableName) {
  return new Promise((resolve) => {
    eos.getTableRows({
      json: true,
      scope: accountName,
      code: 'filespace',
      table: tableName,
      limit: 500,
    }).then((result) => {
      resolve(result.rows);
    });
  });
}

function getTables(eos, accountName) {
  return new Promise((resolve) => {
    const data = {};
    getTable(eos, accountName, 'folders')
      .then((rawFolders) => {
        data.rawFolders = rawFolders;
        return getTable(eos, accountName, 'files');
      })
      .then((rawFiles) => {
        data.rawFiles = rawFiles;
        return getTable(eos, accountName, 'versions');
      })
      .then((rawVersions) => {
        data.rawVersions = rawVersions;
        resolve(data);
      });
  });
}

function getFilespaceData(eos, accountName) {
  return new Promise((resolve) => {
    getTables(eos, accountName, 'folders').then(({ rawVersions, rawFiles, rawFolders }) => {
      // index the data
      const indexedVersions = {};
      const indexedFiles = {};
      const indexedFolders = {};

      rawVersions.forEach((version) => {
        indexedVersions[version.id] = version;
      });
      rawFiles.forEach((file) => {
        indexedFiles[file.id] = file;
      });
      rawFolders.forEach((folder) => {
        indexedFolders[folder.id] = folder;
        folder.childFolders = [];
        folder.childFiles = [];
      });

      // collapse the data
      let rootFolder = null;

      rawVersions.forEach((version) => {
        const file = indexedFiles[version.file];
        if (!file.versions) {
          file.versions = [];
        }
        file.versions.push(version);
      });

      rawFiles.forEach((file) => {
        if (file.current_version) {
          file.currentVersion = indexedVersions[file.current_version];
        }
        const parentFolder = indexedFolders[file.parent_folder];
        parentFolder.childFiles.push(file);
      });

      rawFolders.forEach((folder) => {
        if (folder.parent_folder) {
          const parentFolder = indexedFolders[folder.parent_folder];
          parentFolder.childFolders.push(folder);
        } else {
          // no parent
          rootFolder = folder;
        }
      });

      resolve(rootFolder);
    });
  });
}

const storeState = {
  root: null,
};

const storeMutations = {
  setRoot(state, root) {
    state.root = root;
  },
  /*
  setFolder(state, { index, content }) {
    if (!state.filespace) {
      state.filespace = {};
    }
    // https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats
    // state.filespace[index] = content;
    Vue.set(state.filespace, index, content);
  },
  setFilespaceError(state, error) {
    state.filespaceError = error;
  },
  */
};

const storeActions = {
  addFolder({ rootState }, { id, name, parentId }) {
    return new Promise((resolve, reject) => {
      rootState.scatter.eos.contract('filespace').then((filespace) => {
        const accountName = rootState.scatter.identity.accounts.find(acc => acc.blockchain === 'eos').name;
        filespace.addfolder(accountName, id, name, parentId, { authorization: accountName }).then(() => {
          resolve();
        });
      }, (err) => {
        reject(err);
      });
    });
  },
  addFile({ rootState }, {
    id,
    name,
    parentId,
    date,
    ipfsHash,
    sha256,
  }) {
    return new Promise((resolve, reject) => {
      const accountName = rootState.scatter.identity.accounts.find(acc => acc.blockchain === 'eos').name;
      const data = {};
      rootState.scatter.eos.contract('filespace')
        .then((filespace) => {
          data.filespace = filespace;
          return filespace.addfile(accountName, id, name, parentId, 0, { authorization: accountName });
        })
        .then(() => data.filespace.addversion(accountName, id, ipfsHash, sha256, date, id, { authorization: accountName }))
        .then(() => data.filespace.setcurrentve(accountName, id, id, { authorization: accountName }))
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  getFilespace({ dispatch, commit, rootState }) {
    return new Promise((resolve) => {
      const accountName = rootState.scatter.identity.accounts.find(acc => acc.blockchain === 'eos').name;
      getFilespaceData(rootState.scatter.eos, accountName).then((rootFolder) => {
        if (rootFolder) {
          commit('setRoot', rootFolder);
          resolve();
          return;
        }
        // need to create the root
        const newRoot = {
          id: 1,
          name: process.env.FILESPACE_ROOT_NAME,
          childFiles: [],
          childFolders: [],
          parentId: 0,
        };
        dispatch('addFolder', { id: newRoot.id, name: newRoot.name, parentId: newRoot.parentId }).then(() => {
          commit('setRoot', newRoot);
          resolve();
        });
      });
    });
  },
};

export default {
  state: storeState,
  actions: storeActions,
  mutations: storeMutations,
};
