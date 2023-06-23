<script setup lang="ts">
import type { Entity } from '@/services/game/ecs';
import type { PositionComponent } from '@/services/game/ecs/components';
import { computed } from 'vue';

const props = defineProps<{
  mouse: Entity,
}>();

let pos = computed(() => props.mouse && props.mouse.getComponent<PositionComponent>('pos'));

const position = computed(() => {
  let rect = document.getElementById(pos.value?.x!.toString() + ' ' + pos.value?.y!.toString())?.getBoundingClientRect();
  return rect ?? {
    x: 30,
    y: 30,
  };
});

</script>

<template>
  <div class="absolute h-2 w-2 bg-green-600" :style="{
    top: `${position.y}px`,
    left: `${position.x}px`
  }"> </div>
</template>

<style></style>
