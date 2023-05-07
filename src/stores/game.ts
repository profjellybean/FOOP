import { defineStore } from "pinia";
import { ref, type Ref } from "vue";

export enum GameStatus {
  INITIAL = 'initial',
  STARTED = 'started',
  FINISHED = 'finished'
}


export const useGameStore = defineStore('game', () => {
  const gameId: Ref<string | null> = ref(null);
  const gameStatus = ref(GameStatus.INITIAL);

  function setGameId(id: string) {
    gameId.value = id;
  }

  return {
    gameId,
    gameStatus,
    setGameId
  }
});