<script>

// nb. most of this component logic was copied/adapted from
// https://github.com/Qortal/q-tube/blob/469688b4e04bda17f44bf0df7998fc4e75b4410c/src/pages/Home/VideoCardImageContainer.tsx

export default {

    props: {
        videoImage: undefined,
        frameImages: {
            type: Array,
            default: [],
        },
        bordered: {
            type: Boolean,
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
  <div class="thumbnail-wrapper"
       :style="{border: bordered ? '1px solid gray' : null}">
    <img ref="img" :src="src" />
    <o-skeleton v-if="!videoImage"
                height="150" width="266"
                :animated="videoImage === undefined" />
  </div>
</template>

<style scoped>

.thumbnail-wrapper {
    height: 150px;
    width: 266px;
    background-color: lightgray;
    /* border: 1px solid gray; */
    /* border-radius: 0.5rem; */
    display: flex;
    align-items: center;
}

img {
    /* border-radius: 0.5rem; */
    display: block;
    margin: auto;
    max-height: 150px;
    max-width: 266px;
}

</style>
