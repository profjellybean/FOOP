import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMessageStore = defineStore('messages', () => {
  const messages = ref<String[]>([])

  function addMessage(message: String) {
    messages.value.push(message)
  }

  return { messages, addMessage }
})
