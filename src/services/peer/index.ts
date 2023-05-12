import { usePeerConnectionStore } from '@/stores/peerConnection';
import { PeerConnectionState } from '@/types';
import { Peer, type DataConnection } from 'peerjs';
import { ref, type Ref } from 'vue';
import { DataHandler } from './data_handlers';
import { handleRoomInformation } from './data_handlers/handlers';
import type { LobbySettings, PeerServiceHook, PeerServiceHooks } from './types';

export class PeerService {
  logTag: String = "[PeerService]"

  peer: Ref<Peer | null> = ref(null)

  dataHandler: DataHandler | undefined

  lobbySettings = ref({} as LobbySettings);

  _store = usePeerConnectionStore();

  _initialized: boolean = false

  peerConnections: Ref<DataConnection[]> = ref([]) // is a list of DataConnection objects, but atm i was not able to import the type

  reconnecter?: number; // the interval id that tries to reconnect to the peer
  reconnectionCount: number = 0;

  _hooks: PeerServiceHooks = {};

  constructor(hooks?: PeerServiceHooks) {
    this._hooks = {
      ...this._hooks,
      ...hooks,
    };
  }

  _serverConfig = {
    // host: 'localhost',
    // port: 9090,
    pingInterval: 2000,
    debug: 1
  };

  /**
   * Initialises the own peer and sets up the default handlers and behaviour.
   * @param peerId The optional peer id that we want to initialise our peer with. If not given, a random one will be generated
   * @returns A promise that resolves to a string containing the error that occurred or true if the peer was initialised successfully
   */
  async initSelf(peerId?: string, isHost = false): Promise<string | true> {
    if (this.peer.value !== null) {
      this.destroy();
    }

    this.dataHandler ??= new DataHandler(this)
    this._addDefaultHandlers(this.dataHandler);
    this._store.setConnectionState(PeerConnectionState.CONNECTING);

    if (peerId !== undefined) {
      this.peer.value = new Peer(peerId, this._serverConfig)
    } else {
      this.peer.value = new Peer(this._serverConfig)
    }

    return new Promise((resolve, reject) => {
      if (!this.peer.value) {
        console.debug(this.logTag + ' Peer not initialized on initSelf')
        this._store.setConnectionState(PeerConnectionState.ERROR);
        reject('peer-not-initialized');
        return
      }
      this.peer.value.on('open', (id) => {
        this._hooks?.onInit?.(id);
        this._store.setPeerId(id);
        this._store.setConnectionState(PeerConnectionState.CONNECTED);
        if (isHost) {
          this.lobbySettings.value.lobbyId = id;
        }
        console.log(this.logTag + ' Peer ID is: ' + id)
        resolve(true)
      });

      // todo: the `err` variable below is actually of type `PeerError` but peer.js does not export the type
      this.peer.value.on('error', (err: any) => {
        console.error(this.logTag + " Got error in peer.value", err);
        this._handlePeerError(err, reject)
      });

      this.peer.value.on('connection', (conn) => {
        console.debug(this.logTag + ' New connection event from remote peer', conn.peer)
        if (this._hooks?.onPeerConnection === undefined || this._hooks?.onPeerConnection!(conn)) {
          this._initPeer(conn)
        }
      })

      this.peer.value.on('disconnected', (peerId) => {
        console.debug(this.logTag + ' Peer disconnected', peerId);
        this._store.setConnectionState(PeerConnectionState.DISCONNECTED);
        // todo: should we try to reconnect with our id like 3 times or so?
      })

      this.peer.value.on('close', () => {
        // todo emit to the pinia, that the peer is destroyed and we need to instantiate a new one
        this.destroy();
      });
    });
  }

  /**
   * Connects to a peer by their ID.
   * @param peerId The peer to connect to
   * @returns True if the connection was established successfully, false otherwise
   */
  async connectToPeer(peerId: string, isLobby = false): Promise<boolean> {
    console.debug(this.logTag + " Connecting to peer", peerId);
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

    if (this.peerConnections.value.filter((c) => c.peer === conn.peer).length > 0) {
      // check if we already have an option connection to the given peer
      console.debug(this.logTag + ' Connection already exists, peer id: ', conn.peer);
      this._store.setPeerConnectionState(peerId, PeerConnectionState.CONNECTED);
      return true;
    }

    this._initPeer(conn);

    return new Promise((resolve, reject) => {
      conn.on('open', () => {
        console.debug(this.logTag + ' Connection to peer established, peer id: ', peerId)
        this._store.setPeerConnectionState(peerId, PeerConnectionState.CONNECTED);
        this.reconnectionCount = 0; // reset reconnection could, no matter if needed previously or not
        if (isLobby) {
          console.debug(this.logTag + " is lobby, setting lobby id to peer id")
          this.lobbySettings.value.lobbyId = peerId;
        }
        resolve(true)
      });

      conn.on('error', (err: any) => {
        console.debug(this.logTag + '#[connectToPeer]: Error during connection to: ', peerId)
        this._store.setPeerConnectionState(peerId, PeerConnectionState.ERROR);
        this._handlePeerError(err, reject);
      });
    });

  }

