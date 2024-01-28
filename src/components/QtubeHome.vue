<script setup>
import QtubeVideoList from './QtubeVideoList.vue'
import QtubeVideoDialog from './QtubeVideoDialog.vue'
</script>

<script>
export default {

    data() {
        return {
            // TODO
            qtubeIdentifierPrefix: 'qtube_vid_',

            searchEntry: null,
            searching: false,
            searchResults: null,
            finalData: null,
            viewing: false,
        }
    },

    mounted() {
        this.searchFocus()
        window.addEventListener('keypress', this.globalKey)
    },

    beforeDestroy() {
        window.removeEventListener('keypress', this.globalKey)
    },

    methods: {

        searchFocus() {
            const input = this.$refs.searchEntry.$el.querySelector('input')
            input.select()
            input.focus()
        },

        globalKey(event) {
            if (event.target.tagName == 'BODY') {

                // focus search box for key: /
                if (event.key == '/') {
                    event.preventDefault()
                    this.$refs.searchEntry.$el.querySelector('input').scrollIntoView()
                    this.searchFocus()
                }
            }
        },

        async searchSubmit(event) {
            event.preventDefault()
            this.searching = true
            this.searchResults = []

            const response = await qortalRequest({
                action: 'SEARCH_QDN_RESOURCES',
                mode: 'ALL',
                service: 'DOCUMENT',
                query: this.searchEntry,
                // exactMatchNames: true,
                identifier: this.qtubeIdentifierPrefix,
                // limit: 1000,     // TODO
                limit: 20,      // TODO
                reverse: true,
            })

            this.searchResults = response
            this.searching = false

            // TODO: ugh fragile?
            this.$refs.searchEntry.$el.querySelector('input').blur()
        },

        async viewVideo(info) {
            this.$refs.qtubeViewDialog.showResourceInfo(info)
        },
    },
}
</script>

<template>
  <div>
    <div class="block"
         style="display: flex; align-items: center; gap: 5rem;">

      <h2 class="is-size-2">Q-Tube</h2>

      <form @submit="searchSubmit">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <o-field grouped>

            <o-input v-model="searchEntry"
                     ref="searchEntry"
                     style="width: 30rem;"/>

            <o-button variant="primary"
                      native-type="submit"
                      icon-left="search" />

            <o-button disabled>Show Advanced</o-button>

          </o-field>
          <o-field v-if="finalData">
            <span>
              found {{ finalData.length }} result{{ finalData.length == 1 ? '' : 's' }}
            </span>
          </o-field>
        </div>
      </form>
    </div>

    <QtubeVideoList :initial-data="searchResults"
                    :loading="searching"
                    @final-data="data => finalData = data"
                    @view-metadata="viewVideo" />

    <QtubeVideoDialog ref="qtubeViewDialog"
                      v-model:active="viewing" />

  </div>
</template>
