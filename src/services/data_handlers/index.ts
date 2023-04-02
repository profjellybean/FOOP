import { useMessageStore } from '@/stores/messages'
import { useRectStore, type Rect } from '@/stores/rect'
import type { PeerService } from '../peer'

export class DataHandler {
  peerService: PeerService
  messageStore: any
  rectStore: any

  constructor(peerService: PeerService) {
    this.peerService = peerService
    this.messageStore = useMessageStore()
    this.rectStore = useRectStore()
  }

  handleData(data: any) {
    if (typeof data === 'object') {
      this._handleDataObject(data)
      return
    }
    console.warn('Unknown data type', typeof data)
  }

  _handleDataObject(data: any) {
    switch (data.type) {
      case 'room_information':
        this._handleRoomInformation(data.data);
        break;
      case 'message':
        this._handleMessage(data);
        break;
      case 'rect_add':
        this._handleRectAdd(data);
        break;
      case 'rect_update':
        this._handleRectUpdate(data);
        break;
      default:
        console.error('Unknown type for data object', data.type)
    }
  }

  _handleRoomInformation(data: RoomInformation) {
    console.log('handling room information', data)
    for (const peer of data.peers) {
      if (
        peer === this.peerService.peer?.id ||
        this.peerService.peerConnections.value.some((conn) => conn.peer === peer)
      ) {
        continue
      }

      this.peerService.connectToPeer(peer)
    }
  }

  _handleMessage(data: Message) {
    console.log('handling message', data)
    this.messageStore.addMessage(data.value)
  }

  _handleRectAdd(data: RectAdd) {
    this.rectStore.addRect(data.value)
  }

  _handleRectUpdate(data: RectUpdate) {
    this.rectStore.updateRect(data.value)
  }
}

export type RoomInformation = {
  type: 'room_information'
  peers: string[]
}

export type Message = {
  type: 'message'
  value: string
}

export type RectAdd = {
  type: 'rect_add',
  value: Rect,
}

export type RectUpdate = {
  type: 'rect_update',
  value: Rect,
}
