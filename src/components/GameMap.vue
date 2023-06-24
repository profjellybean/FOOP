<script setup lang="ts">
import type { ShallowRef } from 'vue';
import type { MapComponent } from '@/services/game/ecs/components';

const props = defineProps<{
    mapComp: ShallowRef<MapComponent>;
}>();

</script>
<template>
    <div>
        <table style="border: 2px solid black;">
            <thead></thead>
            <tbody>
                <tr v-for="(row, index) in props.mapComp.value.map" :key="index">
                    <td class="p-0" v-for="(cell, index1) in  row" :key="index1">
                        <div :id="index + ' ' + index1" class="grid" :class="'bg-white'
                            " />
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
  