<script setup lang="ts">
import type { GameService } from '@/services/game/game';
import { inject } from 'vue';

const gameService = inject('gameService') as GameService;

if (gameService === undefined) {
  alert("GAME SERVICE IS NOT DEFINED")
}
</script>

<template>
  <div></div>
</template>

<style></style>
