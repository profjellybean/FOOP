<script setup lang="ts">
import type { Entity } from '@/services/game/ecs';
import type { AliveComponent, PositionComponent } from '@/services/game/ecs/components';
import { computed } from 'vue';

const props = defineProps<{
  mouse: Entity,
}>();

const pos = computed(() => props.mouse && props.mouse.getComponent<PositionComponent>('pos'));
const alive = computed(() => props.mouse && props.mouse.getComponent<AliveComponent>('isAlive'));

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
    top: `${position?.y}px`,
    left: `${position?.x}px`,
    display: alive.isAlive ? 'block' : 'none'
  }"> </div>
</template>

<style></style>
