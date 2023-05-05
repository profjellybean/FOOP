<script setup lang="ts">
import router from '@/router';
import { GameService } from '@/services/game/game';
import { PeerService } from '@/services/peer';
import { computed, inject, onBeforeMount, provide, ref } from 'vue';
import { onBeforeRouteUpdate } from 'vue-router';

let peerService = inject('peerService') as PeerService;
const gameService = new GameService();

const lobbyId = computed(() => router.currentRoute.value.params.lobbyId);

const pageState = ref(0); // 0 initial, 1 creating peer, 2 connecting to lobby, 3 done

const yourGame = computed(() => {
  return lobbyId.value === peerService.peerId.value;
});

const connectToLobby = async (lobbyId?: string) => {
  pageState.value = 2;
  console.log(`[LobbyView] Connecting to lobby ${lobbyId}`);
  try {
    await peerService.connectToPeer(lobbyId as string);
  } catch (e) {
    console.error(`[LobbyView] Could not connect to lobby ${lobbyId}`);
    console.error(e);
    return;
  }
  pageState.value = 3;
};



const initialisePeer = async (lobbyId?: string) => {
  try {
    pageState.value = 1;
    console.log("[LobbyView] Initializing self with the lobby Id ", lobbyId);
    await peerService.initSelf(lobbyId);
    pageState.value = 3;
  } catch (e) {
    console.warn(`[LobbyView] Initialization with lobbyId (${lobbyId}) failed; Initialising with random ID and connect to lobby`);
    await peerService.initSelf();
  }
}


onBeforeRouteUpdate(async (to, from, next) => {
  // todo: do we need to need to initialise peer again here?
  next();
});

onBeforeMount(async () => {
  if (peerService === undefined) {
    // if there is no peer service we - for now - just instantiate one 
    // to prevent users from not being able to communicate with peers from here on
    peerService = new PeerService();
    provide('peerService', peerService);
  }

  if (peerService.peerId.value === null) {
    // if the local peer has not been initialised
    // we initialise it with the lobbyId
    await initialisePeer(lobbyId.value as string);
  }


  if (peerService.peerConnections.value.filter((e) => e.provider.id === lobbyId.value).length == 0 && lobbyId.value !== peerService.peerId.value) {
    await connectToLobby(lobbyId.value as string);
  }
});



const startGame = () => {
  provide('gameService', gameService);
  // gameService.startGame();

  router.push(`/game/${lobbyId.value}`);
}

</script>

<template>
  <div class="h-full w-full bg-blue-700 flex flex-col flex-wrap gap-8 justify-center items-center">
    <div>
      <div class="flex justify-start items-center mb-4">
        <button
          class="rounded-full px-3 py-1 bg-slate-400/20 border border-slate-400 mix-blend-lighten text-slate-200 text-sm hover:bg-slate-400/90 hover:text-white focus:bg-slate-400/90 focus:text-white"
          @click="router.back">
          <span class="text-xs">&lt;</span> Back
        </button>
      </div>
      {{ pageState }}
      <div class="bg-white shadow-md rounded-lg p-8 text-blue-950 max-w-md">
        <h3 class="text-lg font-mono mb-3">{{ yourGame ? 'Your' : 'The' }} game
          lobby</h3>
        <hr class="mt-4 mb-4 border-gray-100">
        <div v-if="pageState === 1">
          Initialising peer...
        </div>
        <div v-if="pageState === 2">
          Connecting to lobby...
        </div>
        <div v-if="pageState === 3">
          <p class=" text-xs text-gray-500">Connected members</p>
          <ul v-if="peerService.peerConnections.value.length > 0">
            <li v-for="(conn, idx) in peerService.peerConnections.value" :key="idx">
              {{ conn.peer }}
            </li>
          </ul>
          <p class="text-fuchsia-400 text-sm" v-else>No peers connected</p>
          <button v-if="yourGame"
            class="w-full mt-6 bg-blue-700/40 hover:bg-blue-700/60 border border-blue-700 rounded-lg p-2"
            @click="startGame">Start Game</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style></style>
