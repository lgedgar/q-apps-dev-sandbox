<script setup>
import ShortUniqueId from "short-unique-id"
import appsettings from '../appsettings'
</script>

<script>
export default {

    data() {
        return {
            appTitle: appsettings.appTitle,
            showDialog: false,
            useraddr: null,
            username: null,
            userpubkey: null,
            referrer: null,
            message: null,
            maintainerName: appsettings.maintainerName,
            mailUid: new ShortUniqueId(),
            sending: false,
        }
    },

    computed: {

        yourNameFieldInfo() {
            if (!this.useraddr) {
                return {
                    variant: 'danger',
                    message: "You must authenticate to send Q-Mail.",
                }
            } else if (!this.username) {
                return {
                    variant: 'danger',
                    message: "You must have a registered name to send Q-Mail.",
                }
            }
        },
    },

    methods: {

        async initFeedback() {
            let response

            if (!this.useraddr) {
                try {
                    response = await qortalRequest({
                        action: 'GET_USER_ACCOUNT',
                    })
                    this.useraddr = response.address
                } catch (error) {
                    // nb. presumably user rejected the auth request;
                    // we can safely ignore this error, the form will
                    // show warnings etc. if username is not known
                }
            }

            if (this.useraddr && !this.username) {
                response = await qortalRequest({
                    action: 'GET_ACCOUNT_NAMES',
                    address: this.useraddr,
                    limit: 1,
                })
                if (response.length) {
                    this.username = response[0].name
                }
            }

            if (this.useraddr && !this.userpubkey) {
                response = await qortalRequest({
                    action: 'GET_ACCOUNT_DATA',
                    address: this.useraddr,
                })
                this.userpubkey = response.publicKey
            }

            this.referrer = this.$route.fullPath

            this.showDialog = true
        },

        // nb. this function was copied/adapted from
        // https://github.com/Qortal/q-shop/blob/98c5e7d37d7d00d1bf3290d24afe5f20388e1885/src/utils/toBase64.ts#L11
        async objectToBase64(obj) {
          // Step 1: Convert the object to a JSON string
          const jsonString = JSON.stringify(obj)

          // Step 2: Create a Blob from the JSON string
          const blob = new Blob([jsonString], { type: 'application/json' })

          // Step 3: Create a FileReader to read the Blob as a base64-encoded string
          return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                // Remove 'data:application/json;base64,' prefix
                const base64 = reader.result.replace(
                  'data:application/json;base64,',
                  ''
                )
                resolve(base64)
              } else {
                reject(new Error('Failed to read the Blob as a base64-encoded string'))
              }
            }
            reader.onerror = () => {
              reject(reader.error)
            }
            reader.readAsDataURL(blob)
          })
        },

        async sendFeedback() {
            this.sending = true
            let response

            response = await qortalRequest({
                action: 'GET_NAME_DATA',
                name: this.maintainerName,
            })
            const maintainerAddress = response.owner

            const maintainerAccount = await qortalRequest({
                action: 'GET_ACCOUNT_DATA',
                address: maintainerAddress,
            })

            const mailId = this.mailUid.rnd()

            const identifier = [
                'qortal_qmail',
                this.maintainerName.slice(0, 20),
                maintainerAddress.slice(-6),
                'mail',
                mailId,
            ].join('_')

            const mailObject = {
                version: 1,
                createdAt: Date.now(),
                recipient: this.maintainerName,
                // TODO: subject should be configurable?
                subject: `[${this.appTitle}] App Feedback`,
                textContent: [
                    {
                        type: 'paragraph',
                        children: [{text: `App Route: ${this.referrer}\n\nMessage:\n`}],
                    },
                    {
                        type: 'paragraph',
                        children: [{text: this.message}],
                    },
                ],
                // TODO: one of these must be present or else Q-Mail will
                // deem it invalid, won't display it.  not sure which is the
                // offender yet though, so including all for now
                htmlContent: null,
                attachments: [],
                generalData: {
                  thread: [],
                },
            }

            // publish mail to QDN
            try {
                response = await qortalRequest({
                    action: 'PUBLISH_QDN_RESOURCE',
                    name: this.username,
                    service: 'MAIL_PRIVATE',
                    data64: await this.objectToBase64(mailObject),
                    identifier,
                    encrypt: true,
                    publicKeys: [maintainerAccount.publicKey, this.userpubkey],
                })
            } catch (error) {

                // TODO: this should work, according to
                // https://oruga.io/components/Notification.html#programmatically
                // but i am just getting an error for now, cf.
                // https://github.com/oruga-ui/oruga/issues/734#issuecomment-1900862765
                // this.$oruga.notification.open({
                //     message: error?.error || error.toString(),
                //     rootClass: 'toast toast-notification',
                //     position: 'top',
                // })

                // TODO: so for now we just do this instead
                alert(`ERROR\n\n${error?.error || error.toString()}`)

                this.sending = false
                return
            }

            alert("Message was sent!")
            this.sending = false
            this.message = null
            this.showDialog = false
        },

        async showMaintainer() {
            await qortalRequest({
                action: 'OPEN_PROFILE',
                name: this.maintainerName,
            })
        },
    },
}
</script>

<template>
  <div>

    <o-button @click="initFeedback()"
              variant="primary"
              icon-left="comment">
      Feedback
    </o-button>

    <o-modal v-model:active="showDialog">
      <div class="card">

        <div class="card-header">
          <div class="card-header-title">App Feedback</div>
        </div>

        <div class="card-content">

          <p class="block">
            Got a question or suggestion?  Please share.
            This will send a Q-Mail to the app maintainer (
            <a href="#" @click.prevent="showMaintainer()">
              {{ maintainerName }}
            </a>
            ).
          </p>

          <o-field label="Your Name" horizontal
                   :variant="yourNameFieldInfo?.variant"
                   :message="yourNameFieldInfo?.message">
            <o-input :value="username || useraddr" disabled />
          </o-field>

          <o-field label="Current Route" horizontal>
            <o-input :value="referrer" disabled />
          </o-field>

          <o-field label="Message">
            <o-input v-model="message" type="textarea" />
          </o-field>

        </div>

        <div class="card-footer">
          <div class="card-footer-item buttons">

            <o-button variant="primary"
                      @click="sendFeedback()"
                      :disabled="sending || !username || !message?.trim()">
              {{ sending ? "Working, please wait..." : "Send Message" }}
            </o-button>

            <o-button @click="showDialog = false">
              Cancel
            </o-button>
          </div>
        </div>

      </div>
    </o-modal>

  </div>
</template>
