<script setup>
import VCodeBlock from '@wdns/vue-code-block'
import {ResourceDownloader, PrettyBytes, PrettyTime, PrettyIdentifier, CopyableText} from 'qordial'
import QtubeVideoThumbnail from './QtubeVideoThumbnail.vue'
</script>

<script>
export default {

    props: {
        active: {
            type: Boolean,
        },
    },

    emits: [
        'update:active',
        'editMetadata',
    ],

    expose: ['showResourceInfo'],

    computed: {

        modalActive: {
            get() {
                return this.active
            },
            set(value) {
                this.$emit('update:active', value)
            },
        },
    },

    data() {
        return {
            loading: false,
            resourceInfo: null,
            videoDocument: null,
            videoFileSize: null,
            qtubeLink: null,
            showJSON: false,
            allowEdit: false,
        }
    },

    methods: {

        async showResourceInfo(info, allowEdit) {
            this.loading = true

            this.resourceInfo = info
            this.videoDocument = null
            this.videoFileSize = null
            this.qtubeLink = `qortal://APP/Q-Tube/video/${this.resourceInfo.name}/${this.resourceInfo.identifier}`
            this.showJSON = false
            this.allowEdit = !!allowEdit
            this.modalActive = true

            this.videoDocument = await this.$qordial.fetchResourceObject(this.resourceInfo)

            const video = this.videoDocument.videoReference
            if (video) {
                const response = await qortalRequest({
                    action: 'LIST_QDN_RESOURCES',
                    service: 'VIDEO',
                    name: video.name,
                    identifier: video.identifier,
                })
                if (response.length) {
                    this.videoFileSize = response[0].size
                }
            }

            this.loading = false
        },

    },
}
</script>

<template>
  <o-modal v-model:active="modalActive">
    <ResourceDownloader ref="downloader" />
    <o-loading v-model:active="loading" :full-page="false" />
    <div class="card">

      <div class="card-header">
        <div class="card-header-title">Q-Tube Video</div>
      </div>

      <div class="card-content"
           v-if="videoDocument">

        <div class="columns">
          <div class="column">

            <h3 class="is-size-3">
              <span>{{ videoDocument.title }}</span>
            </h3>

            <div v-if="videoDocument.htmlDescription"
                 v-html="videoDocument.htmlDescription">
            </div>
            <div v-else>
              {{ videoDocument.fullDescription }}
            </div>

            <div class="block"></div>

            <o-field grouped>
              <o-field label="Video Type">
                <span>{{ videoDocument.videoType }}</span>
              </o-field>
              <o-field label="File Size">
                <PrettyBytes :value="videoFileSize" />
              </o-field>
            </o-field>

            <o-field label="Filename">
              <span>{{ videoDocument.filename }}</span>
            </o-field>

            <o-field grouped>
              <o-field label="Created">
                <PrettyTime :value="resourceInfo.created" />
              </o-field>
              <o-field label="Updated">
                <PrettyTime :value="resourceInfo.updated" />
              </o-field>
            </o-field>

          </div>
          <div class="column">

            <QtubeVideoThumbnail v-if="videoDocument.videoImage"
                                 bordered
                                 :video-image="videoDocument.videoImage"
                                 :frame-images="videoDocument.extracts || []" />

          </div>
        </div>

        <o-field label="Identifier">
          <PrettyIdentifier :value="resourceInfo.identifier" />
        </o-field>

        <o-field label="Q-Tube Link"
                 style="white-space: nowrap;">
          <CopyableText :text="qtubeLink" />
        </o-field>

        <div class="block buttons"
             style="display: flex; justify-content: space-between;">
          <div>
            <o-button @click="showJSON = !showJSON">
              {{ showJSON ? "Hide" : "Show" }} JSON
            </o-button>
            <o-button v-if="allowEdit"
                      variant="warning"
                      icon-left="edit"
                      @click="$emit('editMetadata', resourceInfo)">
              Edit Metadata
            </o-button>
            <o-button variant="primary"
                      icon-left="download"
                      @click="$refs.downloader.downloadResource(resourceInfo)">
              Download Metadata
            </o-button>
            <o-button variant="primary"
                      icon-left="download"
                      @click="$refs.downloader.downloadResource(resourceInfo.videoReference)">
              Download Video
            </o-button>
          </div>

          <o-button @click="modalActive = false">
            Close
          </o-button>

        </div>

        <div v-if="showJSON">
          <VCodeBlock :code="JSON.stringify(videoDocument, null, 2)" highlightjs />
        </div>

      </div>
    </div>
  </o-modal>
</template>
