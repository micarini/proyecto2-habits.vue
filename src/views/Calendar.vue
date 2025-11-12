<template>
  <section class="home">
    <div class="home-container">
      <PageHeader title="Calendar" @back="goBack" />

      <div style="margin-bottom:1rem;">
        <Calendar
          :initialDate="initialDateFromQuery"
          :markedDates="markedDates"
          :habitDates="Object.keys(completions.value || {})"
          :moodDates="Object.keys(moodEntries.value || {})"
          @select-date="onDateSelected"
        />
      </div>

      <!-- selected date and per-day habits/mood -->
      <PerDayDetails
        :selected="selected"
        :habits="habits"
        :completions="completions"
        :moodEntries="moodEntries.value"
        :moods="moods"
      />
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMoods } from '../composables/useMoods.js'
import { useRouter, useRoute } from 'vue-router'
import Calendar from '../components/Calendar.vue'
import PageHeader from '../components/PageHeader.vue'
import PerDayDetails from '../components/PerDayDetails.vue'
import { useHabits } from '../composables/useHabits.js'
import { useCompletions } from '../composables/useCompletions.js'

const router = useRouter()
const route = useRoute()
  const selected = ref(null)
  const { habits, loadHabits } = useHabits()
  const { completions, loadCompletions } = useCompletions()
  loadHabits()
  loadCompletions()

  // use shared moods composable for mood entries (keeps a single source of truth)
  const { moodEntries, loadMoods, moods } = useMoods()
  loadMoods()

  // markedDates is the union of days with habit completions and days with mood entries
  const markedDates = computed(() => {
    const dates = new Set()
    Object.keys(completions.value || {}).forEach(d => dates.add(d))
    Object.keys(moodEntries.value || {}).forEach(d => dates.add(d))
    return Array.from(dates)
  })


function goBack() {
  router.back()
}

function onDateSelected(iso) {
  selected.value = iso
}

// if a date was provided via query (e.g. /calendar?date=YYYY-MM-DD), set it as selected
const initialDateFromQuery = route.query.date || null

// if query included a date, pre-select it
if (initialDateFromQuery) selected.value = initialDateFromQuery

function habitsForSelected() {
  if (!selected.value) return []
  const dayKey = selected.value.slice(0,10)
  const ids = Array.isArray(completions.value[dayKey]) ? completions.value[dayKey] : []
  return ids.map(id => habits.value.find(h => h.id === id)).filter(Boolean)
}

function moodForSelected() {
  if (!selected.value) return null
  const dayKey = selected.value.slice(0,10)
  const entry = (moodEntries.value || {})[dayKey]
  if (!entry || !entry.moodId) return null
  return moods.find(m => m.id === entry.moodId) || null
}
</script>

<style scoped>
.home { 
  min-height: 100dvh; 
  padding: clamp(1.5rem, 5vw, 3rem); 
  background:#101010 
}

.home-container { 
  max-width:480px; 
  margin:0 auto 
}
</style>
