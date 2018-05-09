<template>
  <v-card v-if="!$store.state.identityConfirmed">

    <v-card-title primary-title>
      <h2>Scatter setup</h2>
    </v-card-title>

    <v-stepper :value="val">

      <v-stepper-header>
        <v-stepper-step :complete="val > 1" step="1">Get scatter</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step :complete="val > 2" step="2">Set identity</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step :complete="val > 3" step="3">Check details</v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>

        <v-stepper-content step="1">
          <v-card>
            Scatter not detected. You can get it <a href="https://chrome.google.com/webstore/detail/scatter/ammjpmhgckkpcamddpolhchgomcojkle">here</a>
          </v-card>
        </v-stepper-content>

        <v-stepper-content step="2">
          <v-card>
            <v-alert v-if="requestIdentityError" :value="true" type="error">
              {{ requestIdentityError }}
            </v-alert>
            <p>Scatter detected. You must now set your identity. Please click 'Set identity' when you are ready to do so.</p>
            <p>If you need to add the temporary inSpace EOS testnet network details to Scatter, you can do that too.</p>
            <v-card-actions>
              <v-btn color="primary" v-on:click="requestIdentity">Set identity</v-btn>
              <v-btn v-on:click="addNetwork">Add network</v-btn>
            </v-card-actions>
          </v-card>
        </v-stepper-content>

        <v-stepper-content step="3">
          <v-card>
            <v-alert v-if="forgetIdentityError" :value="true" type="error">
              {{ forgetIdentityError }}
            </v-alert>
            <p><strong>Identity name:</strong> {{ $store.state.identity ? $store.state.identity.name : "" }}</p>
            <p><strong>EOS account name:</strong> {{ $store.state.identity && $store.state.identity.accounts ? $store.state.identity.accounts[0].name : "" }}</p>
            <p>If these details are correct, click 'Ok'. Otherwise, click 'Go back' to set a different identity.</p>
            <v-card-actions>
              <v-btn color="primary" v-on:click="confirmIdentity">Ok</v-btn>
              <v-btn v-on:click="forgetIdentity">Go back</v-btn>
            </v-card-actions>
          </v-card>
        </v-stepper-content>

      </v-stepper-items>
    </v-stepper>
  </v-card>
</template>

<script>
  export default {
    data() {
      return {
        requestIdentityError: null,
        forgetIdentityError: null
      };
    },
    methods: {
      addNetwork: function() {
        this.$store.dispatch('suggestNetwork');
      },
      requestIdentity: function() {
        this.requestIdentityError = null;
        this.$store.dispatch('requestIdentity').then(identity => {
          console.log(identity);
        }, err => {
          this.requestIdentityError = err.message;
        });
      },
      forgetIdentity: function() {
        this.forgetIdentityError = null;
        this.$store.dispatch('forgetIdentity').then(identity => {
        }, err => {
          this.forgetIdentityError = err.message;
        });
      },
      confirmIdentity: function() {
        this.$store.commit('setIdentityConfirmed', true);
      }
    },
    computed: {
      val: function() {
        if (this.$store.state.scatter == null) {
          return 1;
        } else if (this.$store.state.identity == null) {
          return 2;
        } else {
          return 3;
        }
      }
    }
  }
</script>
