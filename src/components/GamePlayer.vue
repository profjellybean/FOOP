<script setup lang="ts">
import type { Entity } from '@/services/game/ecs';
import type { PositionComponent } from '@/services/game/ecs/components';
import type { GameService } from '@/services/game/game';
import { useIntervalFn, useMagicKeys } from '@vueuse/core';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  player: Entity;
  controllable: boolean;
  gameService: GameService;
}>();

const position = computed(() => {
  return props.player.getComponent<PositionComponent>('pos');
});

// init vue use magic key listeners when controllable is true
// emit an event to a game service event bus when a key is pressed
// the game service will then update the player position
const updateInterval = ref(30);

const mover = (dir: string) => {
  props.gameService.emit(props.player.id, 'move', dir);
}

const moveLeft = useIntervalFn(() => mover('left'), updateInterval, { immediate: false });
const moveDown = useIntervalFn(() => mover('down'), updateInterval, { immediate: false });
const moveRight = useIntervalFn(() => mover('right'), updateInterval, { immediate: false });
const moveUp = useIntervalFn(() => mover('up'), updateInterval, { immediate: false });

if (props.controllable) {
  const { arrowleft, arrowdown, arrowright, arrowup } = useMagicKeys();

  watch(arrowleft, (value) => {
    if (value) {
      moveLeft.resume();
    } else {
      moveLeft.pause();
    }
  });
  watch(arrowdown, (value) => {
    if (value) {
      moveDown.resume();
    } else {
      moveDown.pause();
    }
  });
  watch(arrowright, (value) => {
    if (value) {
      moveRight.resume();
    } else {
      moveRight.pause();
    }
  });
  watch(arrowup, (value) => {
    if (value) {
      moveUp.resume();
    } else {
      moveUp.pause();
    }
  });
  // whenever(arrowdown, () => mover('down'));
  // whenever(arrowright, () => mover('right'));
  // whenever(arrowup, () => mover('up'));

  // whenever(arrowleft, () => {
  //   props.gameService.emit(props.player.id, 'move', 'left');
  // });

  // whenever(arrowdown, () => {
  //   props.gameService.emit(props.player.id, 'move', 'down');
  // });

  // whenever(arrowright, () => {
  //   props.gameService.emit(props.player.id, 'move', 'right');
  // });

  // whenever(arrowup, () => {
  //   props.gameService.emit(props.player.id, 'move', 'up');
  // });
}

</script>

<template>
  <div class="absolute h-10 w-10 bg-pink-600" :style="{
    top: `${position.y}px`,
    left: `${position.x}px`
  }">
  </div>
</template>

<style></style>
