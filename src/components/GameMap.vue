<script setup lang="ts">
import type { MapComponent } from '@/services/game/ecs/components';
import type { ShallowRef } from 'vue';

const props = defineProps<{
    mapComp: ShallowRef<MapComponent>;
}>();

</script>
<template>
    <div class="h-full w-full grid-flow-row auto-cols-fr">
        <div v-for="(row, index) in  props.mapComp" :key="index" class="w-full flex justify-center items-stretch">
            <div class="grid p-0" v-for="(row1, index1) in  row " :key="index1" :id="index + ' ' + index1" :class="{
                'bg-black': row[index1].type == 'underground',
                'bg-white': row[index1].type == 'surface',
                'bg-red-500': row[index1].type == 'entry',
                'bg-yellow-500': row[index1].type == 'meeting'
            }">
            </div>
        </div>
    </div>
</template>

<style>
.grid {
    @apply h-[1dvh] w-[1dvh];
}
</style>
  