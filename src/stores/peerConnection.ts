import { useStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { ref } from "vue";
import { PeerConnectionState, type PeerConnectionStates } from "../types";

export const usePeerConnectionStore = defineStore('webrtc', () => {
  const connectionState = ref<PeerConnectionState>(PeerConnectionState.INITIAL);
  const peerId = useStorage<string | null>('peerId', null);
  const peerConnectionStates = ref<PeerConnectionStates>({});

  function setPeerId(id: string | null) {
    peerId.value = id;
  }

  function setPeerConnectionState(id: string, state: PeerConnectionState) {
    peerConnectionStates.value[id] = state;
  }

  function setConnectionState(state: PeerConnectionState) {
    connectionState.value = state;
  }

  return {
    connectionState,
    peerId,
    peerConnectionStates,
    setPeerId,
    setPeerConnectionState,
    setConnectionState
  }
});