<template>
  <div v-if="selected" class="per-day-details">
    <p class="selected-label">Selected: {{ selected }}</p>

    <div v-if="habitsList.length">
      <h3 class="section-title">Habits for this day</h3>
      <PerDayHabitsList :items="habitsList" />
    </div>

    <MoodSummary :mood="selectedMood" />

    <div v-if="!habitsList.length && !selectedMood" class="fallback">No recorded completions or mood for this day.</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PerDayHabitsList from './PerDayHabitsList.vue'
import MoodSummary from './MoodSummary.vue'

const props = defineProps({
  selected: { type: String, default: null },
  habits: { type: Array, default: () => [] },
  completions: { type: Object, default: () => ({}) },
  moodEntries: { type: Object, default: () => ({}) },
  moods: { type: Array, default: () => [] }
})

const habitsList = computed(() => {
  if (!props.selected) return []
  const dayKey = props.selected.slice(0,10)
  const ids = Array.isArray(props.completions[dayKey]) ? props.completions[dayKey] : []
  return ids.map(id => props.habits.find(h => h.id === id)).filter(Boolean)
})

const selectedMood = computed(() => {
  if (!props.selected) return null
  const dayKey = props.selected.slice(0,10)
  const entry = (props.moodEntries || {})[dayKey]
  if (!entry || !entry.moodId) return null
  return props.moods.find(m => m.id === entry.moodId) || null
})
</script>

<style scoped>
.per-day-details { margin-bottom: 4rem }
.selected-label { color: var(--muted) }
.section-title { margin-top: 0.5rem; color: var(--text) }
.fallback { color: var(--muted); margin-top: 0.5rem }
</style>
