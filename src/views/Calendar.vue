<template>
  <section class="home">
    <div class="home-container">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
        <button class="icon-btn" @click="goBack">← Back</button>
        <h2 class="date-title">Calendar</h2>
        <div style="width:48px"></div>
      </div>

      <div style="margin-bottom:1rem;">
        <Calendar :initialDate="initialDateFromQuery" :markedDates="markedDates" @select-date="onDateSelected" />
      </div>

      <!-- selected date and per-day habits -->
      <div v-if="selected">
        <p style="color:var(--muted)">Selected: {{ selected }}</p>
        <div v-if="habitsForSelected().length">
          <h3 style="margin-top:0.5rem;color:var(--text)">Habits for this day</h3>
          <ul>
            <li v-for="h in habitsForSelected()" :key="h.id" style="color:var(--muted);margin-bottom:0.25rem">{{ h.icon }} {{ h.title }}</li>
          </ul>
        </div>
        <div v-else style="color:var(--muted);margin-top:0.5rem">No recorded completions for this day.</div>
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

  const markedDates = computed(() => Object.keys(completions.value || {}))

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
</script>

<style scoped>
.home { min-height: 100dvh; padding: clamp(1.5rem, 5vw, 3rem); background:#101010 }
.home-container { max-width:480px; margin:0 auto }
.date-title { color:var(--text); font-weight:700 }
</style>
