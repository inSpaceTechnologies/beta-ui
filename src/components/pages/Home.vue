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
        <font-awesome-icon icon="list" />
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
          <div class="post-header">
            <div class="user-thumb">
              <img
                class="profile-picture"
                src="../../images/profile.png"
              >
            </div>
            <div class="post-info">
              <span class="post-info-1">
                <router-link
                  :to="{name: 'about', params: { accountName: post.account }}"
                  exact
                  class="post-user"
                >
                  {{ post.account }}
                </router-link>
              </span>
              <span class="post-info-2">
                {{ post.is_folder ? 'Folder' : 'File' }} posted on {{ new Date(parseInt(post.date, 10)).toString() }}
              </span>
            </div>
          </div>
          <div class="post-body">
            <p>{{ post.caption }}</p>
            <inspace-graph
              :root="findDescendant(filespace[post.account], post.subject)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.graph-container {
    position: relative;
    width: 27.5rem;
    max-width: 100%;
    height: 15.5rem;
    border: solid;
    margin: 0 auto;
}
.card-content {
  padding: 0;
}
.post {
  display: flex;
  flex-direction: column;
  margin-top: 1.4rem;
  margin-bottom: 0;
  margin-left: 1.4rem;
  margin-right: 1.4rem;
  background-color: #f7f7f9;
  padding: 1.4rem;
}
.post-header {
  display: flex;
  margin-bottom: 1rem;
}
.user-thumb {
  margin-right: .75rem;
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 50%;
  background-color: #999;
}
.profile-picture {
  border-radius: 50%;
  width: 2.6rem;
  height: 2.6rem;
  margin: .1rem;
  background-color: white;
}
.post-info {
  display: flex;
  flex-direction: column;
}
.post-info-1 {
  flex-grow: 1;
  display: inline-block;
}
.post-info-2 {
  flex-grow: 1;
  font-size: 1rem;
  color: grey;
}
.post-user {
  font-size: 1.25rem;
  line-height: 1;
  word-wrap: break-word;
  margin-right: .5rem;
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
