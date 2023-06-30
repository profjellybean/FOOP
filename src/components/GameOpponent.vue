<script setup lang="ts">
import type { Entity } from '@/services/game/ecs';
import type { AliveComponent, HiddenComponent, MapComponent, PositionComponent } from '@/services/game/ecs/components';
import { computed } from 'vue';

const props = defineProps<{
  mouse: Entity,
  mapComp: MapComponent
}>();

const pos = computed(() => props.mouse && props.mouse.getComponent<PositionComponent>('pos'));
const alive = computed(() => props.mouse && props.mouse.getComponent<AliveComponent>('isAlive')?.isAlive);

const position = computed(() => {
  let rect = document.getElementById(pos.value?.y!.toString() + ' ' + pos.value?.x!.toString())?.getBoundingClientRect();
  return rect ?? {
    x: 30,
    y: 30,
  };
});

const hidden = computed(() => props.mouse && props.mouse.getComponent<HiddenComponent>('hidden')?.hidden);

</script>

<template>
  <div class="absolute h-2 w-2" :style="{
    top: `${position?.y}px`,
    left: `${position?.x}px`,
    display: alive && !hidden ? 'block' : 'none'
  }">
    <v-icon name="gi-seated-mouse"></v-icon>
  </div>
</template>

<style></style>
