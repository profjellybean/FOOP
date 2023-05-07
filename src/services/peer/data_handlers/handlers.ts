import type { InitialSyncMessage, PeerContext, RoomInformationMessage, StartGameMessage } from "@/services/peer/data_handlers/types";

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

  // inject the initial state into the game service

  // send an ack event to the lobby peer

  const host = context.peerService.peerConnections.value.filter((conn) => conn.peer === context.lobbyId)[0];

  if (host) {
    host.send({
      type: "sync_ack"
    });
  }
}

export const handleSyncAck = (context: PeerContext, data: { type: "sync_ack" }) => {
  // todo check if all peers in the game have sent an ack
  // if so, send the `start_game` event to the peers
  console.log("handleSyncAck");
}