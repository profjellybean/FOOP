import { GameStatus } from "@/services/game/types";
import { defineStore } from "pinia";
import { ref, type Ref } from "vue";

export const useGameStore = defineStore('game', () => {
  const gameId: Ref<string | null> = ref(null);
  const gameStatus = ref(GameStatus.initial);

  function setGameId(id: string) {
    gameId.value = id;
  }

  return {
    gameId,
    gameStatus,
    setGameId
  }
});