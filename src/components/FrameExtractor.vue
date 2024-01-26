<script setup>

// nb. this entire module is very much based on
// https://github.com/Qortal/q-tube/blob/da2c2b11c992f5f5c6bdd72392656af9fc135c8d/src/components/common/FrameExtractor/FrameExtractor.tsx

import Compressor from 'compressorjs'
</script>

<script>
export default {

    props: {
        videoSource: null,
    },

    emits: ['framesExtracted'],

    async mounted() {

        // whenever new video media is loaded, begin frame extraction
        this.$refs.video.addEventListener('loadedmetadata', () => {
            if (isFinite(this.$refs.video.duration)) {
                this.extractFrames()
            // } else {
            //     alert("not finite")
            //     this.$emit('framesExtracted', [])
            }
        })
    },

    methods: {

        async extractFrames() {
            const video = this.$refs.video
            const canvas = this.$refs.canvas
            const context = canvas.getContext('2d')

            canvas.width = video.videoWidth
            canvas.height = video.videoHeight

            const timestamps = []
            const section = video.duration / 4
            for (let i = 0; i < 4; i++) {
                const randomTime = Math.random() * section + i * section
                timestamps.push(randomTime)
            }

            const frames = []
            for (const time of timestamps) {
                await new Promise((resolve) => {

                    const onSeeked = () => {
                        context.drawImage(video, 0, 0)
                        canvas.toBlob(async blob => {

                            let compressedFile
                            await new Promise(resolve => {
                                new Compressor(blob, {
                                    quality: 0.8,
                                    maxWidth: 750,
                                    mimeType: 'image/webp',
                                    success(result) {
                                        const file = new File([result], "name", {
                                            type: "image/webp",
                                        })
                                        compressedFile = file
                                        resolve()
                                    },
                                    error(err) {},
                                })
                            })

                            if (!compressedFile) {
                                alert("compress error?")
                                return
                            }

                            const frame = await this.$qordial.fileToBase64(compressedFile)
                            frames.push(frame)
                            resolve()
                        }, 'image/png')

                        video.removeEventListener('seeked', onSeeked)
                    }
                    video.addEventListener('seeked', onSeeked, { once: true })
                    video.currentTime = time
                })
            }

            this.$emit('framesExtracted', frames)
        },
    },
}
</script>

<template>
  <div style="display: none;">
    <o-field grouped>
      <o-field label="Video">
        <video ref="video" :src="videoSource"
               style="border: 1px solid blue;" />
      </o-field>
      <o-field label="Canvas">
        <canvas ref="canvas"
                style="border: 1px solid red;" />
      </o-field>
    </o-field>
  </div>
</template>
