<script setup>
import {ServicePicker} from 'qordial'
</script>

<script>
export default {

    props: {
        services: {
            type: Array,
            required: true,
        },
    },

    data() {
        return {
            address: null,
            service: 'DOCUMENT',
            name: null,
            identifier: null,
            payloadType: 'text',
            payloadText: null,
            payloadFile: null,
            base64: false,
            payloadIsBase64: true,
            publishing: false,
        }
    },

    methods: {

        async authenticate() {
            let response
            try {
                response = await qortalRequest({
                    action: 'GET_USER_ACCOUNT',
                })
                this.address = response.address

                response = await qortalRequest({
                    action: 'GET_ACCOUNT_NAMES',
                    address: this.address,
                    limit: 1,
                })
                if (response.length) {
                    this.name = response[0].name
                }

            } catch (error) {
                // nb. presumably user rejected the auth request;
                // we can safely ignore this error, the form will
                // show warnings etc. if username is not known
            }
        },

        async publish() {
            this.publishing = true

            // TODO: we only support already-encoded base64 text so far

            let response
            try {
                response = await qortalRequest({
                    action: 'PUBLISH_QDN_RESOURCE',
                    name: this.name,
                    service: this.service,
                    identifier: this.identifier,
                    data64: this.payloadText,
                })
                if (response.reference) {
                    alert("published okay!")

                } else {
                    // console.log(response)
                    alert("publish error?  response had no reference")
                }
            } catch (error) {
                // console.log(error)
                alert("publish error:\n\n" + error)
            }

            this.publishing = false
        },
    },
}
</script>

<template>
  <div>
    <o-loading v-model:active="publishing" full-page>
      <div class="card" style="min-width: 50rem;">
        <div class="card-header">
          <div class="card-header-title">Publish in progress...</div>
        </div>
        <div class="card-content">
          <p class="block">
            TODO: what to show here?
          </p>
        </div>
      </div>
    </o-loading>

    <o-field grouped>
      <o-field label="Name">
        <o-button v-if="!address"
                  variant="primary"
                  @click="authenticate()">
          please authenticate
        </o-button>
        <o-input v-if="address"
                 v-model="name" disabled />
      </o-field>
      <o-field label="Service">
        <ServicePicker v-model="service" required
                       :include-services="['DOCUMENT', 'JSON']" />
      </o-field>
      <o-field label="Identifier">
        <o-input v-model="identifier"
                 placeholder="leave blank for default"
                 style="width: 50rem;" />
      </o-field>
    </o-field>

    <o-field grouped>
      <o-field label="Payload Type">
        <o-select v-model="payloadType" disabled>
          <option value="file">file</option>
          <option value="text">text</option>
        </o-select>
      </o-field>
      <o-field label="Base64">
        <o-checkbox v-model="payloadIsBase64" disabled>
          {{ payloadType }} is
          {{ payloadIsBase64 ? "already" : "not yet" }}
          base64-encoded
        </o-checkbox>
      </o-field>
    </o-field>

    <o-notification variant="warning">
      Your text must already be base64-encoded!  (Will make that optional soon I hope.)
    </o-notification>

    <o-field v-if="payloadType == 'file'"
             grouped>
      <o-field label="Payload File">
        <o-input v-model="payloadFile" />
      </o-field>
    </o-field>

    <o-field v-if="payloadType == 'text'"
             label="Payload Text">
      <o-input v-model="payloadText"
               type="textarea" />
    </o-field>

    <o-field grouped>
      <o-checkbox :value="false" disabled>
        Warn me if a matching resource already exists
      </o-checkbox>
    </o-field>

    <o-notification variant="warning">
      <p class="block">
        If a matching resource already exists, it will be overwritten!
        (Hopefully soon will add the option to check first, and avoid accidental overwrite.)
      </p>
    </o-notification>

    <o-button variant="primary"
              icon-left="save"
              :disabled="publishing || !name"
              @click="publish()">
      {{ publishing ? "Working, please wait..." : "Publish" }}
    </o-button>

  </div>
</template>
