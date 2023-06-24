import type { PeerContext, RoomInformationMessage } from "@/services/peer/data_handlers/types";

export const handleRoomInformation = (context: PeerContext, data: RoomInformationMessage) => {
  console.log('handling room information', data.peers, 'lala')
  for (const peer of data.peers) {
    if (
      peer === context.peerService._store.peerId ||
      context.peerService.peerConnections.some((conn) => conn.peer === peer)
    ) {
      continue
    }

    context.peerService.connectToPeer(peer)
  }
}