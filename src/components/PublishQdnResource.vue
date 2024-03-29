<script setup>
import { mapStores } from 'pinia'
import {useQordialAuthStore, NameInput, ServicePicker} from 'qordial'
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
            payloadIsBase64: false,
            publishing: false,
            publishPending: false,
            publishSuccess: false,
        }
    },

    methods: {

        clearForm() {
            this.service = 'DOCUMENT'
            this.identifier = null
            this.payloadType = 'text'
            this.payloadText = null
            this.payloadFile = null
            this.payloadIsBase64 = false
            this.publishPending = false
            this.publishSuccess = false
        },

        markPending() {
            this.publishSuccess = false
            this.publishPending = true
        },

        async publish() {
            this.publishing = true

            const resourceParams = {
                name: this.qordialAuthStore.username,
                service: this.service,
                identifier: this.identifier,
            }

            if (! await this.$qordial.confirmPublish(resourceParams)) {
                this.publishing = false
                return
            }

            let data64 = this.payloadText || ''
            if (!this.payloadIsBase64) {
                data64 = await this.$qordial.stringToBase64(data64)
            }

            let response
            try {
                response = await qortalRequest({
                    action: 'PUBLISH_QDN_RESOURCE',
                    ...resourceParams,
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
                if (error?.error != "User declined request") {
                    alert("publish error:\n\n" + JSON.stringify(error))
                }
            }

            this.publishing = false
        },
    },
}
</script>

<template>
  <div>
    <o-field grouped>
      <o-field label="Name">
        <NameInput />
      </o-field>
      <o-field label="Service">
        <ServicePicker v-model="service" required
                       :include-services="['BLOG_COMMENT', 'DOCUMENT', 'JSON']"
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
      <o-button variant="primary"
                icon-left="save"
                :disabled="publishing || !qordialAuthStore.username"
                @click="publish()">
        {{ publishing ? "Working, please wait..." : "Publish Resource" }}
      </o-button>
      <o-button @click="clearForm()">
        Clear Form
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
