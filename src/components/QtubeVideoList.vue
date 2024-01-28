<script setup>
import {PrettyIdentifier} from 'qordial'
import QtubeVideoThumbnail from './QtubeVideoThumbnail.vue'
</script>

<script>
export default {

    props: {
        initialData: null,
        loading: {
            type: Boolean,
        },
        removeInvalid: {
            type: Boolean,
            default: true,
        },
    },

    emits: [
        'finalData',
        'viewMetadata',
    ],

    data() {
        return {
            finalData: [],
        }
    },

    watch: {

        async initialData(to, from) {
            this.finalData = await this.getFinalData()
            this.$emit('finalData', this.finalData)
        },
    },

    methods: {

        async getFinalData() {
            // nb. this is responsible for removing "invalid" video entries;
            // that way the caller does need to concerm themselves and we
            // have shared logic for the filtering

            const data = []
            for (let info of this.initialData || []) {

                if (!info._loaded) {

                    // retrieve actual JSON for Q-Tube DOCUMENT
                    const metadata = await this.$qordial.fetchResourceObject(info)
                    // TODO: magic error number, should represent better somehow?
                    if (metadata.error != 1401) {
                        info.title = metadata.title
                        info.videoReference = metadata.videoReference
                        info.videoImage = metadata.videoImage || null
                        info.extracts = metadata.extracts || []
                        info._loaded = true
                    }
                }

                if (this.shouldIncludeData(info)) {
                    data.push(info)
                }
            }

            return data
        },

        shouldIncludeData(info) {
            if (this.removeInvalid) {
                if (!info.videoReference) {
                    return false
                }
                if (info.videoReference.name != info.name) {
                    return false
                }
            }
            return true
        },

        async supplementData() {

            for (let data of this.finalData) {
                // TODO: nothing else is setting/using this flag yet
                if (!data._loaded) {
                    const info = data
                    const metadata = await this.$qordial.fetchResourceObject(info)
                    if (metadata.error != 1401) {
                        data.title = metadata.title
                        data.videoImage = metadata.videoImage || null
                        data.extracts = metadata.extracts || []
                        data._loaded = true
                    }
                }
            }
        },
    },
}
</script>

<template>
  <div style="max-width: 1200px;">
    <!-- TODO: should figure out the actual best width above. -->
    <o-loading :active="loading" :full-page="false" />
    <div class="videos">

      <div v-for="row in finalData"
           :key="`${row.name}:${row.identifier}`"
           class="video">

        <a v-if="row._loaded"
           href="#" @click.prevent="$emit('viewMetadata', row)">

          <QtubeVideoThumbnail class="video-thumbnail"
                               :video-image="row.videoImage"
                               :frame-images="row.extracts || []" />

          <span class="video-title">{{ row.title }}</span>
        </a>

        <span v-else>
          identifier: <PrettyIdentifier :value="row.identifier" />
        </span>

      </div>
    </div>
  </div>
</template>

<style scoped>

.videos {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

.videos .video {
    width: 266px;
}

.videos .video a {
    color: black;
    display: inline-block;
    width: 100%;
}

body.dark .videos .video a {
    color: white;
}

.videos .video-thumbnail {
    margin-bottom: 1rem;
}

.videos .video .video-title {
    font-weight: bold;
}

</style>
