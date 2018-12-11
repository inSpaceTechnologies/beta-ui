<!--
Copyright (c) 2018 inSpace Technologies Ltd
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->
<template>
  <div class="central">
    <div class="card">
      <div class="card-header">
        <span class="card-title">
          News feed
        </span>
      </div>
      <div class="card-content">
        <div
          v-for="(post, index) in posts"
          :key="index + '-post'"
          class="post"
        >
          <ul>
            <li>
              Post from {{ post.account }} on {{ new Date(parseInt(post.date, 10)).toString() }}.
            </li>
            <li>
              Caption: {{ post.caption }}
            </li>
            <li v-if="post.is_folder">
              It's a folder.
            </li>
            <li v-else>
              It's a file.
            </li>
            <inspace-graph
              :root="findDescendant(filespace[post.account], post.subject)"
            />
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.graph-container {
  width: 400px;
  height: 200px;
  border: solid 1px;
  margin: 1em;
}
.post {
  background-color: white;
  border: solid 1px;
  margin: 1em;
}
</style>
<script>
export default {
  data() {
    return {
      posts: [],
      filespace: {},
    };
  },
  async created() {
    const posts = await this.$store.dispatch('getPosts');
    for (const post of posts) { // eslint-disable-line no-restricted-syntax
      const accountName = post.account;
      if (!this.filespace[accountName]) {
        this.filespace[accountName] = await this.$store.dispatch('getOtherFilespace', { accountName }); // eslint-disable-line no-await-in-loop
      }
    }
    this.posts = posts;
  },
  methods: {
    findDescendant(folder, id) {
      if (folder.id === id) {
        return folder;
      }
      let result = null;
      folder.childFolders.forEach((subfolder) => {
        const res = this.findDescendant(subfolder, id);
        if (res) {
          result = res;
        }
      });
      if (result) {
        return result;
      }
      folder.childFiles.forEach((subfile) => {
        if (subfile.id === id) {
          result = subfile;
        }
      });
      return result;
    },
  },
};
</script>
