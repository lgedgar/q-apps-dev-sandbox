<script setup>
import QortalRequestForm from '../components/QortalRequestForm.vue'
</script>

<script>
export default {
    data() {

        const actions = {

            FETCH_QDN_RESOURCE: {
                description: "Fetch raw data from file with supplied service, name, and relative path.",
                params: [
                    {
                        name: 'service',
                        type: String,
                        required: true,
                    },
                    {
                        name: 'name',
                        type: String,
                        required: true,
                    },
                    {
                        name: 'identifier',
                        type: String,
                    },
                    {
                        name: 'filepath',
                        type: String,
                    },
                    {
                        name: 'encoding',
                        type: String,
                    },
                    {
                        name: 'rebuild',
                        type: Boolean,
                    },
                ],
            },

            GET_ACCOUNT_DATA: {
                description: "Return general account information for the given address.",
                params: [
                    {
                        name: 'address',
                        type: String,
                        required: true,
                    },
                ],
            },

            GET_ACCOUNT_NAMES: {
                description: "List all names owned by address.",
                params: [
                    {
                        name: 'address',
                        type: String,
                        required: true,
                    },
                    {
                        name: 'limit',
                        type: Number,
                        default: 20,
                    },
                    {
                        name: 'offset',
                        type: Number,
                    },
                    {
                        name: 'reverse',
                        type: Boolean,
                    },
                ],
            },

            GET_NAME_DATA: {
                description: "Info on registered name.",
                params: [
                    {
                        name: 'name',
                        type: String,
                        required: true,
                    },
                ],
            },

            GET_QDN_RESOURCE_METADATA: {
                description: "Fetch raw metadata from resource with supplied service, name, identifier, and relative path.",
                params: [
                    {
                        name: 'service',
                        type: String,
                        required: true,
                    },
                    {
                        name: 'name',
                        type: String,
                        required: true,
                    },
                    {
                        name: 'identifier',
                        type: String,
                        required: true,
                    },
                ],
            },

            GET_QDN_RESOURCE_PROPERTIES: {
                description: "Get properties of a QDN resource",
                willDownloadData: true,
                params: [
                    {
                        name: 'service',
                        type: String,
                        required: true,
                    },
                    {
                        name: 'name',
                        type: String,
                        required: true,
                    },
                    {
                        name: 'identifier',
                        type: String,
                    },
                ],
            },

            GET_QDN_RESOURCE_STATUS: {
                description: "Get status of arbitrary resource with supplied service, name and identifier.",
                params: [
                    {
                        name: 'service',
                        type: String,
                        required: true,
                    },
                    {
                        name: 'name',
                        type: String,
                    },
                    {
                        name: 'identifier',
                        type: String,
                    },
                    {
                        name: 'build',
                        type: Boolean,
                    },
                ],
            },

            GET_QDN_RESOURCE_URL: {
                description: "Get URL to load a QDN resource. Note: this returns a \"Resource does not exist\" error if a non-existent resource is requested.",
                params: [
                    {
                        name: 'service',
                        type: String,
                        required: true,
                    },
                    {
                        name: 'name',
                        type: String,
                        required: true,
                    },
                    {
                        name: 'identifier',
                        type: String,
                    },
                    {
                        name: 'path',
                        type: String,
                    },
                ],
            },

            GET_USER_ACCOUNT: {
                description: "Fetch the address and public key for the current user account.",
                requiresUserApproval: true,
                params: [],
            },

            LIST_QDN_RESOURCES: {
                description: "List arbitrary resources available on chain, optionally filtered by service and identifier.",
                params: [
                    {
                        name: 'service',
                        type: String,
                        required: true,
                    },
                    {
                        // Optional (exact match)
                        name: 'name',
                        type: String,
                    },
                    {
                        // Optional (exact match)
                        name: 'identifier',
                        type: String,
                    },
                    {
                        // Optional
                        name: 'default',
                        type: Boolean,
                    },
                    {
                        // Optional - will take time to respond, so only request if necessary
                        name: 'includeStatus',
                        type: Boolean,
                    },
                    {
                        // Optional - will take time to respond, so only request if necessary
                        name: 'includeMetadata',
                        type: Boolean,
                    },
                    {
                        // Optional - include followed names only
                        name: 'followedOnly',
                        type: Boolean,
                    },
                    {
                        // Optional - exclude blocked content
                        name: 'excludeBlocked',
                        type: Boolean,
                    },
                    {
                        name: 'limit',
                        type: Number,
                        default: 20,
                    },
                    {
                        name: 'offset',
                        type: Number,
                    },
                    {
                        name: 'reverse',
                        type: Boolean,
                    },
                ],
            },

            OPEN_PROFILE: {
                description: "Opens a user's profile if they have one. Note: this will open a modal with \"This name has no profile\" if that is the case.",
                params: [
                    {
                        name: 'name',
                        type: String,
                        required: true,
                    },
                ],
            },

            SEARCH_QDN_RESOURCES: {
                description: "Search arbitrary resources available on chain, optionally filtered by service. If default is set to true, only resources without identifiers will be returned.",
                params: [

                    {
                        name: 'service',
                        type: String,
                    },
                    {
                        // Optional - searches both "identifier" and "name" fields
                        name: 'query',
                        type: String,
                    },
                    {
                        // Optional - searches only the "identifier" field
                        name: 'identifier',
                        type: String,
                    },
                    {
                        // Optional - searches only the "name" field
                        name: 'name',
                        type: String,
                    },
                    {
                        // Optional - if true, only the beginning of fields are matched in all of the above filters
                        name: 'prefix',
                        type: Boolean,
                    },
                    {
                        // Optional - if true, partial name matches are excluded
                        name: 'exactMatchNames',
                        type: Boolean,
                    },
                    {
                        // Optional - if true, only resources without identifiers are returned
                        name: 'default',
                        type: Boolean,
                    },
                    {
                        // Optional - will take time to respond, so only request if necessary
                        name: 'includeStatus',
                        type: Boolean,
                    },
                    {
                        // Optional - will take time to respond, so only request if necessary
                        name: 'includeMetadata',
                        type: Boolean,
                    },
                    {
                        // Optional - will only return results if they are from a name included in supplied list
                        name: 'nameListFilter',
                        type: String,
                    },
                    {
                        // Optional - include followed names only
                        name: 'followedOnly',
                        type: Boolean,
                    },
                    {
                        // Optional - exclude blocked content
                        name: 'excludeBlocked',
                        type: Boolean,
                    },
                    {
                        name: 'limit',
                        type: Number,
                    },
                    {
                        name: 'offset',
                        type: Number,
                    },
                    {
                        name: 'reverse',
                        type: Boolean,
                    },
                ],
            },
        }

        // TODO: need to sort this?
        let actionsList = []
        for (var key in actions) {
            actions[key].action = key
            actionsList.push(actions[key])
        }

        let action = null
        if (this.$route.params.action) {
            action = actions[this.$route.params.action]
        }

        return {
            actions: actions,
            actionsList: actionsList,
            action: action,
            jumpToAction: this.$route.params.action || "null",
        }
    },

    watch: {

        '$route' (to, from) {
            if (to.params.action) {
                this.action = this.actions[to.params.action]
            } else {
                this.action = null
            }
        },
    },

    methods: {

        actionChanged() {
            this.$nextTick(() => {
                const newAction = this.jumpToAction == 'null' ? '' : this.jumpToAction
                this.$router.push(`/qortalRequest/${newAction}`)
            })
        },
    },
}
</script>

<template>
  <main>
    <div class="block"
         style="display: flex; align-items: center; gap: 10rem;">

      <h2 class="is-size-2 is-family-code">qortalRequest()</h2>

      <o-field label="see action" horizontal
               style="white-space: nowrap;">
        <o-select v-model="jumpToAction" @change="actionChanged">
          <option value="null"></option>
          <option v-for="a in actionsList"
                  :key="a.action"
                  :value="a.action">
            {{ a.action }}
          </option>
        </o-select>
      </o-field>

    </div>

    <div v-if="!action" class="block">
      <p class="block">Please choose an action to see more info.</p>
    </div>

    <div v-if="action" class="block">

      <h3 class="is-size-3 is-family-code block">{{ action.action }}</h3>

      <p class="block">
        {{ action.description }}
      </p>

      <o-notification v-if="action.requiresUserApproval"
                      variant="info">
        This action requires user approval.
      </o-notification>

      <o-notification v-if="action.willDownloadData"
                      variant="warning">
        This action may cause resource data to be downloaded.
      </o-notification>

      <div class="block">
        <QortalRequestForm :action="action" />
      </div>

    </div>

  </main>
</template>
