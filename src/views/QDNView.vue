<script setup>
import PublishQdnResource from '../components/PublishQdnResource.vue'
import QTube from '../components/QTube.vue'
import {PrettyBytes, PrettyIdentifier, PrettyTime, ResourceDownloader} from 'qordial'
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
            downloadSupportedServices: [
                'BLOG_COMMENT',
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
            return await this.$refs.downloader.downloadResource(resource)
        },
    },
}
</script>

<template>
  <div class="qdn">
    <ResourceDownloader ref="downloader" />

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
                <PrettyIdentifier :value="row.identifier" />
              </o-table-column>
              <o-table-column label="Created"
                              v-slot="{ row }">
                <PrettyTime :value="row.created" />
              </o-table-column>
              <o-table-column label="Updated"
                              v-slot="{ row }">
                <PrettyTime :value="row.updated" />
              </o-table-column>
              <o-table-column label="Size"
                              v-slot="{ row }">
                <PrettyBytes :value="row.size" />
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

      <o-tab-item :value="2" label="Q-Tube">
        <QTube />
      </o-tab-item>

    </o-tabs>
  </div>
</template>
