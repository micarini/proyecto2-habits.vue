<template>
  <div v-if="mood" class="mood-summary">
    <h3 class="mood-title">Mood</h3>
    <p class="mood-row"><span class="emoji">{{ mood.emoji }}</span><span class="mood-name">{{ mood.name }}</span></p>
  </div>
</template>

<script setup>
const props = defineProps({ mood: { type: Object, default: null } })
</script>

<style scoped>
.mood-summary { margin-top: 0.75rem }
.mood-title { margin: 0; color: var(--text) }
.mood-row { color: var(--muted); margin-top: 0.25rem; display:flex; gap:0.5rem; align-items:center }
.mood-row .emoji { font-size: 1.1rem }
.mood-row .mood-name { font-weight: 600 }
</style>
