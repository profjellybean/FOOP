export enum PeerConnectionState {
  INITIAL = 'initial',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  NOT_FOUND = "not-found",
  ERROR = 'error'
}

export type PeerConnectionStates = {
  [key: string]: PeerConnectionState
};