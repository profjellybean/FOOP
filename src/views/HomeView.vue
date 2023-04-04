<script setup lang="ts">
import router from '@/router';
import type { PeerService } from '@/services/peer';
import { useClipboard } from '@vueuse/core';
import { inject, ref } from 'vue';

const peerService: PeerService | undefined = inject('peerService');

const { copy } = useClipboard()

const parseLobbyId = (lobbyId: string) => {
  if (lobbyId.startsWith('http')) {
    const url = new URL(lobbyId)
    const id = url.pathname.replace('/lobby/', '')

    return id
  }

  return lobbyId
}

const initPeer = async () => {
  const res = await peerService!.initSelf();

  if (!res) {
    console.error("could not init peer service correctly, cannot create game");
    return;
  }
}

const createGame = async () => {
  if (peerService === undefined) return

  await initPeer()

  copy(window.location.protocol + '//' + window.location.host + "/lobby/" + peerService.peerId.value);

  router.push(`/lobby/${peerService.peerId.value}`);
}


const lobbyId = ref<HTMLInputElement | null>(null)
const connectToLobby = async () => {
  if (lobbyId.value === null) return
  if (peerService === undefined) return

  await initPeer()

  const peerId = parseLobbyId(lobbyId.value.value)

  const connected = peerService.connectToPeer(peerId)

  if (connected) {
    router.push(`/lobby/${peerId}`);
  }
}
</script>

<template>
  <main class="h-full w-full bg-blue-950 flex flex-wrap gap-8 justify-center items-center">
  <!-- TODO: below would be a simple form to be able to join a game based on an ID -->
  <div class="bg-white shadow-md rounded-lg p-8 text-blue-950 max-w-md">
    <h3 class="text-lg font-mono mb-3">Welcome</h3>
    <p class="text-sm font-mono">You can either create a new game or join an existing game by pasting a URL or only the
      token into the below input field</p>
    <hr class="my-4 border-blue-950">

      <button class="bg-blue-950 text-white rounded-lg p-2 w-full" @click="createGame">Create Game</button>

      <div class="flex flex-wrap items-center justify-center my-4">
        <p class="text-lg font-mono">OR</p>
      </div>

      <input type="text" ref="lobbyId" id="game-token" placeholder="Game Token or URL"
        class="w-full border border-blue-950 rounded-lg p-2" @keydown.enter="connectToLobby">
    </div>
    <!-- <div class="bg-white shadow-md rounded-lg p-8 text-blue-950 max-w-md font-mono">
                                Your peer ID: {{ peerService.peerId ?? '' }}
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
                                            </div> -->
  </main>
</template>
