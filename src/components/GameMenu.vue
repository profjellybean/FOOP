<script setup lang="ts">
import type { GameService } from '@/services/game/game';
import { GameStatus } from '@/services/game/types';
import { toRef } from 'vue';

const props = defineProps<{
  service: GameService;
}>();


const gameStatus = toRef(props.service.context, 'status');

const toggleGame = () => {
  if (gameStatus.value === GameStatus.started) {
    props.service.pauseGame();
  } else if (gameStatus.value === GameStatus.paused) {
    props.service.resumeGame();
  }
}

</script>

<template>
  <div class="absolute top-2 left-2 bg-gray-100 rounded-md shadow-md p-4">
    <div class="flex flex-col">
      <div class="flex justify-between">
        {{ props.service.context.status == GameStatus.started ? "Paused" : "Started" }}
        <button @click="toggleGame" class="my-2 py-1 px-2 bg-slate-400 text-slate-800">Toggle Game</button>
      </div>
      <div class="flex flex-col justify-between">
        <div class="text-gray-700 font-bold text-xl">Kills: {{ props.service.killCount }}</div>
        <div class="text-gray-700 font-bold text-xl">Wins: {{ props.service.winCount }}</div>
      </div>
    </div>
  </div>
</template>

<style></style>
