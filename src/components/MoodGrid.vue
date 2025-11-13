<template>
  <div class="mood-grid" :class="{ compact }">
    <button
      v-for="m in moods"
      :key="m.id"
      class="mood-card"
      :class="{ 'mood-selected': m.id === selectedId }"
      @click="onSelect(m)"
      :aria-pressed="m.id === selectedId"
      type="button"
    >
      <div class="mood-art">{{ m.emoji }}</div>
      <div v-if="showNames" class="mood-name">{{ m.name }}</div>
    </button>
    <slot name="empty" v-if="Array.isArray(moods) && moods.length === 0">No moods available</slot>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  moods: { type: Array, default: () => [] },
  selectedId: { type: [String, Number, null], default: null },
  compact: { type: Boolean, default: false },
  showNames: { type: Boolean, default: true }
})

const emit = defineEmits(['select'])

function onSelect(mood) {
  emit('select', mood)
}
</script>

<style scoped>
.mood-grid { display:grid; grid-template-columns: repeat(3, 1fr); gap:1rem }
.mood-grid.compact { grid-template-columns: repeat(2, 1fr) }
.mood-card { background: rgba(255,255,255,0.03); border-radius:14px; padding:1rem; display:flex; flex-direction:column; align-items:center; gap:0.5rem; cursor:pointer; border:1px solid rgba(255,255,255,0.04); width:100%; }
.mood-card .mood-art { font-size:2.4rem }
.mood-card .mood-name { font-weight:600 }
.mood-card.mood-selected { background: linear-gradient(135deg,var(--purple),var(--magenta)); color:#fff; border-color:transparent; transform:translateY(-4px) }

@media (max-width:640px) {
  .mood-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
}
</style>
