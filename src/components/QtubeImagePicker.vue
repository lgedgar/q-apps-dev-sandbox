<script setup>
import QtubeVideoThumbnail from './QtubeVideoThumbnail.vue'
import Compressor from 'compressorjs'
</script>

<script>
export default {
    props: {
        modelValue: null,
        label: {
            type: String,
            default: "Image File",
        },
        disabled: {
            type: Boolean,
        },
    },

    emits: ['update:modelValue'],

    data() {
        return {
            imageFile: null,
        }
    },

    computed: {
        imageSize() {
            if (this.modelValue) {
                return this.$qordial.formatBytes(this.modelValue.length)
            }
        },
    },

    watch: {
        modelValue(to, from) {
            this.imageFile = null
        },
    },

    methods: {

        async encodeImage() {
            if (!this.imageFile) {
                return
            }

            // nb. this was heavily inspired by
            // https://github.com/Qortal/q-tube/blob/ab8d9d1983b6fb5274f1e2f94e1d611025807fca/src/components/PublishVideo/PublishVideo.tsx#L578
            let compressedFile
            await new Promise(resolve => {
                new Compressor(this.imageFile, {
                    quality: 0.8,
                    maxWidth: 750,
                    mimeType: 'image/webp',
                    success(result) {
                        const file = new File([result], "name", {
                            type: "image/webp",
                        });
                        compressedFile = file
                        resolve();
                    },
                    error(err) {},
                })
            })

            if (!compressedFile) {
                alert("compress error?")
                return
            }

            const imageString = await this.$qordial.fileToBase64(compressedFile)
            this.$emit('update:modelValue', imageString)
        },
    },
}
</script>

<template>
  <div style="border: 1px solid gray; padding: 1rem; margin-bottom: 1rem;">

    <o-field :label="label" horizontal>
      <div style="display: flex;">
      <o-upload v-model="imageFile"
                @update:model-value="encodeImage()">
        <o-button tag="a" variant="primary"
                  :disabled="disabled">
          <o-icon icon="file" />
          <span>Choose</span>
        </o-button>
      </o-upload>
      <span v-if="imageFile" class="file-name">
        {{ imageFile.name }}
      </span>
      </div>
    </o-field>

    <o-field v-if="modelValue"
             label="Size" horizontal>
      <span>{{ imageSize }}</span>
    </o-field>

    <div v-if="modelValue">
      <QtubeVideoThumbnail :video-image="modelValue" />
    </div>

  </div>
</template>
