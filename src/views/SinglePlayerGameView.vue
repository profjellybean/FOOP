<script setup lang="ts">
import { GameService } from '@/services/game/game';
import { computed, toRefs } from 'vue';

const gameService = new GameService();
const playerId = "singleplayer"
const killCount = toRefs(gameService.killCount);
const winCount = toRefs(gameService.winCount);

setTimeout(() => {
  gameService!.startGame([playerId]);
}, 1000);

const player = computed(() => gameService.currentState.value.players && gameService.currentState.value.players[playerId]);
const mice = computed(() => gameService.currentState.value.opponents);

</script>

<template>
  <div class="h-full w-full bg-sky-700 flex justify-center items-center">
    <GameMap :map-comp="gameService.map"></GameMap>
    <GamePlayer v-if="player !== undefined" :player="player" :game-service="gameService" controllable></GamePlayer>
    <ul>
      <GameOpponent v-for="mouse in mice" v-bind:key="mouse.id" :mouse="mouse" :map-comp="gameService.map">
      </GameOpponent>
    </ul>
  </div>
</template>

<style></style>
