<script setup>
import { mapStores } from 'pinia'
import {useQordialAuthStore, JsonModal, NameInput, PrettyBytes, PrettyIdentifier, PrettyTime, ResourceDownloader} from 'qordial'
import VCodeBlock from '@wdns/vue-code-block'
import QtubeVideoThumbnail from './QtubeVideoThumbnail.vue'
import QtubeImagePicker from './QtubeImagePicker.vue'
import FrameExtractor from './FrameExtractor.vue'
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
            qtubeVideoFileSize: null,
            qtubeVideoShowJSON: null,

            qtubeVideoEditing: false,
            qtubeVideoEditingResourceName: null,
            qtubeVideoEditingResourceIdentifier: null,
            qtubeVideoEditingIdentifierSuffix: null,
            qtubeVideoEditingObject: {},
            qtubeVideoEditingExtract1: null,
            qtubeVideoEditingExtract2: null,
            qtubeVideoEditingExtract3: null,
            qtubeVideoEditingExtract4: null,
            qtubeVideoPublishing: false,

            coverImageSource: 'extract1',
            coverImageOther: null,
            magicFileURL: null,
            magicExtracting: false,

            videoResourcesLimit: 20,
            videoResourcesData: null,
            videoResourcesLoading: false,

            videoResourceShowMetadata: false,
            videoResourceMetadata: null,
        }
    },

    computed: {
        ...mapStores(useQordialAuthStore),

        qtubeVideoEditingHtmlDescription() {
            return this.$refs.qtubeVideoEditingDescriptionSafe.innerHTML
        },
    },

    watch: {
        coverImageSource (to, from) {
            if (to == 'extract1') {
                this.qtubeVideoEditingObject.videoImage = this.qtubeVideoEditingExtract1
            } else if (to == 'extract2') {
                this.qtubeVideoEditingObject.videoImage = this.qtubeVideoEditingExtract2
            } else if (to == 'extract3') {
                this.qtubeVideoEditingObject.videoImage = this.qtubeVideoEditingExtract3
            } else if (to == 'extract4') {
                this.qtubeVideoEditingObject.videoImage = this.qtubeVideoEditingExtract4
            } else {
                this.qtubeVideoEditingObject.videoImage = this.coverImageOther
            }
        },
    },

    methods: {

        async magicExtract() {

            // warn user about size of potential download
            const size = await this.fetchVideoSize(this.qtubeVideoEditingObject.videoReference)
            if (!confirm("This may require downloading the video file.\n\n"
                         + "\t video file size is: " + this.$qordial.formatBytes(size) + "\n\n"
                         + "Are you sure you want to do that?")) {
                return
            }

            // fetch video blob
            const blob = await this.$refs.downloader.fetchResource(
                this.qtubeVideoEditingObject.videoReference)

            // update magic URL to begin frame extraction
            this.magicExtracting = true
            this.magicFileURL = URL.createObjectURL(blob)
        },

        framesExtracted(frames) {
            if (frames?.length) {
                this.qtubeVideoEditingExtract1 = frames[0]
                this.qtubeVideoEditingExtract2 = frames[1]
                this.qtubeVideoEditingExtract3 = frames[2]
                this.qtubeVideoEditingExtract4 = frames[3]
                if (this.coverImageSource == 'extract1') {
                    this.qtubeVideoEditingObject.videoImage = this.qtubeVideoEditingExtract1
                } else if (this.coverImageSource == 'extract2') {
                    this.qtubeVideoEditingObject.videoImage = this.qtubeVideoEditingExtract2
                } else if (this.coverImageSource == 'extract3') {
                    this.qtubeVideoEditingObject.videoImage = this.qtubeVideoEditingExtract3
                } else if (this.coverImageSource == 'extract4') {
                    this.qtubeVideoEditingObject.videoImage = this.qtubeVideoEditingExtract4
                }
                this.magicExtracting = false
            }
        },

        async qtubeVideosRefresh() {
            this.qtubeVideosLoading = true
            const url = `/arbitrary/resources/search?mode=ALL&service=DOCUMENT&name=${this.qordialAuthStore.username}&identifier=${this.qtubeIdentifierPrefix}&limit=${this.qtubeVideosLimit}&includemetadata=false&reverse=true&excludeblocked=true&exactmatchnames=true`
            const response = await fetch(url)
            this.qtubeVideosData = await response.json()
            this.qtubeVideosLoading = false
        },

        async fetchVideoSize(resource) {
            if (resource) {
                const response = await qortalRequest({
                    action: 'LIST_QDN_RESOURCES',
                    service: 'VIDEO',
                    name: resource.name,
                    identifier: resource.identifier,
                })
                if (response.length) {
                    return response[0].size
                }
            }
        },

        async showQtubeVideoDocument(resource) {
            this.qtubeVideoDocumentResource = resource
            this.qtubeVideoDocument = await this.$qordial.fetchResourceObject(resource)
            this.qtubeVideoShowJSON = false
            this.qtubeVideoFileSize = await this.fetchVideoSize(
                this.qtubeVideoDocument?.videoReference)
            this.qtubeVideoShowDocument = true
        },

        async qtubeVideoInitEdit(resource, videoResource) {

            // just in case view dialog is open, close it
            // TODO: should maybe check first, and re-show view dialog
            // if user cancels edit
            this.qtubeVideoShowDocument = false

            // establish what we're editing
            if (resource) {

                // fetch and edit the given DOCUMENT resource
                this.qtubeVideoEditingResourceName = resource.name
                this.qtubeVideoEditingResourceIdentifier = resource.identifier
                this.qtubeVideoEditingObject = await this.$qordial.fetchResourceObject(resource)
                this.qtubeVideoEditingIdentifierSuffix = null

                this.coverImageSource = 'other'
                this.coverImageOther = this.qtubeVideoEditingObject?.videoImage
                this.qtubeVideoEditingExtract1 = this.qtubeVideoEditingObject?.extracts?.[0] || null
                this.qtubeVideoEditingExtract2 = this.qtubeVideoEditingObject?.extracts?.[1] || null
                this.qtubeVideoEditingExtract3 = this.qtubeVideoEditingObject?.extracts?.[2] || null
                this.qtubeVideoEditingExtract4 = this.qtubeVideoEditingObject?.extracts?.[3] || null

            } else if (videoResource) {

                // fetch metadata for the given VIDEO resource and
                // create a new DOCUMENT for Q-Tube
                const metadata = await this.$qordial.fetchResourceMetadata(videoResource)
                this.qtubeVideoEditingResourceName = null
                this.qtubeVideoEditingResourceIdentifier = null
                this.qtubeVideoEditingObject = {
                    title: metadata?.title,
                    fullDescription: metadata?.description,
                    videoType: metadata?.mimeType,
                    videoReference: {
                        service: videoResource.service,
                        name: videoResource.name,
                        identifier: videoResource.identifier,
                    },
                }

                this.coverImageSource = 'extract1'
                this.coverImageOther = null
                this.qtubeVideoEditingExtract1 = null
                this.qtubeVideoEditingExtract2 = null
                this.qtubeVideoEditingExtract3 = null
                this.qtubeVideoEditingExtract4 = null

                // nb. video metadata description may have other data
                // embedded within it; strip that out if so
                if (this.qtubeVideoEditingObject.fullDescription) {
                    this.qtubeVideoEditingObject.fullDescription =
                        this.qtubeVideoEditingObject.fullDescription.replace(
                            /^\*\*category.+code:.+\*\*/,
                            '')
                }

                // suggest default identifier for new DOCUMENT
                // resource, based on VIDEO identifier
                this.qtubeVideoEditingIdentifierSuffix = videoResource.identifier + '_metadata'
                // nb. must strip away qtube prefix if already present
                if (this.qtubeVideoEditingIdentifierSuffix.startsWith(this.qtubeIdentifierPrefix)) {
                    this.qtubeVideoEditingIdentifierSuffix =
                        this.qtubeVideoEditingIdentifierSuffix.slice(
                            this.qtubeIdentifierPrefix.length)
                }
            }

            // show edit dialog
            this.qtubeVideoEditing = true
            this.$nextTick(() => {
                this.$refs.qtubeEditTop.scrollIntoView()
            })
        },

        async qtubeVideoPublish() {

            if (!this.qtubeVideoEditingObject.videoImage) {
                alert("Image File is required for publishing to Q-Tube.")
                return
            }

            this.qtubeVideoPublishing = true

            const resourceParams = {
                service: 'DOCUMENT',
                name: this.qordialAuthStore.username,
            }
            if (this.qtubeVideoEditingResourceName) {
                // editing an existing DOCUMENT, no need to confirm
                resourceParams.identifier = this.qtubeVideoEditingResourceIdentifier
            } else {
                // supposedly creating a new DOCUMENT but should double-check
                // TODO: should validate the identifier somehow?
                resourceParams.identifier = this.qtubeIdentifierPrefix + this.qtubeVideoEditingIdentifierSuffix
                if (! await this.$qordial.confirmPublish(resourceParams)) {
                    this.qtubeVideoPublishing = false
                    return
                }
            }

            const extracts = []
            if (this.qtubeVideoEditingExtract1) {
                extracts.push(this.qtubeVideoEditingExtract1)
            }
            if (this.qtubeVideoEditingExtract2) {
                extracts.push(this.qtubeVideoEditingExtract2)
            }
            if (this.qtubeVideoEditingExtract3) {
                extracts.push(this.qtubeVideoEditingExtract3)
            }
            if (this.qtubeVideoEditingExtract4) {
                extracts.push(this.qtubeVideoEditingExtract4)
            }

            const metadata = {
                ...this.qtubeVideoEditingObject,
                htmlDescription: this.qtubeVideoEditingHtmlDescription,
            }
            if (extracts.length) {
                metadata.extracts = extracts
            }
            if (!this.qtubeVideoEditingResourceName) {
                // specify schema version when creating new DOCUMENT
                metadata.version = 1
            }

            try {
                await qortalRequest({
                    action: 'PUBLISH_QDN_RESOURCE',
                    ...resourceParams,
                    data64: await this.$qordial.objectToBase64(metadata)
                })
            } catch (error) {
                if (error?.error != "User declined request") {
                    alert("publish error:\n\n" + JSON.stringify(error))
                }
                this.qtubeVideoPublishing = false
                return
            }

            alert("video was published!")
            this.qtubeVideoPublishing = false
            this.qtubeVideoEditing = false
        },

        async downloadResource(resource) {
            return await this.$refs.downloader.downloadResource(resource)
        },

        async viewInQtube(resource) {
            await qortalRequest({
                action: 'OPEN_NEW_TAB',
                qortalLink: `qortal://APP/Q-Tube/video/${resource.name}/${resource.identifier}`,
            })
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

        async showVideoResourceMetadata(resource) {
            this.videoResourceMetadata = await this.$qordial.fetchResourceMetadata(resource)
            this.videoResourceShowMetadata = true
        },
    },
}
</script>

