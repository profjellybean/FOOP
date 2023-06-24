import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

import './assets/main.css'
import { usePeerService } from './composables/peer'

import { OhVueIcon, addIcons } from "oh-vue-icons";
import { FaCat, GiSeatedMouse } from "oh-vue-icons/icons";
addIcons(FaCat, GiSeatedMouse);

const app = createApp(App)

app.component("v-icon", OhVueIcon);

app.use(createPinia())
app.use(router)

app.mount('#app')

const { peerService } = usePeerService();

window.addEventListener('pagehide', () => {
  peerService.value.destroy()
})
