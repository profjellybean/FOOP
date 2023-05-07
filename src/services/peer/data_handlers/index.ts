import type { PeerService } from '..'
import type { PeerContext } from './types'

export class DataHandler {
  logTag = "[DataHandler]"

  peerService: PeerService
  _handlers: { [key: string]: (context: PeerContext, data: any) => void } = {}

  constructor(peerService: PeerService) {
    this.peerService = peerService
  }

  handleData(data: any) {
    if (typeof data === 'object') {
      this._handleDataObject(data)
      return
    }
    console.warn(this.logTag + ' Unknown data type', typeof data)
  }

  _handleDataObject(data: any) {
    const handler = this._handlers[data.type]

    if (handler === undefined || handler === null) {
      console.error(this.logTag + ' Unknown type for data object', data.type)
    }

    handler({ peerService: this.peerService }, data);
  }

  registerHandler(type: string, handler: (context: PeerContext, data: any) => void) {
    this._handlers[type] = handler
  }
}
