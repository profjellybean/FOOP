<script setup lang="ts">
import { GameService } from '@/services/game/game';
import { computed, onBeforeUnmount } from 'vue';
import { toRefs, shallowRef, type Ref, type ShallowRef, triggerRef } from "vue";

const gameService = new GameService();
const playerId = "singleplayer"
const killCount = toRefs(gameService.killCount);
const winCount = toRefs(gameService.winCount);

setTimeout(() => {
  gameService.startGame([playerId]);
}, 1000);

const state = computed(() => {
  return gameService.currentState.value;
});

const map = computed(() => {
  return gameService.map;
});

const player = computed(() => state.value.players && state.value.players[playerId]);
const mice = computed(() => state.value.opponents);

</script>

<template>
  <div class="h-full w-full bg-sky-700 flex justify-center items-center">
    <h2>Mäuse gefangen: {{ killCount.kills }}</h2><br />
    <h2>Mäuse im Ziel: {{ winCount.wins }}</h2>
    <GameMap :map-comp="map"></GameMap>
    <GamePlayer v-if="player !== undefined" :player="player" :game-service="gameService" controllable></GamePlayer>
    <ul>
      <GameOpponent v-for="mouse in mice" v-bind:key="mouse.id" :mouse="mouse" :mapComp="map"></GameOpponent>
    </ul>
  </div>
</template>

<style></style>
