import { Peer, type DataConnection } from 'peerjs'
import { ref, type Ref } from 'vue'
import { DataHandler } from './data_handlers'

export class PeerService {
  logTag: String = "[PeerService]"

  peer: Peer | null = null

  peerId: Ref<string | null> = ref(null)

  handler: DataHandler | undefined

  _store: any // should be a typed version of the peerStore

  _initialized: boolean = false

  peerConnections: Ref<DataConnection[]> = ref([]) // is a list of DataConnection objects, but atm i was not able to import the type

  constructor() {
    // watch(
    //   this.peerConnections,
    //   (connections) => {
    //     console.log(this.logTag + ' Connections changed', connections)
    //   },
    //   { deep: true }
    // )
  }

  async initSelf() {
    this.handler ??= new DataHandler(this)

    this.peer ??= new Peer()

    if (this._initialized) {
      return true
    }

    return new Promise((resolve, reject) => {
      if (!this.peer) {
        console.log(this.logTag + ' Peer not initialized on initSelf')
        reject(false)
        return
      }
      this.peer.on('open', (id) => {
        this.peerId.value = id
        // console.log(logTag + ' Peer ID is: ' + id)

        this.peer?.on('connection', (conn) => {
          // console.log(this.logTag + ' New connection event from remote peer', conn.peer)
          this.initPeer(conn)
        })

        this._initialized = true
        resolve(true)
      })
    });
  }

  initPeer(conn: DataConnection) {
    if (!this.peer) {
      console.error(this.logTag + ' Peer not initialized')
      return
    }

    conn?.on('open', () => {
      conn.on('data', (data: any) => {
        this.handler!.handleData(data)
      })

      conn.on('close', () => {
        console.log(this.logTag + ' Connection from peer closed, peer id: ', conn.peer)
        this.peerConnections.value = this.peerConnections.value.filter((c) => c.peer !== conn.peer)
      })

      // tell the peer about other peers in our session
      // to allow them to connect to the unknown peers
      if (this.peerConnections.value.length > 0) {
        console.info(this.logTag + ' Sending room information to peer', conn.peer)
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

  connectToPeer(peerId: string): boolean {
    if (!this.peer) {
      console.error(this.logTag + ' Peer not initialized')
      return false
    }

    const conn = this.peer.connect(peerId)
    this.initPeer(conn)
    return true
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
}
