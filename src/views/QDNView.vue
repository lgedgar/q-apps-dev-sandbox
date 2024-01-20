<script setup>
import moment from 'moment'

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
            downloadSupportedServices: [
                'DOCUMENT',
                'THUMBNAIL',
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

        async downloadResource(resource) {

            if (resource.service == 'DOCUMENT') {
                return await this.downloadDocument(resource)

            } else if (resource.service == 'THUMBNAIL') {
                return await this.downloadThumbnail(resource)

            } else {
                alert(`TODO: download not yet implemented for service: ${resource.service}`)
            }
        },

        async fetchResource(resource) {

            // TODO: why does FETCH_QDN_RESOURCE not work for THUMBNAIL?
            // i must be doing something wrong, always get bad data for
            // that, but at least this way does work okay...
            if (resource.service == 'THUMBNAIL') {
                const url = `/arbitrary/THUMBNAIL/${resource.name}/${resource.identifier || 'default'}`
                const response = await fetch(url)
                return await response.blob()
            }

            return await qortalRequest({
                action: 'FETCH_QDN_RESOURCE',
                service: resource.service,
                name: resource.name,
                identifier: resource.identifier,
            })
        },

        async downloadDocument(resource) {
            this.downloading = true
            let response

            try {
                response = await this.fetchResource(resource)
            } catch (error) {
                alert("fetch error:\n\n" + JSON.stringify(error, null, 2))
                this.downloading = false
                return
            }

            try {
                response = await qortalRequest({
                    action: 'SAVE_FILE',
                    blob: JSON.stringify(response, null, 2),
                    filename: `${resource.identifier || resource.name}.json`,
                    mimeType: 'application/json',
                })
                if (!response) {
                    alert("save returned false!?")
                    this.downloading = false
                    return
                }

            } catch (error) {
                alert("save error:\n\n" + JSON.stringify(error, null, 2))
                this.downloading = false
                return
            }

            alert("File has been saved.")
            this.downloading = false
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

        async downloadThumbnail(resource) {
            this.downloading = true
            let response

            try {
                response = await this.fetchResource(resource)
            } catch (error) {
                alert("fetch error:\n\n" + JSON.stringify(error, null, 2))
                this.downloading = false
                return
            }

            const mimeType = await this.sniffMimeType(resource)
            const extension = {
                'image/jpeg': 'jpg',
                'image/png': 'png',
                'image/webp': 'webp',
            }[mimeType] || 'dat'

            try {
                response = await qortalRequest({
                    action: 'SAVE_FILE',
                    blob: response,
                    filename: `${resource.identifier || resource.name}.${extension}`,
                    mimeType: mimeType,
                })
                if (!response) {
                    alert("save returned false!?")
                    this.downloading = false
                    return
                }

            } catch (error) {
                alert("save error:\n\n" + JSON.stringify(error, null, 2))
                this.downloading = false
                return
            }

            alert("File has been saved.")
            this.downloading = false
        },
    },
}
</script>

<template>
  <div class="qdn">

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
                {{ formatBytes(row.size) }}
              </o-table-column>
              <o-table-column label="Status"
                              :visible="showStatusColumn"
                              v-slot="{ row }">
                {{ row?.status?.status }}
              </o-table-column>
              <o-table-column label="Actions"
                              v-slot="{ row }">
                <a v-if="downloadSupportedServices.includes(row.service)"
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

    </o-tabs>
  </div>
</template>
