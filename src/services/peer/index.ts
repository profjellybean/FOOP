import { PeerConnectionState } from '@/stores/types';
import { useWebrtcConnectionStore } from '@/stores/webrtcConn';
import { Peer, type DataConnection } from 'peerjs';
import { ref, type Ref } from 'vue';
import { DataHandler } from '../data_handlers';

export class PeerService {
  logTag: String = "[PeerService]"

  peer: Ref<Peer | null> = ref(null)

  handler: DataHandler | undefined

  _store = useWebrtcConnectionStore();

  _initialized: boolean = false

  peerConnections: Ref<DataConnection[]> = ref([]) // is a list of DataConnection objects, but atm i was not able to import the type

  reconnecter?: number; // the interval id that tries to reconnect to the peer
  reconnectionCount: number = 0;

  constructor() {
  }

  _serverConfig = {
    // host: 'localhost',
    // port: 9090,
    pingInterval: 2000,
    debug: 3
  };

  async initSelf(peerId?: string): Promise<string | true> {
    if (this.peer.value !== null) {
      this.peer.value.removeAllListeners();
      this.peer.value.destroy();
      this.peer.value = null;
    }

    this.handler ??= new DataHandler(this)
    this._store.setConnectionState(PeerConnectionState.CONNECTING);

    if (peerId !== undefined) {
      this.peer.value = new Peer(peerId, this._serverConfig)
    } else {
      this.peer.value = new Peer(this._serverConfig)
    }

    return new Promise((resolve, reject) => {
      if (!this.peer.value) {
        console.log(this.logTag + ' Peer not initialized on initSelf')
        this._store.setConnectionState(PeerConnectionState.ERROR);
        reject('peer-not-initialized');
        return
      }
      this.peer.value.on('open', (id) => {
        this._store.setPeerId(id);
        this._store.setConnectionState(PeerConnectionState.CONNECTED);
        console.log(this.logTag + ' Peer ID is: ' + id)
        resolve(true)
      });

      // todo: the `err` variable below is actually of type `PeerError` but peer.js does not export the type
      this.peer.value.on('error', (err: any) => {
        console.log("got error in peer.value", err);
        this._store.setConnectionState(PeerConnectionState.ERROR);
        this._handlePeerError(err, reject)
      });

      this.peer.value.on('connection', (conn) => {
        console.log(this.logTag + ' New connection event from remote peer', conn.peer)
        this.initPeer(conn)
      })

      this.peer.value.on('disconnected', (peerId) => {
        console.log(this.logTag + ' Peer disconnected', peerId);
        this._store.setConnectionState(PeerConnectionState.DISCONNECTED);
        // todo: cleanup peer internally
      })

      this.peer.value.on('close', () => {
        // todo emit to the pinia, that the peer is destroyed and we need to instantiate a new one
        this.peer.value!.removeAllListeners();
        this.peer.value!.destroy();
        this.peer.value = null;
      });
    });
  }

  initPeer(conn: DataConnection) {
    if (!this.peer.value) {
      console.error(this.logTag + ' Peer not initialized')
      return
    }

    if (this.peerConnections.value.filter((c) => c.peer === conn.peer).length > 0) {
      // check if we already have an option connection to the given peer
      console.log(this.logTag + ' Connection already exists, peer id: ', conn.peer)
      return
    }

    conn.on('open', () => {
      console.log(`${this.logTag} New connection from peer ${conn.peer} established`);
      this._store.setPeerConnectionState(conn.peer, PeerConnectionState.CONNECTED);

      // tell the peer about other peers in our session
      // to allow them to connect to the unknown peers
      if (this.peerConnections.value.length > 0) {
        // Please note that this should only be executed when the peer has not been connected previously
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
    });

    conn.on('data', (data: any) => {
      console.log("data received", data);
      this.handler!.handleData(data)
    })

    conn.on('close', () => {
      console.log(this.logTag + ' Connection from peer closed, peer id: ', conn.peer)
      this.peerConnections.value = this.peerConnections.value.filter((c) => c.peer !== conn.peer)
      this._store.setPeerConnectionState(conn.peer, PeerConnectionState.DISCONNECTED);
    });

    conn.on('error', (err: any) => {
      console.error(this.logTag + ' Peer connection error ', err)
      console.error(this.logTag + ' error type ', err.type)
      this._store.setPeerConnectionState(conn.peer, PeerConnectionState.ERROR);
    });
  }

  async connectToPeer(peerId: string): Promise<boolean> {
    console.log(this.logTag + " Connecting to peer", peerId);
    if (!this.peer) {
      console.error(this.logTag + ' Peer not initialized')
      return false
    }

    this._store.setPeerConnectionState(peerId, PeerConnectionState.CONNECTING);

    let conn: DataConnection;
    try {
      conn = this.peer.value!.connect(peerId)
    } catch (e) {
      console.error(this.logTag + ' Connection to peer failed: ', peerId)
      console.error(e);
      return false
    }

    this.initPeer(conn);

    return new Promise((resolve, reject) => {
      conn.on('open', () => {
        console.log(this.logTag + ' Connection to peer established, peer id: ', peerId)
        this._store.setPeerConnectionState(peerId, PeerConnectionState.CONNECTED);
        resolve(true)
      });

      conn.on('error', (err: any) => {
        console.log(this.logTag + '#[connectToPeer]: Error during connection to: ', peerId)
        this._store.setPeerConnectionState(peerId, PeerConnectionState.ERROR);
        this._handlePeerError(err, reject);
      });
    });

  }

  closeAllConnections() {
    this.peerConnections.value.forEach((conn) => {
      conn.close()
    })
  }

  destroy() {
    this.closeAllConnections()
    this.peer.value!.destroy()
  }

  send(data: any) {
    // todo: this is somehow very simple .. maaaybe too simple? 😁
    for (const peer of this.peerConnections.value) {
      peer.send(data)
    }
  }

  _handlePeerError(err: any, callback: Function) { // err is actually a PeerError
    console.error(this.logTag + ' Peer error ', err.type);

    switch (err.type) {
      // case 'browser-incompatible':
      //   break;
      case 'peer-unavailable':
        // eslint-disable-next-line no-case-declarations
        const peerId = (err.message as String).split(' ').pop();
        if (!peerId) {
          console.error(this.logTag + ' Could not extract peer id from error message');
          return
        }
        this.reconnectionCount++;
        if (this.reconnectionCount < 4) {
          console.log(this.logTag + " adding reconnecter attempt in 1 sec");
          this.reconnecter = setTimeout(() => {
            console.log(this.logTag + " Trying to reconnect to " + peerId);
            clearTimeout(this.reconnecter);
            this.connectToPeer(peerId);
          }, 2000);
          break;
        }
        console.error(this.logTag + " Could not reconnect to " + peerId);
        console.error(this.logTag + " Stopping reconnection attempts");
        this._store.setPeerConnectionState(peerId, PeerConnectionState.NOT_FOUND);
        clearTimeout(this.reconnecter);
        break;
      // case 'disconnected':
      //   break;
      // case 'invalid-id':
      //   break;
      // case 'network':
      //   break;
      // case 'ssl-unavailable':
      //   break;
      // case 'server-error':
      //   break;

      //   break;
      // case 'unavailable-id':
      //   break;
      case 'disconnected':
      case 'socket-closed':
      case 'socket-error':
      default:
        console.error(this.logTag + " " + err.type);
        this.peer.value?.removeAllListeners();
        this.peer.value?.destroy();
        this.peer.value = null;
        this._store.setPeerId(null);
        this._store.setConnectionState(PeerConnectionState.ERROR);
        break;
    }
    callback(err.type)
  }
}