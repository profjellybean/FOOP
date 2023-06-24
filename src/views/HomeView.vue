<script setup lang="ts">
import { usePeerService } from '@/composables/peer';
import router from '@/router';
import { usePeerConnectionStore } from '@/stores/peerConnection';
import { useClipboard } from '@vueuse/core';
import { onMounted, ref } from 'vue';

const connectionStore = usePeerConnectionStore();
const { peerService } = usePeerService();

const initPeer = async (isHost = false) => {
  const res = await peerService.value.initSelf(undefined, isHost);

  if (!res) {
    console.error("could not init peer service correctly, cannot create game");
    return;
  }
}

onMounted(async () => {
  if (window.location.hash.startsWith('#/lobby/')) {
    console.log("weee haz a hash");
    const peerId = window.location.hash.replace('#/lobby/', '')
    if (peerId !== '') {
      await initPeer();

      const connected = await peerService.value.connectToPeer(peerId, true)

      if (connected) {
        router.push(`/lobby/${peerId}`);
      }
    }
  }
})

const { copy } = useClipboard()

const parseLobbyId = (lobbyId: string) => {
  if (lobbyId.startsWith('http')) {
    const url = new URL(lobbyId)
    const id = url.pathname.replace(/.*\/lobby\//, '')

    return id
  }

  return lobbyId
}

const createGame = async () => {
  if (peerService === undefined) return

  await initPeer(true)

  copy(window.location.protocol + '//' + window.location.host + window.location.pathname + "#/lobby/" + connectionStore.peerId);

  router.push(`/lobby/${connectionStore.peerId}`);
}

const startSingleGame = async () => {
  router.push(`/game/single`);
}


const lobbyId = ref<HTMLInputElement | null>(null)
const connectToLobby = async () => {
  if (lobbyId.value === null) return
  if (peerService === undefined) return

  await initPeer()

  const peerId = parseLobbyId(lobbyId.value.value)

  const connected = await peerService.value.connectToPeer(peerId, true)

  if (connected) {
    router.push(`/lobby/${peerId}`);
  }
}
</script>

<template>
  <main class="h-full w-full bg-blue-950 flex flex-wrap gap-8 justify-center items-center">
    <div class="ui-card">
      <h3 class="text-lg font-mono mb-3">Welcome</h3>
      <p class="text-sm font-mono">You can either create a new game or join an existing game by pasting a URL or only the
        token into the below input field</p>
      <hr class="my-4 border-blue-950" />

      <button class="bg-blue-950 text-white rounded-lg p-2 w-full" @click="createGame">Create Game</button>

      <div class="flex flex-wrap items-center justify-center my-4">
        <p class="text-lg font-mono">OR</p>
      </div>

      <input type="text" ref="lobbyId" id="game-token" placeholder="Game Token or URL"
        class="w-full border border-blue-950 rounded-lg p-2" @keydown.enter="connectToLobby">
    </div>

    <div class="ui-card mt-8">
      <h3 class="text-lg font-mono mb-3">Singleplayer</h3>
      <button class="bg-blue-950 text-white rounded-lg p-2 w-full" @click="startSingleGame">Start single player</button>
    </div>
  </main>
</template>

<style>
.ui-card {
  @apply bg-white shadow-md rounded-lg p-8 text-blue-950 w-full max-w-md;
}
</style>