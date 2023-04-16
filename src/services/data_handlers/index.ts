import type { PeerService } from '../peer'

export class DataHandler {
  peerService: PeerService
  _handlers: { [key: string]: (context: PeerContext, data: any) => void } = {}

  constructor(peerService: PeerService) {
    this.peerService = peerService
  }

  handleData(data: any) {
    console.log('handling data', data)
    if (typeof data === 'object') {
      this._handleDataObject(data)
      return
    }
    console.warn('Unknown data type', typeof data)
  }

  _handleDataObject(data: any) {
    const handler = this._handlers[data.type]

    if (handler === undefined || handler === null) {
      console.error('Unknown type for data object', data.type)
    }

    handler({ peerService: this.peerService }, data);
  }

  registerHandler(type: string, handler: (context: PeerContext, data: any) => void) {
    this._handlers[type] = handler
  }
}

export type PeerContext = {
  peerService: PeerService
}
