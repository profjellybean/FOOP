import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

import './assets/main.css'
import { usePeerService } from './composables/peer'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

const { peerService } = usePeerService();

window.addEventListener('pagehide', () => {
  peerService.value.destroy()
})
