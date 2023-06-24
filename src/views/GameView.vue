<script setup lang="ts">
import { useGameService } from '@/composables/game';
import { usePeerConnectionStore } from '@/stores/peerConnection';
import { computed } from 'vue';

let { gameService } = useGameService({
  networked: true,
  multiplayer: true
});

const connectionStore = usePeerConnectionStore();

const player = computed(() => (gameService.currentState.value.players && gameService.currentState.value.players[connectionStore.peerId!]) || null);
const otherPlayers = computed(() => gameService.currentState.value.players && Object.values(gameService.currentState.value.players).filter((p) => p.id !== connectionStore.peerId));
const mice = computed(() => gameService.currentState.value.opponents);
</script>

<template>
  <div class="h-full w-full bg-sky-700 flex justify-start items-center flex-wrap">
    <GameMap :map-comp="gameService!.map"></GameMap>
    <GamePlayer v-if="player !== null" :player="player" :game-service="gameService" controllable></GamePlayer>
    <GamePlayer v-for="player in otherPlayers" :key="player.id" :player="player" :game-service="gameService">
    </GamePlayer>
    <template v-for="(mouse, i) in mice" :key="i">
      <GameOpponent :mouse="mouse" :map-comp="gameService.map" />
    </template>
  </div>
</template>

<style></style>
