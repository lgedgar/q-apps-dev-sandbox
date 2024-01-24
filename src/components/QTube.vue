<script setup>
import { mapStores } from 'pinia'
import {useQordialAuthStore, JsonModal, NameInput, PrettyBytes, PrettyIdentifier, PrettyTime, ResourceDownloader} from 'qordial'
import VCodeBlock from '@wdns/vue-code-block'
import Compressor from 'compressorjs'
</script>

<script>
export default {

    data() {
        return {
            qtubeIdentifierPrefix: 'qtube_vid_',

            qtubeVideosLimit: 20,
            qtubeVideosData: null,
            qtubeVideosLoading: false,

            qtubeVideoShowDocument: false,
            qtubeVideoDocument: null,

            videoResourcesLimit: 20,
            videoResourcesData: null,
            videoResourcesLoading: false,

            videoResourceShowMetadata: false,
            videoResourceMetadata: null,

            publishShowDialog: false,
            publishVideoReference: null,
            publishTitle: null,
            publishDescription: null,
            publishMimeType: null,
            publishImageFile: null,
            publishVideoImage: null,
            publishIdentifierSuffix: null,
            publishing: false,
        }
    },

    computed: {
        ...mapStores(useQordialAuthStore),

        htmlDescriptionSafe() {
            return this.$refs.publishDescriptionSafe.innerHTML
        },

        publishVideoImageSize() {
            if (this.publishVideoImage) {
                return this.$qordial.formatBytes(this.publishVideoImage.length)
            }
        },
    },

    methods: {

        async encodeImage() {

            if (!this.publishImageFile) {
                return
            }

            // nb. this was heavily inspired by
            // https://github.com/Qortal/q-tube/blob/ab8d9d1983b6fb5274f1e2f94e1d611025807fca/src/components/PublishVideo/PublishVideo.tsx#L578
            let compressedFile
            await new Promise(resolve => {
                new Compressor(this.publishImageFile, {
                    quality: 0.8,
                    maxWidth: 750,
                    mimeType: 'image/webp',
                    success(result) {
                        const file = new File([result], "name", {
                            type: "image/webp",
                        });
                        compressedFile = file;
                        resolve();
                    },
                    error(err) {},
                })
            })

            if (!compressedFile) {
                alert("compress error?")
                return
            }

            this.publishVideoImage = await this.$qordial.fileToBase64(compressedFile)
        },

        async qtubeVideosRefresh() {
            this.qtubeVideosLoading = true
            const url = `/arbitrary/resources/search?mode=ALL&service=DOCUMENT&name=${this.qordialAuthStore.username}&identifier=${this.qtubeIdentifierPrefix}&limit=${this.qtubeVideosLimit}&includemetadata=false&reverse=true&excludeblocked=true&exactmatchnames=true`
            const response = await fetch(url)
            this.qtubeVideosData = await response.json()
            this.qtubeVideosLoading = false
        },

        async videoResourcesRefresh() {
            this.videoResourcesLoading = true

            const response = await qortalRequest({
                action: 'LIST_QDN_RESOURCES',
                service: 'VIDEO',
                name: this.qordialAuthStore.username,
                limit: this.videoResourcesLimit,
            })

            this.videoResourcesData = response
            this.videoResourcesLoading = false
        },

        async showQtubeVideoDocument(resource) {
            this.qtubeVideoDocument = await this.$qordial.fetchResourceJSON(resource)
            this.qtubeVideoShowDocument = true
        },

        async viewInQtube(resource) {
            await qortalRequest({
                action: 'OPEN_NEW_TAB',
                qortalLink: `qortal://APP/Q-Tube/video/${resource.name}/${resource.identifier}`,
            })
        },

        async downloadResource(resource) {
            return await this.$refs.downloader.downloadResource(resource)
        },

        async showVideoResourceMetadata(resource) {
            this.videoResourceMetadata = await this.$qordial.fetchResourceMetadata(resource)
            this.videoResourceShowMetadata = true
        },

        async publishInit(resource) {
            const metadata = await this.$qordial.fetchResourceMetadata(resource)

            this.publishTitle = metadata?.title
            this.publishDescription = metadata?.description
            this.publishMimeType = metadata?.mimeType
            this.publishVideoReference = resource
            this.publishImageFile = null
            this.publishVideoImage = null

            // video metadata description may have other data embedded
            // within it; strip that out if so
            if (this.publishDescription) {
                this.publishDescription = this.publishDescription.replace(
                    /^\*\*category.+code:.+\*\*/,
                    '')
            }

            this.publishIdentifierSuffix = resource.identifier + '_metadata'
            // nb. must strip away qtube prefix if already present
            if (this.publishIdentifierSuffix.startsWith(this.qtubeIdentifierPrefix)) {
                this.publishIdentifierSuffix = this.publishIdentifierSuffix.slice(
                    this.qtubeIdentifierPrefix.length)
            }

            this.publishShowDialog = true
        },

        async publishSubmit() {

            if (!this.publishVideoImage) {
                alert("Image File is required for publishing to Q-Tube.")
                return
            }

            this.publishing = true

            const resourceParams = {
                name: this.qordialAuthStore.username,
                service: 'DOCUMENT',
                // TODO: should validate this somehow?
                identifier: this.qtubeIdentifierPrefix + this.publishIdentifierSuffix,
            }

            if (! await this.$qordial.confirmPublish(resourceParams)) {
                this.publishing = false
                return
            }

            const metadata = {
                title: this.publishTitle,
                version: 1,
                fullDescription: this.publishDescription,
                htmlDescription: this.htmlDescriptionSafe,
                videoReference: {
                    service: 'VIDEO',
                    name: this.publishVideoReference.name,
                    identifier: this.publishVideoReference.identifier,
                },
                videoType: this.publishMimeType,
                videoImage: this.publishVideoImage,
            }

            try {
                const response = await qortalRequest({
                    action: 'PUBLISH_QDN_RESOURCE',
                    ...resourceParams,
                    data64: await this.$qordial.stringToBase64(JSON.stringify(metadata))
                })
            } catch (error) {
                if (error?.error != "User declined request") {
                    alert("publish error:\n\n" + JSON.stringify(error))
                }
                this.publishing = false
                return
            }

            alert("video was published!")
            this.publishing = false
            this.publishShowDialog = false
        },
    },
}
</script>

