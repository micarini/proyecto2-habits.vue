<template>
  <div v-if="visible" class="options-overlay" @click.self="onClose">
    <div class="options-modal">
      <h3 class="options-title">{{ creating ? 'New Habit' : 'Edit Habit' }}</h3>

      <div class="emoji-picker-row" style="justify-content:center;">
        <span class="emoji-preview" @click.stop="showEmojiPicker = !showEmojiPicker">{{ editing.icon || '😀' }}</span>
        <transition name="fade">
          <div v-if="showEmojiPicker" class="emoji-picker-modal">
            <EmojiPicker @emoji-selected="onEmojiSelect" />
          </div>
        </transition>
      </div>

      <div class="modal-field">
        <label class="modal-label">Title</label>
        <input v-model="editing.title" class="input" placeholder="Habit name" />
      </div>

      <!-- Primary actions: show when not confirming delete -->
      <div class="options-actions" v-if="!showDeleteConfirm">
        <button v-if="!creating" class="btn btn-outline-danger" @click="showDeleteConfirm = true">Delete</button>
        <button class="btn btn-secondary" :disabled="!editing.title" @click="doSave">Save</button>
      </div>

      <!-- Delete confirmation: replaces the primary actions while visible -->
      <div v-if="showDeleteConfirm" class="delete-confirm">
        <p>Are you sure you want to delete "{{ editing.title }}"?</p>
        <div style="display:flex;gap:0.75rem;justify-content:center;margin-top:0.75rem;">
          <button class="btn btn-outline-danger" @click="doDelete">Yes, delete</button>
          <button class="btn btn-secondary" @click="doSave">No, save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import EmojiPicker from '../components/EmojiPicker.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  initialHabit: { type: Object, default: null },
  creating: { type: Boolean, default: false }
})
const emit = defineEmits(['save','delete','close'])

const editing = ref({ id: null, icon: '', title: '' })
const showEmojiPicker = ref(false)
const showDeleteConfirm = ref(false)

watch(() => props.initialHabit, (v) => {
  if (v) editing.value = { ...v }
  else editing.value = { id: null, icon: '', title: '' }
})

watch(() => props.visible, (v) => {
  if (v && props.initialHabit) editing.value = { ...props.initialHabit }
  if (!v) {
    showEmojiPicker.value = false
    showDeleteConfirm.value = false
  }
})

function onEmojiSelect(emoji) {
  editing.value.icon = emoji.native || emoji.emoji || ''
  showEmojiPicker.value = false
}

function doSave() {
  // emit the edited/created habit back to the parent
  emit('save', { ...editing.value })
}

function doDelete() {
  if (!editing.value || editing.value.id == null) return
  emit('delete', editing.value.id)
}

function onClose() {
  emit('close')
}
</script>

<style scoped>
.options-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.6);
  z-index: 1200;
}
.options-modal {
  background: var(--background, #18181b);
  padding: 1.25rem 1.25rem;
  border-radius: 16px;
  width: 92%;
  max-width: 380px;
  text-align: center;
  box-shadow: 0 12px 48px rgba(0,0,0,0.6);
}
.options-title {
  margin: 0 0 0.5rem;
  color: var(--text, #fff);
  font-size: 1.2rem;
  font-weight: 700;
}
.emoji-picker-row {
  position: relative;
  display:flex;
  align-items:center;
  justify-content:center;
  margin-bottom: 0.5rem;
}
.emoji-preview {
  display: inline-grid;
  place-items: center;
  width: 96px;
  height: 96px;
  font-size: 2.6rem;
  cursor: pointer;
  border: 4px solid rgba(255,255,255,0.06);
  border-radius: 50%;
  background: rgba(255,255,255,0.02);
  transition: border 0.15s, transform 0.08s;
  box-shadow: 0 8px 24px rgba(0,0,0,0.6);
  margin: 0.25rem auto 0.75rem;
}
.emoji-preview:hover { border-color: rgba(167,139,250,0.18); transform: translateY(-2px); }
.emoji-picker-modal {
  position: absolute;
  z-index: 1100;
  top: 110%;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
}
.modal-field { margin-bottom: 0.5rem; text-align: left }
.modal-label { display:block; margin-bottom: 0.25rem; color: var(--muted); font-size:0.85rem }

.input {
  width: 100%;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.02);
  color: var(--text, #fff);
  font-size: 1rem;
  outline: none;
}
.input:focus { border-color: var(--purple, #a78bfa); }

.options-actions { display:flex; gap:0.5rem; justify-content:center; margin-top:0.5rem }
.delete-confirm { margin-top: 0.75rem; color: var(--muted); }

</style>
