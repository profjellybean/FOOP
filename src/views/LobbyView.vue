<script setup lang="ts">
import PeerItem from '@/components/PeerItem.vue';
import router from '@/router';
import { GameService } from '@/services/game/game';
import { GameStatus } from '@/services/game/types';
import { PeerService } from '@/services/peer';
import { usePeerConnectionStore } from '@/stores/peerConnection';
import { PeerConnectionState } from '@/types';
import { computed, inject, onBeforeMount, provide, ref, watch } from 'vue';
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute } from 'vue-router';

const logTag = "[LobbyView]";

const connectionStore = usePeerConnectionStore();

let peerService = inject('peerService') as PeerService;

const showPauseButton = ref(false);

const gameService = new GameService(peerService, undefined, {
  networked: true,
  multiplayer: true
});

provide('gameService', gameService);

const lobbyId = computed(() => {
  const route = useRoute();

  return route.params.lobbyId;
})

const pageState = ref(0); // 0 initial, 1 creating peer, 2 connecting to lobby, 3 done

const yourGame = computed(() => {
  return lobbyId.value === connectionStore.peerId;
});

watch(pageState, (value) => {
  if (value === 3 && yourGame.value === true) {
    gameService.initMultiplayer();
  }
});

watch(gameService.context, (value) => {
  if (value.status == GameStatus.started) {
    showPauseButton.value = true;
  }
}, { deep: true })

const connections = computed(() => {
  return Object.keys(connectionStore.peerConnectionStates);
});

const connectToLobby = async (lobbyId?: string) => {
  pageState.value = 2;
  console.log(`${logTag} Connecting to lobby ${lobbyId}`);
  try {
    await peerService.connectToPeer(lobbyId as string, true);
    gameService.initMultiplayer();
  } catch (e) {
    console.error(`${logTag} Could not connect to lobby ${lobbyId}`);
    console.error(e);
    return;
  }
  pageState.value = 3;
};


const initialisePeer = async (peerId: string | null, isHost: boolean) => {
  if ([PeerConnectionState.CONNECTING, PeerConnectionState.CONNECTED].includes(connectionStore.connectionState)) {
    console.log(logTag + " Peer is already connecting or connected, skipping init");
    pageState.value = 2;
    return;
  }

  try {
    pageState.value = 1;
    console.log(logTag + ` Initializing self with ${isHost ? 'id ' + peerId : 'new id'}`);
    await peerService.initSelf(peerId ?? undefined, isHost);
    pageState.value = 2;
  } catch (e) {
    console.error(`${logTag} Initialization new id failed;`);
  }
}

const _beforeRenderHooks = async () => {
  if (peerService === undefined) {
    // if there is no peer service we - for now - just instantiate one 
    // to prevent users from not being able to communicate with peers from here on
    peerService = new PeerService();
    provide('peerService', peerService);
  }

  await initialisePeer(connectionStore.peerId, yourGame.value);

  if (peerService.peerConnections.value.filter((e) => e.provider.id === lobbyId.value).length == 0 && lobbyId.value !== connectionStore.peerId) {
    await connectToLobby(lobbyId.value as string);
  } else {
    // the user is the host of the lobby
    pageState.value = 3;
  }
}


onBeforeRouteUpdate(async (to, from, next) => {
  await _beforeRenderHooks();

  next();
});

onBeforeRouteLeave(() => {
  const leave = confirm("waaaait you will be removed from the lobby if you leave!");

  if (leave) {
    peerService.destroy();
  }

  return leave;
});

onBeforeMount(async () => {
  await _beforeRenderHooks();
});

const startGame = () => {
  gameService.startGame();
}

const pauseGame = () => {
  gameService.pauseGame();
}

const leaveLobby = async () => {
  router.push(`/`);
}

</script>

<template>
  <div class="h-full w-full bg-blue-700 flex flex-col flex-wrap gap-8 justify-center items-center">
    <div>
      <div class="flex justify-start items-center mb-4">
        <button
          class="rounded-full px-3 py-1 bg-slate-400/20 border border-slate-400 mix-blend-lighten text-slate-200 text-sm hover:bg-slate-400/90 hover:text-white focus:bg-slate-400/90 focus:text-white"
          @click="leaveLobby">
          <span class="text-xs">&lt;</span> Back
        </button>
      </div>
      <div class="bg-white shadow-md rounded-lg p-8 text-blue-950 max-w-full lg:max-w-lg">
        <h3 class="text-lg font-mono mb-3">{{ yourGame ? 'Your' : 'The' }} game
          lobby</h3>

        <PeerItem v-if="connectionStore.peerId !== null" :peer-id="connectionStore.peerId" self></PeerItem>
        <hr class="mt-4 mb-4 border-gray-100">
        <div v-if="pageState === 1">
          Initialising peer...
        </div>
        <div v-else>
          <p class=" text-xs text-gray-500 mb-2">Connected members</p>
          <ul v-if="connections.length > 0" class="divide-y">
            <template v-for="(conn, idx) in connections" :key="idx">
              <PeerItem :peer-id="conn" class="py-2"></PeerItem>
            </template>
          </ul>
          <p class="text-fuchsia-400 text-sm" v-else>No peers connected</p>
          <button v-if="yourGame"
            class="w-full mt-6 bg-blue-700/40 hover:bg-blue-700/60 border border-blue-700 rounded-lg p-2"
            @click="startGame">Start Game</button>

          <button v-if="yourGame && showPauseButton"
            class="w-full mt-6 bg-blue-700/40 hover:bg-blue-700/60 border border-blue-700 rounded-lg p-2"
            @click="pauseGame">Pause Game</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style></style>