<template>
  <div>
    <ResourceDownloader ref="downloader" />

    <o-field grouped>
      <o-field label="Name">
        <NameInput />
      </o-field>
    </o-field>

    <div v-if="qordialAuthStore.username">

      <h3 class="is-size-3 has-text-primary"
          style="margin-top: 3rem;">
        Q-Tube Videos
      </h3>

      <o-field grouped>
        <o-field label="Limit">
          <o-input v-model="qtubeVideosLimit" type="number" />
        </o-field>
      </o-field>

      <div style="display: flex; align-items: center; gap: 2rem;">
        <o-button @click="qtubeVideosRefresh()"
                  :disabled="qtubeVideosLoading">
          {{ qtubeVideosLoading ? "Working, please wait..." : (qtubeVideosData ? "Refresh" : "Load") }}
        </o-button>
        <span v-if="qtubeVideosData">
          found {{ qtubeVideosData.length }} result{{ qtubeVideosData.length == 1 ? '' : 's' }}
        </span>
      </div>

      <o-table v-if="qtubeVideosData"
               :data="qtubeVideosData || []"
               hoverable
               :loading="qtubeVideosLoading">
        <o-table-column label="Service"
                        v-slot="{ row }">
          {{ row.service }}
        </o-table-column>
        <o-table-column label="Name"
                        v-slot="{ row }">
          {{ row.name }}
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
        <o-table-column label="Actions"
                        v-slot="{ row }">
          <div style="display: flex; gap: 0.5rem;">

            <a href="#" @click.prevent="showQtubeVideoDocument(row)">
              <o-icon icon="eye" />
              <span>View</span>
            </a>

            <a href="#" @click.prevent="downloadResource(row)">
              <o-icon icon="download" />
              <span>Download</span>
            </a>

            <a href="#" @click.prevent="viewInQtube(row)">
              <o-icon icon="external-link-alt" />
              <span>View in Q-Tube</span>
            </a>

          </div>

        </o-table-column>
      </o-table>

      <JsonModal v-model:active="qtubeVideoShowDocument"
                 title="Q-Tube Video"
                 :json="qtubeVideoDocument" />

      <h3 class="is-size-3 has-text-primary"
          style="margin-top: 3rem;">
        Video Resources
      </h3>

      <o-field grouped>
        <o-field label="Limit">
          <o-input v-model="videoResourcesLimit" type="number" />
        </o-field>
      </o-field>

      <div style="display: flex; align-items: center; gap: 2rem;">
        <o-button @click="videoResourcesRefresh()"
                  :disabled="videoResourcesLoading">
          {{ videoResourcesLoading ? "Working, please wait..." : (videoResourcesData ? "Refresh" : "Load") }}
        </o-button>
        <span v-if="videoResourcesData">
          found {{ videoResourcesData.length }} result{{ videoResourcesData.length == 1 ? '' : 's' }}
        </span>
      </div>

      <o-table v-if="videoResourcesData"
               :data="videoResourcesData || []"
               hoverable
               :loading="videoResourcesLoading">
        <o-table-column label="Service"
                        v-slot="{ row }">
          {{ row.service }}
        </o-table-column>
        <o-table-column label="Name"
                        v-slot="{ row }">
          {{ row.name }}
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
        <o-table-column label="Actions"
                        v-slot="{ row }">
          <div style="display: flex; gap: 0.5rem;">

            <a href="#" @click.prevent="showVideoResourceMetadata(row)">
              <o-icon icon="eye" />
              <span>Metadata</span>
            </a>

            <a href="#" @click.prevent="downloadResource(row)">
              <o-icon icon="download" />
              <span>Download</span>
            </a>

            <a href="#" @click.prevent="publishInit(row)">
              <o-icon icon="upload" />
              <span>Publish to Q-Tube</span>
            </a>

          </div>
        </o-table-column>
      </o-table>

      <JsonModal v-model:active="videoResourceShowMetadata"
                 title="Resource Metadata"
                 :json="videoResourceMetadata" />

      <o-modal v-model:active="publishShowDialog">
        <div class="card">

          <div class="card-header">
            <div class="card-header-title">Publish to Q-Tube</div>
          </div>

          <div class="card-content">
            <o-field label="Title">
              <o-input v-model="publishTitle" />
            </o-field>
            <o-field label="Description">
              <o-input v-model="publishDescription"
                       type="textarea" />
            </o-field>
            <!-- TODO: is this trick actually enough to sanitize input? -->
            <div ref="publishDescriptionSafe"
                 style="display: none;"
                 v-html="`<p>${publishDescription}</p>`">
            </div>
            <o-field grouped>
              <o-field label="MIME Type">
                <o-input v-model="publishMimeType" />
              </o-field>
              <div style="display: flex; flex-direction: column;">
              <o-field label="Image File">
                <o-upload v-model="publishImageFile"
                          @update:model-value="encodeImage()">

                  <o-button tag="a" variant="primary">
                    <o-icon icon="file" />
                    <span>Choose</span>
                  </o-button>

                </o-upload>
                <span v-if="publishImageFile" class="file-name">
                  {{ publishImageFile.name }}
                </span>
              </o-field>
              <div v-if="publishVideoImage"
                   style="display: flex; gap: 1rem;">
                <img :src="publishVideoImage"
                     style="max-height: 250px; max-width: 400px;" />
                <o-field label="Size" horizontal>
                  {{ publishVideoImageSize }}
                </o-field>
              </div>
              </div>
            </o-field>
            <o-field label="Identifier">
              <!-- TODO: why is this div needed?! -->
              <div style="display: flex; align-items: center; gap: 0.5rem; width: 100%;">
                <span>{{ qtubeIdentifierPrefix }}</span>
                <o-input v-model="publishIdentifierSuffix" expanded />
              </div>
            </o-field>
          </div>

        <div class="card-footer">
          <div class="card-footer-item buttons">

            <o-button variant="primary"
                      @click="publishSubmit()"
                      icon-left="save"
                      :disabled="publishing">
              {{ publishing ? "Working, please wait..." : "Publish" }}
            </o-button>
            <o-button @click="publishShowDialog = false">
              Cancel
            </o-button>

          </div>
        </div>

        </div>
      </o-modal>

    </div>
  </div>
</template>
