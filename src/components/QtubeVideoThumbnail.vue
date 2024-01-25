<script>

// nb. most of this component logic was copied/adapted from
// https://github.com/Qortal/q-tube/blob/469688b4e04bda17f44bf0df7998fc4e75b4410c/src/pages/Home/VideoCardImageContainer.tsx

export default {
    props: {
        videoImage: {
            type: String,
            required: true,
        },
        frameImages: {
            type: Array,
            default: [],
        },
    },

    data() {
        return {
            src: this.videoImage,
            currentInterval: null,
        }
    },

    watch: {
        videoImage(to, from) {
            this.src = to
        },
    },

    mounted() {

        this.$refs.img.addEventListener('mouseenter', () => {
            if (!this.frameImages.length) {
                return
            }
            let frameIndex = 0
            if (this.interval) {
                clearInterval(this.interval)
            }
            this.interval = setInterval(() => {
                this.src = this.frameImages[frameIndex]
                frameIndex = (frameIndex + 1) % this.frameImages.length
            }, 500) // Change frame every 500 ms
        })

        this.$refs.img.addEventListener('mouseleave', () => {
            if (this.interval) {
                clearInterval(this.interval)
                this.interval = null
                this.src = this.videoImage
            }
        })
    },
}
</script>

<template>
  <img ref="img" :src="src"
       style="max-height: 150px; max-width: 266px;" />
</template>
