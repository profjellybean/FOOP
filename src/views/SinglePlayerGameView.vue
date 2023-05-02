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

const player = computed(() => state.value.players && state.value.players[playerId]);
const mice = computed(() => state.value.opponents);

</script>

<template>
  <div class="h-full w-full bg-sky-700 flex justify-center items-center">
    <GameMap :map="gameService.map.value.map"></GameMap>
    <GamePlayer v-if="player !== undefined" :player="player" :game-service="gameService" controllable></GamePlayer>
    <ul>
      <GameOpponent v-for="mouse in mice" v-bind:key="mouse.id" :mouse="mouse"></GameOpponent>
    </ul>
  </div>
</template>

<style></style>
