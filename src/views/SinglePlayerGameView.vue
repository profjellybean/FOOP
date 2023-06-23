<script setup lang="ts">
import { GameService } from '@/services/game/game';
import { computed, watch } from 'vue';

const gameService = new GameService();
const playerId = "singleplayer"

setTimeout(() => {
  gameService!.startGame([playerId]);
}, 1000);

const player = computed(() => gameService.currentState.value.players && gameService.currentState.value.players[playerId]);
const mice = computed(() => gameService.currentState.value.opponents);

</script>

<template>
  <div class="h-full w-full bg-sky-700">

    <GameMap :map="gameService.map.map"></GameMap>
    <GamePlayer v-if="player !== undefined" :player="player" :game-service="gameService" controllable>
    </GamePlayer>
    <ul>
      <GameOpponent v-for="mouse in mice" v-bind:key="mouse.id" :mouse="mouse">
      </GameOpponent>
    </ul>
  </div>
</template>

<style></style>
