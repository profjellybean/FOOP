<script setup lang="ts">
import { usePeerConnectionStore } from '@/stores/peerConnection';
import { PeerConnectionState } from '@/stores/types';
import { computed, type ComputedRef } from 'vue';


const peerStore = usePeerConnectionStore();

const props = defineProps<{
  peerId: string;
  self?: boolean;
}>();

const mappedConnectionState: ComputedRef<String> = computed(() => {
  return _mapConnectionState(connectionState.value);
});

const connectionState: ComputedRef<PeerConnectionState> = computed(() => {
  if (props.self === true) {
    return peerStore.connectionState;
  }

  return peerStore.peerConnectionStates[props.peerId];
})

const _mapConnectionState = (state: PeerConnectionState) => {
  switch (state) {
    case PeerConnectionState.INITIAL:
      return "Initial state";
    case PeerConnectionState.CONNECTING:
      return "Connecting...";
    case PeerConnectionState.CONNECTED:
      return "Connection successful";
    case PeerConnectionState.ERROR:
      return "Error during connection";
    case PeerConnectionState.DISCONNECTED:
      return "Disconnected from peer";
    case PeerConnectionState.NOT_FOUND:
      return "Could not find peer after 3 reconnection attempts";
  }
}

// haha we now have sentient connections :D
const connectionSentiment = computed(() => {
  switch (connectionState.value) {
    case PeerConnectionState.INITIAL:
    case PeerConnectionState.CONNECTING:
    default:
      return 0;
    case PeerConnectionState.CONNECTED:
      return 1;
    case PeerConnectionState.ERROR:
    case PeerConnectionState.NOT_FOUND:
    case PeerConnectionState.DISCONNECTED:
      return 2;
  }
});

</script>

<template>
  <div class="flex justify-start items-center">
    <div
      class="flex justify-center items-center rounded-full bg-neutral-400 text-neutral-700 text-ellipsis h-10 w-10 p-1 text-xs text-ellipsis overflow-hidden">
      {{
        self ? 'YOU' : props.peerId.slice(0, 4) }}</div>
    <div class="ml-2 flex flex-col">

      <div class="text-gray-800/80">{{ props.peerId }}</div>
      <div :class="{
        'text-sky-400': connectionSentiment === 0,
        'text-green-400': connectionSentiment === 1,
        'text-red-500': connectionSentiment === 2
      }" class="flex justify-start items-center">
        <span v-if="connectionSentiment !== 2" class="inline-block h-2 w-2 rounded-full animate-pulse mr-2" :class="{
          'bg-sky-400': connectionSentiment === 0,
          'bg-green-400': connectionSentiment === 1,
        }"></span>
        {{ mappedConnectionState }}
      </div>
    </div>
  </div>
</template>

<style></style>
