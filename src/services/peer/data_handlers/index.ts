import type { DataConnection } from 'peerjs'
import type { PeerService } from '..'
import type { PeerContext } from './types'

export class DataHandler {
  logTag = "[DataHandler]"

  peerService: PeerService
  _handlers: { [key: string]: (context: PeerContext, data: any) => void } = {}

  constructor(peerService: PeerService) {
    this.peerService = peerService
  }

  handleData(conn: DataConnection, data: any) {
    if (typeof data === 'object') {
      this._handleDataObject(conn, data)
      return
    }
    console.warn(this.logTag + ' Unknown data type', typeof data)
  }

  _handleDataObject(conn: DataConnection, data: any) {
    const handler = this._handlers[data.type]

    if (handler === undefined || handler === null) {
      console.error(this.logTag + ' Unknown type for data object', data.type)
    }

    handler({ peerService: this.peerService, senderId: conn.peer }, data);
  }

  registerHandler(type: string, handler: (context: PeerContext, data: any) => void) {
    this._handlers[type] = handler
  }

  removeHandler(type: string) {
    delete this._handlers[type]
  }
}
