<script setup>
import moment from 'moment'
import PublishQdnResource from '../components/PublishQdnResource.vue'

// nb. this was copied from https://stackoverflow.com/a/18650828
function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

</script>

<script>
export default {

    data() {
        return {
            services: [
                'APP',
                'ARBITRARY_DATA',
                'ATTACHMENT',
                'ATTACHMENT_PRIVATE',
                'AUDIO',
                'AUDIO_PRIVATE',
                'BLOG',
                'BLOG_COMMENT',
                'BLOG_POST',
                'CHAIN_COMMENT',
                'CHAIN_DATA',
                'CODE',
                'COMMENT',
                'COUPON',
                'DATABASE',
                'DOCUMENT',
                'DOCUMENT_PRIVATE',
                'EXTENSION',
                'FILE',
                'FILES',
                'FILE_PRIVATE',
                'GAME',
                'GIF_REPOSITORY',
                'IMAGE',
                'IMAGE_PRIVATE',
                'ITEM',
                'JSON',
                'LIST',
                'MAIL_PRIVATE',
                'MESSAGE_PRIVATE',
                'METADATA',
                'NFT',
                'OFFER',
                'PLAYLIST',
                'PLUGIN',
                'PODCAST',
                'PRODUCT',
                'QCHAT_ATTACHMENT',
                'QCHAT_ATTACHMENT_PRIVATE',
                'QCHAT_AUDIO',
                'QCHAT_IMAGE',
                'QCHAT_VOICE',
                'SNAPSHOT',
                'STORE',
                'THUMBNAIL',
                'VIDEO',
                'VIDEO_PRIVATE',
                'VOICE',
                'VOICE_PRIVATE',
                'WEBSITE',
            ],
            activeTab: 0,
            service: null,
            name: null,
            identifier: null,
            includeStatus: false,
            limit: 20,
            showStatusColumn: false,
            data: null,
            searching: false,
            downloading: false,
            downloadResourceStatus: null,
            downloadSupportedServices: [
                'DOCUMENT',
                'PLAYLIST',
                'THUMBNAIL',
                'VIDEO',
            ],
        }
    },

    methods: {

        async onSearchFormSubmit(event) {
            event.preventDefault()

            if (!this.limit || this.limit < 1) {
                alert("Must specify a valid limit.")
                return
            }

            this.searching = true

            let params = {
                action: 'LIST_QDN_RESOURCES',
                includeStatus: this.includeStatus,
                limit: this.limit,
            }
            if (this.service) {
                params.service = this.service
            }
            if (this.name) {
                params.name = this.name
            }
            if (this.identifier) {
                params.identifier = this.identifier
            }

            this.data = await qortalRequest(params)
            this.showStatusColumn = this.includeStatus
            this.searching = false
        },

        async openProfile(name) {
            await qortalRequest({
                action: 'OPEN_PROFILE',
                name: name,
            })
        },

        isDownloadable(resource) {
            if (this.downloadSupportedServices.includes(resource.service)) {
                return true
            }
            return false
        },

        async downloadResource(resource) {
            let blob

            try {
                blob = await this.fetchResource(resource)
            } catch (error) {
                alert("fetch error:\n\n" + JSON.stringify(error, null, 2))
                return
            }

            let mimeType
            let extension

            if (['DOCUMENT', 'PLAYLIST'].includes(resource.service)) {
                // nb. handle JSON special-like
                blob = JSON.stringify(JSON.parse(await blob.text()), null, 2)
                mimeType = 'application/json'
                extension = 'json'

            } else {
                mimeType = await this.sniffMimeType(resource)
                extension = {
                    'image/gif': 'gif',
                    'image/jpeg': 'jpg',
                    'image/png': 'png',
                    'image/webp': 'webp',
                    'video/mp4': 'mp4',
                }[mimeType] || 'dat'
            }

            await this.saveFile(resource, blob, {mimeType, extension})
        },

        async fetchResource(resource) {
            this.downloading = true

            // TODO: for some reason FETCH_QDN_RESOURCE does not work
            // as i expect it to, and/or i was somehow using it wrong.
            // at any rate it kept giving me bad data, so now am just
            // using the core API directly to fetch all resources
            const url = `/arbitrary/${resource.service}/${resource.name}/${resource.identifier || 'default'}`
            let response = fetch(url)

            // start tracking progress, to show user
            this.downloadProgressUpdate(resource)

            // wait for the fetch to complete, then return blob
            response = await response
            const blob = await response.blob()
            this.downloading = false
            return blob
        },

        async downloadProgressUpdate(resource) {

            // get current status
            const response = await qortalRequest({
                action: 'GET_QDN_RESOURCE_STATUS',
                service: resource.service,
                name: resource.name,
                identifier: resource.identifier,
            })

            // update progress display
            this.downloadResourceStatus = response

            // keep doing this until download completes
            if (this.downloading) {
                setTimeout(this.downloadProgressUpdate, 1000, resource)
            }
        },

        async sniffMimeType(resource) {
            const response = await qortalRequest({
                action: 'GET_QDN_RESOURCE_PROPERTIES',
                service: resource.service,
                name: resource.name,
                identifier: resource.identifier,
            })
            return response?.mimeType
        },

        async saveFile(resource, blob, options) {
            const mimeType = options?.mimeType
            const extension = options?.extension || 'dat'
            const filename = options?.filename || `${resource.identifier || resource.name}.${extension}`

            try {
                const response = await qortalRequest({
                    action: 'SAVE_FILE',
                    blob,
                    filename,
                    mimeType,
                })
                if (response !== true) {
                    alert("hm, did save fail!?")
                    return false
                }

            } catch (error) {
                // TODO: this seems awfully fragile but not sure how else to
                // check for the "user rejected" scenario, which can safely
                // be ignored.  (other errors should be shown)
                if (! ["User declined request",
                       "User declined the download",
                      ].includes(error.error)) {
                    alert("save error:\n\n" + JSON.stringify(error, null, 2))
                }
                return false
            }

            return true
        },
    },
}
</script>

