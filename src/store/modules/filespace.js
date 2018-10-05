/*
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/
const CONTRACT_ACCOUNT = 'filespace';

function getTable(eos, scope, tableName) {
  return new Promise((resolve) => {
    eos.getTableRows({
      json: true,
      scope,
      code: CONTRACT_ACCOUNT,
      table: tableName,
      limit: 500,
    }).then((result) => {
      resolve(result.rows);
    });
  });
}

async function getTables(eos, accountName) {
  const data = {};
  data.rawFolders = await getTable(eos, accountName, 'folders');
  data.rawFiles = await getTable(eos, accountName, 'files');
  data.rawVersions = await getTable(eos, accountName, 'versions');
  data.rawLikes = await getTable(eos, CONTRACT_ACCOUNT, 'likes');
  return data;
}

async function getFilespaceData(eos, accountName) {
  const {
    rawVersions,
    rawFiles,
    rawFolders,
    rawLikes,
  } = await getTables(eos, accountName);

  // index the data
  const indexedVersions = {};
  const indexedFiles = {};
  const indexedFolders = {};

  rawVersions.forEach((version) => {
    version.likes = [];
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

  rawLikes.forEach((like) => {
    if (like.liked === accountName) {
      const version = indexedVersions[like.version];
      if (!version) {
        // maybe it has been deleted
        return;
      }
      version.likes.push(like.liker);
    }
  });

  return (rootFolder);
}

const storeState = {
  root: null,
};

const storeMutations = {
  setRoot(state, root) {
    state.root = root;
  },
};

const storeActions = {
  addFolder({ rootState, rootGetters }, { id, name, parent }) {
    let parentId = 0;
    if (parent) {
      parentId = parent.id;
    }
    return new Promise((resolve, reject) => {
      rootState.scatter.eos.contract(CONTRACT_ACCOUNT).then((filespace) => {
        const { accountName } = rootGetters;
        filespace.addfolder(accountName, id, name, parentId, { authorization: accountName }).then(() => {
          const newFolder = {
            id,
            name,
            childFiles: [],
            childFolders: [],
            parentId,
          };
          if (parent) {
            parent.childFolders.push(newFolder);
          }
          resolve(newFolder);
        });
      }, (err) => {
        reject(err);
      });
    });
  },
  addFile({ rootState, rootGetters }, {
    id,
    name,
    date,
    ipfsHash,
    sha256,
    parent,
  }) {
    return new Promise((resolve, reject) => {
      const { accountName } = rootGetters;
      const data = {};
      rootState.scatter.eos.contract(CONTRACT_ACCOUNT)
        .then((filespace) => {
          data.filespace = filespace;
          return filespace.addfile(accountName, id, name, parent.id, 0, { authorization: accountName });
        })
        .then(() => data.filespace.addversion(accountName, id, ipfsHash, sha256, date, id, { authorization: accountName }))
        .then(() => data.filespace.setcurrentve(accountName, id, id, { authorization: accountName }))
        .then(() => {
          const version = {
            id,
            date,
            ipfs_hash: ipfsHash,
            sha256,
            likes: [],
          };
          const newFile = {
            name,
            id,
            versions: [version],
            currentVersion: version,
          };
          parent.childFiles.push(newFile);
          resolve(newFile);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  deleteFolder({ rootState, rootGetters }, {
    object,
    parent,
  }) {
    return new Promise((resolve, reject) => {
      rootState.scatter.eos.contract(CONTRACT_ACCOUNT).then((filespace) => {
        const { accountName } = rootGetters;
        filespace.deletefolder(accountName, object.id, { authorization: accountName }).then(() => {
          if (parent) {
            const index = parent.childFolders.indexOf(object);
            parent.childFolders.splice(index, 1);
          }
          resolve();
        }, (err) => {
          reject(err);
        });
      }, (err) => {
        reject(err);
      });
    });
  },
  deleteFile({ rootState, rootGetters }, {
    object,
    parent,
  }) {
    return new Promise((resolve, reject) => {
      rootState.scatter.eos.contract(CONTRACT_ACCOUNT).then((filespace) => {
        const { accountName } = rootGetters;
        filespace.deletefile(accountName, object.id, { authorization: accountName }).then(() => {
          if (parent) {
            const index = parent.childFiles.indexOf(object);
            parent.childFiles.splice(index, 1);
          }
          resolve();
        }, (err) => {
          reject(err);
        });
      }, (err) => {
        reject(err);
      });
    });
  },
  likeVersion({ rootState, rootGetters }, {
    version,
    accountName,
  }) {
    return new Promise((resolve, reject) => {
      rootState.scatter.eos.contract(CONTRACT_ACCOUNT).then((filespace) => {
        const myAccountName = rootGetters.accountName;
        filespace.addlike(myAccountName, Date.now(), accountName || myAccountName, version.id, { authorization: myAccountName }).then(() => {
          version.likes.push(myAccountName);
          resolve();
        }, (err) => {
          reject(err);
        });
      }, (err) => {
        reject(err);
      });
    });
  },
  getFilespace({
    dispatch,
    commit,
    rootState,
    rootGetters,
  }) {
    return new Promise((resolve) => {
      const { accountName } = rootGetters;
      getFilespaceData(rootState.scatter.eos, accountName).then((rootFolder) => {
        if (rootFolder) {
          commit('setRoot', rootFolder);
          resolve();
          return;
        }
        // need to create the root
        dispatch('addFolder', { id: 1, name: process.env.FILESPACE_ROOT_NAME, parent: null }).then((newRoot) => {
          commit('setRoot', newRoot);
          resolve();
        });
      });
    });
  },
  // gets another user's filespace
  getOtherFilespace({ rootState }, { accountName }) {
    return new Promise((resolve) => {
      getFilespaceData(rootState.scatter.eos, accountName).then((rootFolder) => {
        resolve(rootFolder);
      });
    });
  },
};

const storeGetters = {
  containsHash: state => (hash) => {
    function search(folder) {
      // check child files
      let found = false;
      folder.childFiles.forEach((childFile) => {
        childFile.versions.forEach((version) => {
          if (version.ipfs_hash === hash) {
            found = true;
          }
        });
      });
      if (found) {
        return true;
      }
      // check child folders
      folder.childFolders.forEach((childFolder) => {
        if (search(childFolder)) {
          found = true;
        }
      });
      return found;
    }
    return search(state.root);
  },
};

export default {
  state: storeState,
  actions: storeActions,
  mutations: storeMutations,
  getters: storeGetters,
};
