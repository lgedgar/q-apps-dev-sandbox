<script setup>

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
            service: null,
            name: null,
            identifier: null,
            data: [],
            searching: false,
        }
    },

    methods: {

        async onSearchFormSubmit(event) {
            event.preventDefault()
            this.searching = true

            let params = {
                action: 'LIST_QDN_RESOURCES',
                service: this.service,
            }
            if (this.name) {
                params.name = this.name
            }
            if (this.identifier) {
                params.identifier = this.identifier
            }

            this.data = await qortalRequest(params)
            this.searching = false
        },
    },
}
</script>

<template>
  <div class="qdn">

    <p class="block">
      Discover existing QDN resources by filtering as you like.
    </p>

    <form ref="searchForm" @submit="onSearchFormSubmit">
      <div style="display: flex; gap: 1rem; align-items: end;">
        <o-field grouped>

          <o-field label="Service">
            <o-select v-model="service">
              <option v-for="svc in services"
                      :key="svc"
                      :value="svc">
                {{ svc }}
              </option>
            </o-select>
          </o-field>

          <o-field label="Name (exact)">
            <o-input v-model="name" />
          </o-field>

          <o-field label="Identifier (exact)">
            <o-input v-model="identifier" />
          </o-field>

        </o-field>

        <div style="padding-bottom: 0.75rem;">
          <o-button variant="primary"
                    native-type="submit"
                    :disabled="searching">
            {{ searching ? "Working, please wait..." : "Search" }}
          </o-button>
        </div>

      </div>
    </form>

    <o-field label="Resources">
      <o-table :data="data"
               :loading="searching">
        <o-table-column label="Name" v-slot="{ row }">
          {{ row.name }}
        </o-table-column>
        <o-table-column label="Identifier" v-slot="{ row }">
          {{ row.identifier }}
        </o-table-column>
        <o-table-column label="Size" v-slot="{ row }">
          {{ formatBytes(row.size) }}
        </o-table-column>
        <o-table-column label="Created" v-slot="{ row }">
          {{ new Date(row.created) }}
        </o-table-column>
      </o-table>
    </o-field>

  </div>
</template>
