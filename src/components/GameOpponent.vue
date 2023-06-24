<script setup lang="ts">
import type { Entity } from '@/services/game/ecs';
import type { AliveComponent, MapComponent, PositionComponent } from '@/services/game/ecs/components';
import { computed } from 'vue';
import type { ShallowRef } from 'vue';
import type { MapComponent } from '@/services/game/ecs/components';

const props = defineProps<{
  mouse: Entity,
  mapComp: MapComponent
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

const hidden = computed(() => {
  if (props.mapComp.map![pos.value?.x!][pos.value?.y!].type != 'surface') {
    return true;
  } else {
    return false;
  }
});

</script>

<template>
  <div class="absolute h-2 w-2" :style="{
    top: `${position?.y}px`,
    left: `${position?.x}px`,
    display: alive.isAlive && !hidden ? 'block' : 'none'
  }">
    <v-icon name="gi-seated-mouse"></v-icon>
  </div>
</template>

<style></style>
