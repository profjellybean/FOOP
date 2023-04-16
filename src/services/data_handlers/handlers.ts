import type { PeerContext } from "."

export const handleRoomInformation = (context: PeerContext, data: RoomInformationMessage) => {
  console.log('handling room information', data)
  for (const peer of data.peers) {
    if (
      peer === context.peerService.peer?.id ||
      context.peerService.peerConnections.value.some((conn) => conn.peer === peer)
    ) {
      continue
    }

    context.peerService.connectToPeer(peer)
  }
}

export const handleStartGame = (context: PeerContext, data: StartGameMessage) => {
  console.log('handling startGame', data)
}

export type RoomInformationMessage = {
  type: 'room_information'
  peers: string[]
}

export type StartGameMessage = {
  type: 'start_game'
  value: string
}