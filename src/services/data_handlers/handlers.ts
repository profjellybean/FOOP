import type { PeerContext } from "."
import type { GameState } from "../game/game"

export const handleRoomInformation = (context: PeerContext, data: RoomInformationMessage) => {
  console.log('handling room information', data.peers, 'lala')
  for (const peer of data.peers) {
    if (
      peer === context.peerService._store.peerId ||
      context.peerService.peerConnections.value.some((conn) => conn.peer === peer)
    ) {
      continue
    }

    context.peerService.connectToPeer(peer)
  }
}

export const handleStartGame = (context: PeerContext, data: StartGameMessage) => {

}

export const handleInitialSync = (context: PeerContext, data: InitialSyncMessage) => {
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