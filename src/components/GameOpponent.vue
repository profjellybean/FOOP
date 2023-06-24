<script setup lang="ts">
import type { Entity } from '@/services/game/ecs';
import type { PositionComponent } from '@/services/game/ecs/components';
import { computed } from 'vue';
import type { ShallowRef } from 'vue';
import type { MapComponent } from '@/services/game/ecs/components';

const props = defineProps<{
  mouse: Entity;
  mapComp: ShallowRef<MapComponent>;
  hidden: boolean;
}>();


const position = computed(() => {
  if (props.mouse.components.isAlive === false) {
    return null
  }
  let pos = props.mouse.getComponent<PositionComponent>('pos')

  return document.getElementById(pos.x!.toString() + ' ' + pos.y!.toString())?.getBoundingClientRect();
});

const hidden = computed(() => {
  let pos = props.mouse.getComponent<PositionComponent>('pos');
  console.log(props.mapComp.value.map![pos.x!][pos.y!].type)
  if (props.mapComp.value.map![pos.x!][pos.y!].type != 'surface') {
    return true;
  } else {
    return false;
  }
});


</script>

<template>
  <div v-if="position === null">
  </div>
  <div v-else class="absolute h-2 w-2" :hidden="hidden" :style="{
    top: `${position!.top}px`,
    left: `${position!.left}px`
  }">
    <v-icon name="gi-seated-mouse" animation="spin"></v-icon>
  </div>
</template>

<style></style>
