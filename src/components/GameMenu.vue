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
  <div class="absolute top-2 left-2 bg-gray-100 rounded-md shadow-md p-2 opacity-60">
    <div class="flex flex-col">
      <div class="flex flex-col justify-between">
        <div class="text-gray-700 font-bold text-sm">Kills: {{ props.service.killCount }}</div>
        <div class="text-gray-700 font-bold text-sm">Wins: {{ props.service.winCount }}</div>
      </div>
      <div class="flex justify-between text-sm" v-if="props.service.gameFinished.value === false">
        <button @click="toggleGame" class="my-1 py-1 px-2 bg-slate-400 text-slate-800 rounded-md">Toggle Game</button>
      </div>
      <div v-else class="text-green-500">
        <button @click="$emit('restart')" class="my-1 py-1 px-2 bg-slate-400 text-slate-800 rounded-md">Restart
          Game</button>
      </div>
    </div>
  </div>
</template>

<style></style>
