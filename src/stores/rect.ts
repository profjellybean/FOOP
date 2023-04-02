import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useRectStore = defineStore('rects', () => {
  const rects = ref<Rect[]>([])

  const lastRectId = computed(() => rects.value[rects.value.length - 1]?.id ?? 0)

  function updateRect(rect: Rect) {
    const index = rects.value.findIndex((r) => r.id === rect.id)
    if (index === -1) {
      return
    } else {
      rects.value[index] = rect
    }
  }

  function addRect(rect: Rect) {
    rects.value.push(rect)
  }

  return { rects, lastRectId, addRect, updateRect }
});

export type Rect = {
  id: number,
  x: number,
  y: number,
  animate: boolean
}