  setHook<T extends PeerServiceHook>(name: T, hook: PeerServiceHooks[T]) {
    this._hooks![name] = hook;
  }

  closeAllConnections() {
    this.peerConnections.value.forEach((conn) => {
      conn.close()
    })
  }

  /**
   * This not only closes the connections but completely destroys th^e local peer.
   * We need to init again after calling this method.
   */
  destroy() {
    this.closeAllConnections();
    this.peerConnections.value = [];
    this.peer.value!.removeAllListeners();
    this.peer.value!.destroy();
    this.peer.value = null;
  }

  send(data: any) {
    // todo: this is somehow very simple .. maaaybe too simple? 😁
    for (const peer of this.peerConnections.value) {
      console.debug(this.logTag + " Sending: ", data, " to peer: ", peer.peer)
      peer.send(data)
    }
  }

  /**
   * Takes a given connection and adds the default handlers and behaviour to it.
   * Is most likely only to be called internally, use `connectToPeer` for actually connecting to a peer.
   * @param conn The connection used for adding handlers and default behaviour
   * @returns void
   */
  _initPeer(conn: DataConnection) {
    if (!this.peer.value) {
      console.error(this.logTag + ' Peer not initialized')
      return
    }

    conn.on('open', () => {
      console.debug(`${this.logTag} New connection from peer ${conn.peer} established`);
      this._store.setPeerConnectionState(conn.peer, PeerConnectionState.CONNECTED);

      // tell the peer about other peers in our session
      // to allow them to connect to the unknown peers
      if (this.peerConnections.value.length > 0) {
        // Please note that this should only be executed when the peer has not been connected previously
        console.info(this.logTag + ' Sending room information to peer', conn.peer)
        conn.send({
          type: 'room_information',
          peers: this.peerConnections.value.map((conn) => conn.peer)
        })
      }

      // when setup correctly push the own connection to the current peer session
      this.peerConnections.value.push(conn)
    });

    conn.on('data', (data: any) => {
      console.debug("data received", data);
      this.dataHandler!.handleData(conn, data)
    })

    conn.on('close', () => {
      console.debug(this.logTag + ' Connection from peer closed, peer id: ', conn.peer)
      conn.close();
      this.peerConnections.value = this.peerConnections.value.filter((c) => c.peer !== conn.peer);
      this._hooks?.onPeerDisconnected?.(conn.peer);
      this._store.deletePeerFromState(conn.peer);
    });

    conn.on('error', (err: any) => {
      console.error(this.logTag + ' Peer connection error ', err)
      console.error(this.logTag + ' error type ', err.type)
      this._hooks?.onPeerError?.(conn.peer);
      this._store.setPeerConnectionState(conn.peer, PeerConnectionState.ERROR);
    });
  }

  _addDefaultHandlers(handler: DataHandler) {
    handler.registerHandler('room_information', handleRoomInformation);
  }

  _handlePeerError(err: any, callback: Function) { // err is actually a PeerError
    console.error(this.logTag + ' Peer error caught ', err.type);

    switch (err.type) {
      case 'browser-incompatible':
        console.error(this.logTag + ' Browser incompatible, please use a modern browser');
        alert("This browser seemingly does not support WebRTC and is not compatible with this application. Please use a modern browser.")
        break;
      case 'peer-unavailable':
        // eslint-disable-next-line no-case-declarations
        const peerId = (err.message as String).split(' ').pop();
        if (!peerId) {
          console.error(this.logTag + ' Could not extract peer id from error message');
          return
        }
        this.reconnectionCount++;
        if (this.reconnectionCount < 4) {
          console.debug(this.logTag + " adding reconnecter attempt in 1 sec");
          this.reconnecter = setTimeout(() => {
            console.debug(this.logTag + " Trying to reconnect to " + peerId);
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
      case 'ssl-unavailable':
      case 'server-error':
      case 'network':
        this._store.setConnectionState(PeerConnectionState.ERROR);
        break;
      case 'disconnected':
        this._store.setConnectionState(PeerConnectionState.DISCONNECTED);
        break;
      case 'invalid-id':
      case 'unavailable-id':
        console.warn(this.logTag + " The given Peer ID is either not allowed or already taken on this server");
        console.warn(this.logTag + " TODO: If this happens a lot we could try reconnecting with a new ID");
        this._store.setConnectionState(PeerConnectionState.ERROR);
        break;
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