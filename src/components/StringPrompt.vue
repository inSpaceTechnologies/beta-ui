<template>
  <v-layout
    v-if="this.$store.state.stringPrompt.active"
    row
    justify-center
  >
    <v-dialog
      value="this.$store.state.stringPrompt.active"
      persistent
      max-width="500px"
    >
      <v-card>
        <v-card-text>
          <v-text-field
            :label="this.$store.state.stringPrompt.text"
            :value="value"
            @input="updateValue"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn
            color="primary"
            flat
            @click.native="confirm"
          >
            Ok
          </v-btn>
          <v-btn
            flat
            @click.native="cancel"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState({
      value: state => state.stringPrompt.value,
    }),
  },
  methods: {
    updateValue(v) {
      this.$store.commit('setValue', v);
    },
    confirm() {
      this.$store.state.stringPrompt.resolve(this.value);
      this.$store.dispatch('closeStringPrompt');
    },
    cancel() {
      this.$store.state.stringPrompt.resolve('');
      this.$store.dispatch('closeStringPrompt');
    },
  },
};
</script>
