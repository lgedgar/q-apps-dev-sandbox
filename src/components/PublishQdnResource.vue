<script setup>
import { mapStores } from 'pinia'
import {useQordialAuthStore, ServicePicker} from 'qordial'
</script>

<script>
export default {

    props: {
        services: {
            type: Array,
            required: true,
        },
    },

    computed: {
        ...mapStores(useQordialAuthStore),
    },

    data() {
        return {
            service: 'DOCUMENT',
            identifier: null,
            payloadType: 'text',
            payloadText: null,
            payloadFile: null,
            base64: false,
            payloadIsBase64: false,
            warnIfExists: true,
            publishing: false,
            publishPending: false,
            publishSuccess: false,
        }
    },

    methods: {

        markPending() {
            this.publishSuccess = false
            this.publishPending = true
        },

        async shouldOverwriteResource() {
            const response = await qortalRequest({
                action: 'LIST_QDN_RESOURCES',
                service: this.service,
                name: this.qordialAuthStore.username,
                identifier: this.identifier,
                limit: 1,
            })

            if (response.length) {
                return confirm("Matching resource already exists!  Overwrite?")
            }
            return true
        },

        async publish() {

            if (this.warnIfExists) {
                if (! await this.shouldOverwriteResource()) {
                    return
                }
            }

            this.publishing = true

            let data64 = this.payloadText || ''
            if (!this.payloadIsBase64) {
                data64 = await this.$qordial.stringToBase64(data64)
            }

            let response
            try {
                response = await qortalRequest({
                    action: 'PUBLISH_QDN_RESOURCE',
                    name: this.qordialAuthStore.username,
                    service: this.service,
                    identifier: this.identifier,
                    data64,
                })
                if (response.reference) {
                    this.publishPending = false
                    this.publishSuccess = true

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
        <o-button v-if="!qordialAuthStore.address"
                  variant="primary"
                  @click="$qordial.authenticate()">
          please authenticate
        </o-button>
        <o-input v-if="qordialAuthStore.address"
                 v-model="qordialAuthStore.username" disabled />
      </o-field>
      <o-field label="Service">
        <ServicePicker v-model="service" required
                       :include-services="['DOCUMENT', 'JSON']"
                       @input="markPending()" />
      </o-field>
      <o-field label="Identifier">
        <o-input v-model="identifier"
                 placeholder="leave blank for default"
                 style="width: 50rem;"
                 @input="markPending()" />
      </o-field>
    </o-field>

    <o-field grouped>
      <o-field label="Payload Type">
        <o-select v-model="payloadType" disabled
                  @input="markPending()">
          <option value="file">file</option>
          <option value="text">text</option>
        </o-select>
      </o-field>
      <o-field label="Base64">
        <o-checkbox v-model="payloadIsBase64"
                    @input="markPending()">
          {{ payloadType }} is
          {{ payloadIsBase64 ? "already" : "not yet" }}
          base64-encoded
        </o-checkbox>
      </o-field>
    </o-field>

    <o-field v-if="payloadType == 'file'"
             grouped>
      <o-field label="Payload File">
        <o-input v-model="payloadFile"
                 @input="markPending()" />
      </o-field>
    </o-field>

    <o-field v-if="payloadType == 'text'"
             label="Payload Text">
      <o-input v-model="payloadText"
               type="textarea"
               @input="markPending()" />
    </o-field>

    <o-field grouped>
      <o-checkbox v-model="warnIfExists">
        Warn me if a matching resource already exists
      </o-checkbox>
    </o-field>

    <o-field grouped>
      <o-button variant="primary"
                icon-left="save"
                :disabled="publishing || !qordialAuthStore.username"
                @click="publish()">
        {{ publishing ? "Working, please wait..." : "Publish" }}
      </o-button>
      <div style="width: 5rem;"></div>
      <o-notification v-if="publishPending"
                      variant="warning">
        <p class="block">
          The data shown has not yet been published.
        </p>
      </o-notification>
      <o-notification v-if="publishSuccess"
                      variant="success">
        <p class="block">
          The data shown has been published.
        </p>
      </o-notification>
    </o-field>

  </div>
</template>
