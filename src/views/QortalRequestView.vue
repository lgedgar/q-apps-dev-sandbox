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
                        description: "Optional. If omitted, the default resource is returned, or you can alternatively use the keyword \"default\"",
                    },
                    {
                        name: 'filepath',
                        type: String,
                        description: "Required only for resources containing more than one file",
                    },
                    {
                        name: 'encoding',
                        type: String,
                        description: "Optional. If omitted, data is returned in raw form",
                    },
                    {
                        name: 'rebuild',
                        type: Boolean,
                        description: "If true, any existing cached data will be invalidated.",
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
                description: "Fetch raw metadata from resource with supplied service, name, identifier, and relative path.  If the resource doesn't have metadata, a 404 will be returned.",
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
                        description: "Optional",
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
                        description: "Optional",
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
                        description: "Optional",
                    },
                    {
                        name: 'build',
                        type: Boolean,
                        description: "Optional - request that the resource is fetched & built in the background",
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
                        description: "optional - not needed if resource contains only one file",
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
                        name: 'name',
                        type: String,
                        description: "Optional (exact match)",
                    },
                    {
                        name: 'identifier',
                        type: String,
                        description: "Optional (exact match)",
                    },
                    {
                        name: 'default',
                        type: Boolean,
                        description: "Optional",
                    },
                    {
                        name: 'includeStatus',
                        type: Boolean,
                        description: "Optional - will take time to respond, so only request if necessary",
                    },
                    {
                        name: 'includeMetadata',
                        type: Boolean,
                        description: "Optional - will take time to respond, so only request if necessary",
                    },
                    {
                        name: 'followedOnly',
                        type: Boolean,
                        description: "Optional - include followed names only",
                    },
                    {
                        name: 'excludeBlocked',
                        type: Boolean,
                        description: "Optional - exclude blocked content",
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

            PUBLISH_QDN_RESOURCE: {
                description: "Note: this publishes a single, base64-encoded file.  Multi-file resource publishing (such as a WEBSITE or GIF_REPOSITORY) is handled via PUBLISH_MULTIPLE_QDN_RESOURCES.",
                requiresUserApproval: true,
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
                        description: "Publisher must own the registered name - use GET_ACCOUNT_NAMES for a list",
                    },
                    {
                        name: 'identifier',
                        type: String,
                        description: "Optional",
                    },
                    {
                        name: 'data64',
                        type: String,
                        description: "base64 string. Remove this param if you are putting in a file. see next param.",
                    },
                    {
                        name: 'file',
                        type: File,
                        description: "File Object. Remove this param if you are putting in a base64 string.",
                    },
                    {
                        name: 'filename',
                        type: String,
                        description: "Optional - to help apps determine the file's type",
                    },
                    {
                        name: 'title',
                        type: String,
                        description: "Optional",
                    },
                    {
                        name: 'description',
                        type: String,
                        description: "Optional",
                    },
                    {
                        name: 'category',
                        type: String,
                        description: "Optional",
                    },
                    {
                        name: 'tag1',
                        type: String,
                        // description: "Optional",
                    },
                    {
                        name: 'tag2',
                        type: String,
                        // description: "Optional",
                    },
                    {
                        name: 'tag3',
                        type: String,
                        // description: "Optional",
                    },
                    {
                        name: 'tag4',
                        type: String,
                        // description: "Optional",
                    },
                    {
                        name: 'tag5',
                        type: String,
                        // description: "Optional",
                    },
                    {
                        name: 'encrypt',
                        type: Boolean,
                        description: "Optional - to be used with a private service",
                    },
                    {
                        name: 'recipientPublicKey',
                        type: String,
                        description: "Only required if encrypt is set to true",
                    },
                ],
            },

            SAVE_FILE: {
                description: "Save a data blob to file on local disk.  User will be prompted for final destination path.",
                requiresUserApproval: true,
                params: [
                    {
                        name: 'blob',
                        type: String,
                        required: true,
                    },
                    {
                        name: 'filename',
                        type: String,
                        required: true,
                    },
                    {
                        name: 'mimeType',
                        type: String,
                        description: "Optional but recommended",
                    },
                ],
            },

            SEARCH_QDN_RESOURCES: {
                description: "Search arbitrary resources available on chain, optionally filtered by service. If default is set to true, only resources without identifiers will be returned.",
                params: [

                    {
                        name: 'mode',
                        type: String,
                        description: "Specify \"ALL\" to get all results.  Default behavior returns just one result of each type.",
                    },
                    {
                        name: 'service',
                        type: String,
                    },
                    {
                        name: 'query',
                        type: String,
                        description: "Optional - searches both \"identifier\" and \"name\" fields",
                    },
                    {
                        name: 'identifier',
                        type: String,
                        description: "Optional - searches only the \"identifier\" field",
                    },
                    {
                        name: 'name',
                        type: String,
                        description: "Optional - searches only the \"name\" field",
                    },
                    {
                        name: 'prefix',
                        type: Boolean,
                        description: "Optional - if true, only the beginning of fields are matched in all of the above filters",
                    },
                    {
                        name: 'exactMatchNames',
                        type: Boolean,
                        description: "Optional - if true, partial name matches are excluded",
                    },
                    {
                        name: 'default',
                        type: Boolean,
                        description: "Optional - if true, only resources without identifiers are returned",
                    },
                    {
                        name: 'includeStatus',
                        type: Boolean,
                        description: "Optional - will take time to respond, so only request if necessary",
                    },
                    {
                        name: 'includeMetadata',
                        type: Boolean,
                        description: "Optional - will take time to respond, so only request if necessary",
                    },
                    {
                        name: 'nameListFilter',
                        type: String,
                        description: "Optional - will only return results if they are from a name included in supplied list",
                    },
                    {
                        name: 'followedOnly',
                        type: Boolean,
                        description: "Optional - include followed names only",
                    },
                    {
                        name: 'excludeBlocked',
                        type: Boolean,
                        description: "Optional - exclude blocked content",
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
