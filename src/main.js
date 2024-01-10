import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { createVCodeBlock } from '@wdns/vue-code-block'

import App from './App.vue'
import router from './router'

const VCodeBlock = createVCodeBlock({
  // options
})

const app = createApp(App)

app.use(createPinia())
app.use(Oruga, bulmaConfig)
app.use(router)
app.use(VCodeBlock)

app.mount('#app')
