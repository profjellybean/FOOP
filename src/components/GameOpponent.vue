<script setup lang="ts">
import type { Entity } from '@/services/game/ecs';
import type { PositionComponent } from '@/services/game/ecs/components';
import { computed } from 'vue';

const props = defineProps<{
  mouse: Entity;
}>();

const position = computed(() => {
  return props.mouse.getComponent<PositionComponent>('pos');
});

</script>

<template>
  <div class="absolute h-2 w-2 bg-blue-400" :style="{
    top: `${position.x}px`,
    left: `${position.y}px`
  }">
  </div>
</template>

<style></style>
