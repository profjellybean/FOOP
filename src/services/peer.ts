import { Peer, type DataConnection } from 'peerjs'
import { ref, watch, type Ref } from 'vue'
import { DataHandler } from './data_handlers'

export class PeerService {
  peer: Peer | null = null

  peerId: Ref<string | null> = ref(null)

  handler: DataHandler

  _store: any // should be a typed version of the peerStore

  peerConnections: Ref<DataConnection[]> = ref([]) // is a list of DataConnection objects, but atm i was not able to import the type

  constructor() {
    this.handler = new DataHandler(this)

    watch(
      this.peerConnections,
      (connections) => {
        console.log('connections changed', connections)
      },
      { deep: true }
    )
  }

  initSelf() {
    this.peer = new Peer()
    this.peer.on('open', (id) => {
      this.peerId.value = id
      console.log('My peer ID is: ' + id)

      this.peer?.on('connection', (conn) => {
        console.log('hello connection?')
        console.log(this.peerConnections.value)
        this.initPeer(conn)
      })
    })
  }

  initPeer(conn: DataConnection) {
    if (!this.peer) {
      console.error('Peer not initialized')
      return
    }

    conn?.on('open', () => {
      conn.on('data', (data: any) => {
        this.handler.handleData(data)
      })

      conn.on('close', () => {
        console.log('connection closed', conn.peer)
        this.peerConnections.value = this.peerConnections.value.filter((c) => c.peer !== conn.peer)
      })

      // tell the peer about other peers in our session
      // to allow them to connect to the unknown peers
      if (this.peerConnections.value.length > 0) {
        console.info('sending room information to peer', conn.peer)
        conn.send({
          type: 'room_information',
          data: {
            peers: this.peerConnections.value.map((conn) => conn.peer)
            // add some more relevant info like has the game started etc.
          }
        })
      }

      // when setup correctly push the own connection to the current peer session
      this.peerConnections.value.push(conn)
      console.log(this.peerConnections.value)
    })
  }

  connectToPeer(peerId: string) {
    if (!this.peer) {
      console.error('Peer not initialized')
      return
    }

    const conn = this.peer.connect(peerId)

    console.log('connection established?', conn.connectionId)

    this.initPeer(conn)
  }

  closeAllConnections() {
    this.peerConnections.value.forEach((conn) => {
      conn.close()
    })
  }

  destroy() {
    this.closeAllConnections()
    this.peer!.destroy()
  }

  // example function to send data to all peers
  sendMessage(data: any) {
    if (!this.peer) {
      console.error('Peer not initialized')
      return
    }

    this.peerConnections.value.forEach((conn) => {
      conn.send({
        type: 'message',
        value: data
      })
    })
  }
}
