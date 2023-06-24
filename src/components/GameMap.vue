<script setup lang="ts">
import type { MapComponent } from '@/services/game/ecs/components';

const props = defineProps<{
    mapComp: MapComponent;
}>();

</script>
<template>
    <div class="h-full w-full grid-flow-row auto-cols-fr">
        <div v-for="(row, index) in  props.mapComp.map" :key="index"
            class="w-full flex justify-center items-stretch bg-white">
            <div class="grid-item p-0" v-for="(cell, index1) in  row " :key="index1" :id="index + ' ' + index1" :class="{
                'bg-gray-400 rounded-full': cell.type === 'entry',
                'bg-yellow-400 shadow-md shadow-yellow-700': cell.type === 'meeting',
            }">
            </div>
        </div>
    </div>
</template>

<style>
.grid-item {
    @apply h-[1dvh] w-[1dvh];
}
</style>
  