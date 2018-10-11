/*
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/
const CONTRACT_ACCOUNT = 'filespace';

function getTable(rpc, scope, tableName) {
  return new Promise((resolve) => {
    rpc.get_table_rows({
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

async function getTables(rpc, accountName) {
  const data = {};
  data.rawFolders = await getTable(rpc, accountName, 'folders');
  data.rawFiles = await getTable(rpc, accountName, 'files');
  data.rawVersions = await getTable(rpc, accountName, 'versions');
  data.rawLikes = await getTable(rpc, CONTRACT_ACCOUNT, 'likes');
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
  async addFolder({ rootState, rootGetters }, { id, name, parent }) {
    let parentId = 0;
    if (parent) {
      parentId = parent.id;
    }
    const { accountName } = rootGetters;
    await rootState.scatter.api.transact({
      actions: [{
        account: CONTRACT_ACCOUNT,
        name: 'addfolder',
        authorization: [{
          actor: accountName,
          permission: 'active',
        }],
        data: {
          user: accountName,
          id,
          name,
          parent_folder: parentId,
        },
      }],
    }, {
      blocksBehind: parseInt(process.env.BLOCKS_BEHIND, 10),
      expireSeconds: parseInt(process.env.EXPIRE_SECONDS, 10),
    });
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
  },
  async addFile({ rootState, rootGetters }, {
    id,
    name,
    date,
    ipfsHash,
    sha256,
    parent,
  }) {
    const { accountName } = rootGetters;
    await rootState.scatter.api.transact({
      actions: [{
        account: CONTRACT_ACCOUNT,
        name: 'addfile',
        authorization: [{
          actor: accountName,
          permission: 'active',
        }],
        data: {
          user: accountName,
          id,
          name,
          parent_folder: parent.id,
          current_version: 0,
        },
      }],
    }, {
      blocksBehind: parseInt(process.env.BLOCKS_BEHIND, 10),
      expireSeconds: parseInt(process.env.EXPIRE_SECONDS, 10),
    });
    await rootState.scatter.api.transact({
      actions: [{
        account: CONTRACT_ACCOUNT,
        name: 'addversion',
        authorization: [{
          actor: accountName,
          permission: 'active',
        }],
        data: {
          user: accountName,
          id,
          ipfs_hash: ipfsHash,
          sha256,
          date,
          file: id,
        },
      }],
    }, {
      blocksBehind: parseInt(process.env.BLOCKS_BEHIND, 10),
      expireSeconds: parseInt(process.env.EXPIRE_SECONDS, 10),
    });
    await rootState.scatter.api.setcurrentve({
      actions: [{
        account: CONTRACT_ACCOUNT,
        name: 'addversion',
        authorization: [{
          actor: accountName,
          permission: 'active',
        }],
        data: {
          user: accountName,
          id,
          new_current_version: id,
        },
      }],
    }, {
      blocksBehind: parseInt(process.env.BLOCKS_BEHIND, 10),
      expireSeconds: parseInt(process.env.EXPIRE_SECONDS, 10),
    });
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
  },
  async deleteFolder({ rootState, rootGetters }, {
    object,
    parent,
  }) {
    const { accountName } = rootGetters;
    await rootState.scatter.api.deletefolder({
      actions: [{
        account: CONTRACT_ACCOUNT,
        name: 'addfile',
        authorization: [{
          actor: accountName,
          permission: 'active',
        }],
        data: {
          user: accountName,
          id: object.id,
        },
      }],
    }, {
      blocksBehind: parseInt(process.env.BLOCKS_BEHIND, 10),
      expireSeconds: parseInt(process.env.EXPIRE_SECONDS, 10),
    });
    if (parent) {
      const index = parent.childFolders.indexOf(object);
      parent.childFolders.splice(index, 1);
    }
  },
  async deleteFile({ rootState, rootGetters }, {
    object,
    parent,
  }) {
    const { accountName } = rootGetters;
    await rootState.scatter.api.deletefile({
      actions: [{
        account: CONTRACT_ACCOUNT,
        name: 'addfile',
        authorization: [{
          actor: accountName,
          permission: 'active',
        }],
        data: {
          user: accountName,
          id: object.id,
        },
      }],
    }, {
      blocksBehind: parseInt(process.env.BLOCKS_BEHIND, 10),
      expireSeconds: parseInt(process.env.EXPIRE_SECONDS, 10),
    });
    if (parent) {
      const index = parent.childFiles.indexOf(object);
      parent.childFiles.splice(index, 1);
    }
  },
  async likeVersion({ rootState, rootGetters }, {
    version,
    accountName,
  }) {
    const myAccountName = rootGetters.accountName;
    await rootState.scatter.api.deletefile({
      actions: [{
        account: CONTRACT_ACCOUNT,
        name: 'addlike',
        authorization: [{
          actor: myAccountName,
          permission: 'active',
        }],
        data: {
          user: myAccountName,
          id: Date.now(),
          liked: accountName || myAccountName,
          version: version.id,
        },
      }],
    }, {
      blocksBehind: parseInt(process.env.BLOCKS_BEHIND, 10),
      expireSeconds: parseInt(process.env.EXPIRE_SECONDS, 10),
    });
    version.likes.push(myAccountName);
  },
  getFilespace({
    dispatch,
    commit,
    rootState,
    rootGetters,
  }) {
    return new Promise((resolve) => {
      const { accountName } = rootGetters;
      getFilespaceData(rootState.scatter.rpc, accountName).then((rootFolder) => {
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
      getFilespaceData(rootState.scatter.rpc, accountName).then((rootFolder) => {
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
