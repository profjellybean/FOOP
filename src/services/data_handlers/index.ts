import { useMessageStore } from "@/stores/messages";
import type { PeerService } from "../peer";

export class DataHandler {
  peerService: PeerService;
  messageStore: any;

  constructor(peerService: PeerService) {
    this.peerService = peerService;
    this.messageStore = useMessageStore();
  }

  handleData(data: any) {
    console.log("handling data", data)
    if (typeof data === "object") {
      this._handleDataObject(data);
      return
    }
    console.warn("Unknown data type", typeof data)
  }

  _handleDataObject(data: any) {
    switch (data.type) {
      case "room_information":
        this._handleRoomInformation(data.data);
        break;
      case "message":
          this._handleMessage(data);
          break;
      default:
        console.error("Unknown type for data object", data.type);
    }
  }

  _handleRoomInformation(data: RoomInformation) {
    console.log("handling room information", data)
    for (const peer of data.peers) {
      if (peer === this.peerService.peer?.id || this.peerService.peerConnections.value.some(conn => conn.peer === peer)) {
        continue;
      }

      this.peerService.connectToPeer(peer);
    }
  }

  _handleMessage(data: Message) {
    console.log("handling message", data)
    this.messageStore.addMessage(data.value);
  }
}


type RoomInformation = {
  type: "room_information",
  peers: string[]
}

type Message = {
  type: "message",
  value: string
}