import type { GameState } from "@/services/game/game";
import type { PeerService } from "@/services/peer";

export type PeerContext = {
  peerService: PeerService;
  senderId: string;
}

export type RoomInformationMessage = {
  type: 'room_information'
  peers: string[]
}

export type StartGameMessage = {
  type: 'start_game'
  value: string
}

export type InitialSyncMessage = {
  type: 'initial_game_sync',
  value: GameState
}