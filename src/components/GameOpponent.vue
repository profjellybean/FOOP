<script setup lang="ts">
import type { Entity } from '@/services/game/ecs';
import type { PositionComponent } from '@/services/game/ecs/components';
import { computed } from 'vue';

const props = defineProps<{
  mouse: Entity;
}>();

const position = computed(() => {
  if (props.mouse.components.isAlive === false) {
    return null
  }
  let pos = props.mouse.getComponent<PositionComponent>('pos')
  return document.getElementById(pos.x!.toString() + ' ' + pos.y!.toString())?.getBoundingClientRect();
});

</script>

<template>
  <div v-if="position === null">
  </div>
  <div v-else class="absolute h-2 w-2 bg-blue-400" :style="{
    top: `${position!.top}px`,
    left: `${position!.left}px`
  }">
  </div>
</template>

<style></style>