<template>
  <div class="qdn">
    <o-loading v-model:active="downloading" full-page>
      <div class="card" style="min-width: 50rem;">
        <div class="card-header">
          <div class="card-header-title">Download in progress...</div>
        </div>
        <div class="card-content">

          <div v-if="downloadResourceStatus" style="white-space: nowrap;">
            <o-field label="Status" horizontal>
              {{ downloadResourceStatus.status }}
            </o-field>
            <o-field label="ID" horizontal>
              {{ downloadResourceStatus.id }}
            </o-field>
            <o-field label="Title" horizontal>
              {{ downloadResourceStatus.title }}
            </o-field>
            <o-field label="Description" horizontal>
              {{ downloadResourceStatus.description }}
            </o-field>
            <o-field label="Local Chunk Count" horizontal>
              {{ downloadResourceStatus.localChunkCount }}
            </o-field>
            <o-field label="Total Chunk Count" horizontal>
              {{ downloadResourceStatus.totalChunkCount }}
            </o-field>
            <o-field label="Percent Loaded" horizontal>
              {{ downloadResourceStatus.percentLoaded }}
            </o-field>
          </div>

        </div>
      </div>
    </o-loading>

    <h2 class="is-size-2">QDN</h2>
    <p class="block">
      Interact with the Qortal Data Network.
    </p>

    <o-tabs v-model="activeTab">

      <o-tab-item :value="0" label="LIST_QDN_RESOURCES">
        <form ref="searchForm" @submit="onSearchFormSubmit">

          <o-field label="Service">
            <o-select v-model="service">
              <option :value="null">(any)</option>
              <option v-for="svc in services"
                      :key="svc"
                      :value="svc">
                {{ svc }}
              </option>
            </o-select>
          </o-field>

          <o-field grouped>
            <o-field label="Name (exact)">
              <o-input v-model="name" />
            </o-field>
          </o-field>

          <o-field grouped>
            <o-field label="Identifier (exact)">
              <o-input v-model="identifier" />
            </o-field>
          </o-field>

          <o-field grouped>
            <o-field label="Include Status">
              <o-checkbox v-model="includeStatus" />
            </o-field>
          </o-field>

          <o-field grouped>
            <o-field label="Limit">
              <o-input v-model="limit" type="number" />
            </o-field>
          </o-field>

          <div style="padding-bottom: 0.75rem;">
            <o-button variant="primary"
                      native-type="submit"
                      icon-left="magnifying-glass"
                      :disabled="searching">
              {{ searching ? "Working, please wait..." : "Search" }}
            </o-button>
          </div>

          <div v-if="data">

            <p class="block">
              found {{ data.length}} result{{ data.length == 1 ? '' : 's' }}
            </p>

            <o-table :data="data || []"
                     hoverable
                     :loading="searching">
              <o-table-column label="Service"
                              v-slot="{ row }">
                {{ row.service }}
              </o-table-column>
              <o-table-column label="Name"
                              v-slot="{ row }">
                <a href="#" @click.prevent="openProfile(row.name)">
                {{ row.name }}
                </a>
              </o-table-column>
              <o-table-column label="Identifier"
                              v-slot="{ row }">
                {{ row.identifier }}
              </o-table-column>
              <o-table-column label="Created"
                              v-slot="{ row }">
                <span v-if="row.created"
                      :title="new Date(row.created)">
                  {{ moment(row.created).fromNow() }}
                </span>
              </o-table-column>
              <o-table-column label="Updated"
                              v-slot="{ row }">
                <span v-if="row.updated"
                      :title="new Date(row.updated)">
                  {{ moment(row.updated).fromNow() }}
                </span>
              </o-table-column>
              <o-table-column label="Size"
                              v-slot="{ row }">
                <span :title="`${row.size} bytes`">
                  {{ formatBytes(row.size) }}
                </span>
              </o-table-column>
              <o-table-column label="Status"
                              :visible="showStatusColumn"
                              v-slot="{ row }">
                {{ row?.status?.status }}
              </o-table-column>
              <o-table-column label="Actions"
                              v-slot="{ row }">
                <a v-if="isDownloadable(row)"
                   href="#" @click.prevent="downloadResource(row)">
                  <o-icon icon="download" />
                  <span>Download</span>
                </a>
              </o-table-column>
            </o-table>

          </div>

        </form>
      </o-tab-item>

      <!-- <o-tab-item :value="1" label="SEARCH_QDN_RESOURCES"> -->
      <!--   <p class="block">TODO</p> -->
      <!-- </o-tab-item> -->

      <o-tab-item :value="1" label="PUBLISH_QDN_RESOURCE">
        <PublishQdnResource :services="services" />
      </o-tab-item>

    </o-tabs>
  </div>
</template>
