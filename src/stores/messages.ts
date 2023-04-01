import { ref } from "vue";
import { defineStore } from 'pinia'

export const useMessageStore = defineStore('messages', () => {
  const messages = ref<String[]>([]);

  function addMessage(message: String) {
    messages.value.push(message);
  }

  return { messages, addMessage };
});