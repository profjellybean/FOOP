import { PeerService } from "@/services/peer";
import { shallowRef, type ShallowRef } from "vue";

const peerService: ShallowRef<PeerService> = shallowRef({} as PeerService);

export const usePeerService = function () {
  if (peerService.value.logTag === undefined) {
    peerService.value = new PeerService();
  }

  return {
    peerService,
  }
}