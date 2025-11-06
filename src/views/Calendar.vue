<template>
  <section class="home">
    <div class="home-container">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
        <button class="icon-btn" @click="goBack">← Back</button>
        <h2 class="date-title">Calendar</h2>
        <div style="width:48px"></div>
      </div>

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
      <div v-if="selected">
        <p style="color:var(--muted)">Selected: {{ selected }}</p>

        <div v-if="habitsForSelected().length">
          <h3 style="margin-top:0.5rem;color:var(--text)">Habits for this day</h3>
          <ul>
            <li v-for="h in habitsForSelected()" :key="h.id" style="color:var(--muted);margin-bottom:0.25rem">{{ h.icon }} {{ h.title }}</li>
          </ul>
        </div>

        <div v-if="moodForSelected()" style="margin-top:0.75rem">
          <h3 style="margin:0;color:var(--text)">Mood</h3>
          <p style="color:var(--muted);margin-top:0.25rem">{{ moodForSelected().emoji }}  {{ moodForSelected().name }}</p>
        </div>

        <div v-if="!habitsForSelected().length && !moodForSelected()" style="color:var(--muted);margin-top:0.5rem">No recorded completions or mood for this day.</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Calendar from '../components/Calendar.vue'

const router = useRouter()
const route = useRoute()
  const selected = ref(null)
  const completions = ref({})
  const habits = ref([])

  // load user habits and completions from localStorage
  const savedHabits = localStorage.getItem('userHabits')
  if (savedHabits) {
    try { habits.value = JSON.parse(savedHabits) } catch (e) { habits.value = [] }
  }
  const savedCompletions = localStorage.getItem('habitCompletions')
  if (savedCompletions) {
    try { completions.value = JSON.parse(savedCompletions) } catch (e) { completions.value = {} }
  }

  // load mood entries so days with moods also get a mark on the calendar
  const moodEntries = ref({})
  const savedMoods = localStorage.getItem('moodEntries')
  if (savedMoods) {
    try { moodEntries.value = JSON.parse(savedMoods) } catch (e) { moodEntries.value = {} }
  }

  // markedDates is the union of days with habit completions and days with mood entries
  const markedDates = computed(() => {
    const dates = new Set()
    Object.keys(completions.value || {}).forEach(d => dates.add(d))
    Object.keys(moodEntries.value || {}).forEach(d => dates.add(d))
    return Array.from(dates)
  })

  // small local mood map to translate moodId -> display (keeps UI consistent with MoodTracker)
  const moods = [
    { id: 1, name: 'Happy', emoji: '😊' },
    { id: 2, name: 'Sad', emoji: '😢' },
    { id: 3, name: 'Angry', emoji: '😠' },
    { id: 4, name: 'Calm', emoji: '😌' },
    { id: 5, name: 'Anxious', emoji: '😰' },
    { id: 6, name: 'Motivated', emoji: '💪' }
  ]

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
.home { min-height: 100dvh; padding: clamp(1.5rem, 5vw, 3rem); background:#101010 }
.home-container { max-width:480px; margin:0 auto }
.date-title { color:var(--text); font-weight:700 }
</style>
