import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

import './assets/main.css'
import { PeerService } from './services/peer'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

const peerService = new PeerService();

app.provide('peerService', peerService)

window.addEventListener('pagehide', () => {
  peerService.destroy()
})
