<template>
  <div class="emoji-picker-container"></div>
</template>

<script>
import { onMounted } from 'vue'
import { Picker } from 'emoji-mart'
import data from '@emoji-mart/data'

export default {
  name: 'EmojiPicker',
  emits: ['emoji-selected'],
  setup(props, { emit }) {
    onMounted(() => {
      const picker = new Picker({
        data,
        onEmojiSelect: (emoji) => {
          emit('emoji-selected', emoji)
        }
      })
      document.querySelector('.emoji-picker-container').appendChild(picker)
    })
  }
}
</script>

<style scoped>
.emoji-picker-container {
  width: 100%;
}
</style>
