<script setup lang="ts">
import type { MapComponent } from '@/services/game/ecs/components';

const props = defineProps<{
    map: MapComponent;
}>();
//console.log(props.map);


</script>
<template>
    <div>
        <table style="border: 2px solid black;">
            <thead></thead>
            <tbody>
                <tr v-for="(row, index) in props.map" :key="index">
                    <td class="p-0" v-for="(row1, index1) in row" :key="index1">
                        <div class="grid bg-black" v-if="row[index1].type == 'underground'" />
                        <div class="grid bg-white" v-if="row[index1].type == 'surface'" />
                        <div class="grid bg-red-500" v-if="row[index1].type == 'entry'" />
                        <div class="grid bg-yellow-500" v-if="row[index1].type == 'meeting'" />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style>
.grid {
    @apply h-2 w-2;
}
</style>
  