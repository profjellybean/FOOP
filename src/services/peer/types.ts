import type { DataConnection } from "peerjs";

export enum PeerServiceHook {
  INIT = 'onInit',
  PEER_CONNECTION = 'onPeerConnection',
  PEER_DISCONNECTED = 'onPeerDisconnected',
  PEER_ERROR = 'onPeerError'
}

export type PeerServiceHooks = {
  [PeerServiceHook.INIT]?: (id: string) => void;
  [PeerServiceHook.PEER_CONNECTION]?: (connection: DataConnection) => boolean;
  [PeerServiceHook.PEER_DISCONNECTED]?: (id: string) => void;
  [PeerServiceHook.PEER_ERROR]?: (error: any) => void;
}