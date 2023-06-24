import { GameService } from "@/services/game/game";
import { shallowReactive, type ShallowReactive } from "vue";

let gameService: ShallowReactive<GameService> = shallowReactive({} as GameService);

export const useGameService = function (gameConfig: {
  networked: boolean,
  multiplayer: boolean
} = {
    networked: false,
    multiplayer: false
  }, init: boolean = false) {

  if (gameService.entitySystem === undefined || init) {
    gameService = new GameService(undefined, gameConfig);
    if (gameConfig?.multiplayer && gameConfig?.networked) {
      gameService.initMultiplayer();
    }
  }

  return {
    gameService,
  }
};