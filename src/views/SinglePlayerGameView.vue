<script setup lang="ts">
import { GameService } from '@/services/game/game';
import { computed } from 'vue';

const gameService = new GameService();

const playerId = "singleplayer"

setTimeout(() => {
  gameService.startGame([playerId]);
}, 1000);


const state = computed(() => {
  return gameService.currentState.value;
});



const player = computed(() => state.value.entities && state.value.entities[playerId]);


</script>

<template>
  <div class="h-full w-full bg-sky-700 flex justify-center items-center">
    <div class="h-3/4 w-3/4 sm:h-2/3 sm:w-2/3 md:h-1/2 md:w-1/2 bg-green-600 rounded-xl shadow-lg p-4 relative">
      {{ state }}
      <GamePlayer v-if="player !== undefined" :player="player" :game-service="gameService" controllable></GamePlayer>
    </div>
  </div>
</template>

<style></style>
