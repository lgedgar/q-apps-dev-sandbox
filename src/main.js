import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { createVCodeBlock } from '@wdns/vue-code-block'

import { library } from "@fortawesome/fontawesome-svg-core"
import { fas } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"

import App from './App.vue'
import router from './router'

library.add(fas)

const VCodeBlock = createVCodeBlock({
  // options
})

const app = createApp(App)

app.use(createPinia())
app.component('VueFontawesome', FontAwesomeIcon)
app.use(Oruga, {
    ...bulmaConfig,
    iconComponent: 'vue-fontawesome',
    iconPack: 'fas',
})
app.use(router)
app.use(VCodeBlock)

app.mount('#app')
