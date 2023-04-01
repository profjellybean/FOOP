<script setup lang="ts">
import { PeerService } from '@/services/peer'
import { useMessageStore } from '@/stores/messages'
import { ref } from 'vue'

const peerService = new PeerService()
peerService.initSelf()

// a simple pinia store to show sending simple text messages between peers
const messageStore = useMessageStore()

const peerId = ref<HTMLInputElement | null>(null)
const connectPeer = () => {
  if (peerId.value === null) return

  peerService.connectToPeer(peerId.value!.value)
}

window.addEventListener('pagehide', () => {
  peerService.destroy()
})

const message = ref<HTMLInputElement | null>(null)
const sendMessage = () => {
  if (peerId.value === null) return

  messageStore.addMessage(message.value!.value)
  peerService.sendMessage(message.value!.value)
}
</script>

<template>
  <main class="h-full w-full bg-blue-950 flex flex-wrap gap-8 justify-center items-center">
    <!-- TODO: below would be a simple form to be able to join a game based on an ID -->
    <!-- <div class="bg-white shadow-md rounded-lg p-8 text-blue-950 max-w-md">
        <h3 class="text-lg font-mono mb-3">Welcome</h3>
        <p class="text-sm font-mono">You can either create a new game or join an existing game by pasting a URL or only the token into the below input field</p>
        <hr class="my-4 border-blue-950">
      
        <button class="bg-blue-950 text-white rounded-lg p-2 w-full">Create Game</button>

        <div class="flex flex-wrap items-center justify-center my-4">
          <p class="text-lg font-mono">OR</p>
        </div>

        <input type="text" id="game-token" placeholder="Game Token or URL" class="w-full border border-blue-950 rounded-lg p-2">
      </div> -->
    <div class="bg-white shadow-md rounded-lg p-8 text-blue-950 max-w-md font-mono">
      Your peer ID: {{ peerService.peerId ?? '' }}

      <!-- <div>
          <button class="bg-blue-950 text-white rounded-lg p-2 w-full" @click="connectGame">COnnect to game</button>
        </div> -->
      <input
        type="text"
        ref="peerId"
        placeholder="Peer id for now"
        class="w-full border border-blue-950 rounded-lg p-2 mt-4"
        @keydown.enter="connectPeer"
      />

      <hr class="my-6 border-gray-200" />

      <div>
        <h3 class="text-lg font-mono mb-3">Connected Peers</h3>
        <ul v-if="peerService.peerConnections.value.length > 0">
          <li v-for="(conn, idx) in peerService.peerConnections.value" :key="idx">
            {{ conn.peer }}
          </li>
        </ul>
        <p class="text-fuchsia-400 text-sm" v-else>No peers connected</p>
      </div>

      <div v-if="peerService.peerConnections.value.length > 0">
        <hr class="my-6 border-gray-200" />

        <div class="px-8">
          <h3 class="text-lg font-mono mb-3">Send message to peers</h3>
          <input
            type="text"
            ref="message"
            placeholder="Message"
            class="w-full border border-blue-950 rounded-lg p-2 mt-4 mb-6"
            @keydown.enter="sendMessage"
          />
        </div>
        <div
          class="w-full rounded-b-lg bg-gray-200 border-t border-gray-400 px-8 pb-6 text-gray-900"
          v-if="messageStore.messages.length > 0"
        >
          <h3 class="text-xs text-gray-400 font-mono mb-1">Message log</h3>
          <ul>
            <li v-for="(msg, idx) in messageStore.messages" :key="idx">
              {{ msg }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </main>
</template>
