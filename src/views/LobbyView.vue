<script setup lang="ts">
import router from '@/router';
import type { PeerService } from '@/services/peer';
import { computed, inject, onBeforeMount } from 'vue';

const peerService = inject('peerService') as PeerService;

const lobbyId = router.currentRoute.value.params.lobbyId;

const yourGame = computed(() => {
  return lobbyId === peerService.peerId.value;
});

onBeforeMount(async () => {
  if (peerService === undefined) return

  await peerService.initSelf();

  // console.log("peerId", router.currentRoute.value.params.lobbyId)

  if (peerService.peerConnections.value.filter((e) => e.provider.id === lobbyId).length == 0) {
    peerService.connectToPeer(lobbyId as string);
  }
});

const startGame = () => {
  console.log("startoo");
  // router.push(`/game/${lobbyId}`);
}

</script>

<template>
  <div class="h-full w-full bg-blue-700 flex flex-wrap gap-8 justify-center items-center">
    <div class="bg-white shadow-md rounded-lg p-8 text-blue-950 max-w-md">
      <h3 class="text-lg font-mono mb-3">{{ yourGame ? 'Your' : 'The' }} game
        lobby</h3>
      <hr class="mt-4 mb-2 border-gray-100">
      <p class="mb-2 text-xs text-gray-500">Connected members</p>
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
</template>

<style></style>