<template>
  <div>
    <ResourceDownloader ref="downloader" />
    <FrameExtractor :video-source="magicFileURL"
                    @frames-extracted="framesExtracted" />

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

            <a href="#" @click.prevent="qtubeVideoInitEdit(row)">
              <o-icon icon="edit" />
              <span>Edit</span>
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

      <o-modal v-model:active="qtubeVideoShowDocument">
        <div class="card">

          <div class="card-header">
            <div class="card-header-title">Q-Tube Video</div>
          </div>

          <div class="card-content"
               v-if="qtubeVideoDocument">

            <div class="columns">

              <div class="column">

                <h3 class="is-size-3">
                  <span>{{ qtubeVideoDocument.title }}</span>
                </h3>

                <div v-if="qtubeVideoDocument.htmlDescription"
                     v-html="qtubeVideoDocument.htmlDescription">
                </div>
                <div v-else>
                  {{ qtubeVideoDocument.fullDescription }}
                </div>

                <div class="block"></div>

                <o-field grouped>

                <o-field label="Video Type">
                  <span>{{ qtubeVideoDocument.videoType }}</span>
                </o-field>

                <o-field label="File Size">
                  <PrettyBytes :value="qtubeVideoFileSize" />
                </o-field>

                </o-field>

                <o-field label="Filename">
                  <span>{{ qtubeVideoDocument.filename }}</span>
                </o-field>

                <o-field grouped>
                  <o-field label="Created">
                    <PrettyTime :value="qtubeVideoDocumentResource.created" />
                  </o-field>
                  <o-field label="Updated">
                    <PrettyTime :value="qtubeVideoDocumentResource.updated" />
                  </o-field>
                </o-field>

                <o-field label="Identifier">
                  <PrettyIdentifier :value="qtubeVideoDocumentResource.identifier" />
                </o-field>

              </div>
              <div class="column">

                <QtubeVideoThumbnail v-if="qtubeVideoDocument.videoImage"
                                     :video-image="qtubeVideoDocument.videoImage"
                                     :frame-images="qtubeVideoDocument.extracts || []" />

              </div>
            </div>

            <div class="block"
                 style="display: flex; justify-content: space-between;">
              <o-button @click="qtubeVideoShowJSON = !qtubeVideoShowJSON">
                {{ qtubeVideoShowJSON ? "Hide" : "Show" }} JSON
              </o-button>
              <o-button variant="primary"
                        icon-left="edit"
                        @click="qtubeVideoInitEdit(qtubeVideoDocumentResource)">
                Edit This
              </o-button>
            </div>

            <div v-if="qtubeVideoShowJSON">
              <VCodeBlock :code="JSON.stringify(qtubeVideoDocument, null, 2)" highlightjs />
            </div>

          </div>
        </div>
      </o-modal>

      <o-modal v-model:active="qtubeVideoEditing" cancelable="escape,x">
        <div ref="qtubeEditTop"></div>
        <div class="card">

          <div class="card-header">
            <div class="card-header-title">
              {{ qtubeVideoEditingResourceName ? "Edit" : "Create" }}
              Q-Tube Video
            </div>
          </div>

          <div class="card-content">

            <o-field v-if="qtubeVideoEditingResourceName"
                     grouped class="is-pulled-right">
              <o-field label="Name" horizontal>
                <span>{{ qtubeVideoEditingResourceName }}</span>
              </o-field>
              <o-field label="Identifier" horizontal>
                <PrettyIdentifier :value="qtubeVideoEditingResourceIdentifier" />
              </o-field>
            </o-field>

            <o-field label="Title">
              <o-input v-model="qtubeVideoEditingObject.title" />
            </o-field>

            <o-field label="Description">
              <o-input v-model="qtubeVideoEditingObject.fullDescription"
                       type="textarea" />
            </o-field>
            <!-- TODO: is this trick actually enough to sanitize input? -->
            <div ref="qtubeVideoEditingDescriptionSafe"
                 style="display: none;"
                 v-html="`<p>${qtubeVideoEditingObject.fullDescription}</p>`">
            </div>

            <o-field label="MIME Type">
              <o-input v-model="qtubeVideoEditingObject.videoType" />
            </o-field>

            <o-field grouped>
              <o-field label="Cover Image Source">
                <o-select v-model="coverImageSource">
                  <option value="extract1">Extract #1</option>
                  <option value="extract2">Extract #2</option>
                  <option value="extract3">Extract #3</option>
                  <option value="extract4">Extract #4</option>
                  <option value="other">Other</option>
                </o-select>
              </o-field>
              <QtubeVideoThumbnail :video-image="qtubeVideoEditingObject.videoImage" />
            </o-field>

            <QtubeImagePicker v-show="coverImageSource == 'other'"
                              label="Cover Image"
                              v-model="coverImageOther"
                              @update:model-value="img => qtubeVideoEditingObject.videoImage = img" />

            <div class="block has-text-centered">
              <o-button variant="primary"
                        @click="magicExtract()"
                        :disabled="magicExtracting">
                {{ magicExtracting ? "Working, please wait..." : "Magically extract images from the video file" }}
              </o-button>
            </div>

            <QtubeImagePicker label="Extract #1"
                              v-model="qtubeVideoEditingExtract1"
                              :disabled="magicExtracting" />
            <QtubeImagePicker label="Extract #2"
                              v-model="qtubeVideoEditingExtract2"
                              :disabled="magicExtracting" />
            <QtubeImagePicker label="Extract #3"
                              v-model="qtubeVideoEditingExtract3"
                              :disabled="magicExtracting" />
            <QtubeImagePicker label="Extract #4"
                              v-model="qtubeVideoEditingExtract4"
                              :disabled="magicExtracting" />

            <div v-if="!qtubeVideoEditingResourceName"
                 style="display: flex; gap: 1rem; width: 100%;">
              <o-field label="Name">
                <NameInput />
              </o-field>
              <div style="flex-grow: 1;">
                <o-field label="Identifier" expanded>
                  <!-- TODO: why is this div needed?! -->
                  <div style="display: flex; align-items: center; gap: 0.5rem; width: 100%;">
                    <span>{{ qtubeIdentifierPrefix }}</span>
                    <o-input v-model="qtubeVideoEditingIdentifierSuffix" expanded />
                  </div>
                </o-field>
              </div>
            </div>

            <div class="card-footer">
              <div class="card-footer-item buttons">
                <o-button variant="primary"
                          @click="qtubeVideoPublish()"
                          icon-left="save"
                          :disabled="qtubeVideoPublishing">
                  {{ qtubeVideoPublishing ? "Working, please wait..." : "Publish" }}
                </o-button>
                <o-button @click="qtubeVideoEditing = false">
                  Cancel
                </o-button>
              </div>
            </div>

          </div>
        </div>
      </o-modal>

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

            <a href="#" @click.prevent="qtubeVideoInitEdit(null, row)">
              <o-icon icon="upload" />
              <span>Publish to Q-Tube</span>
            </a>

          </div>
        </o-table-column>
      </o-table>

      <JsonModal v-model:active="videoResourceShowMetadata"
                 title="Resource Metadata"
                 :json="videoResourceMetadata" />

    </div>
  </div>
</template>
