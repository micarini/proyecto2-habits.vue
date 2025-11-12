import { ref } from 'vue'

const STORAGE_KEY = 'userHabits'
const habits = ref([])
let initialized = false

function loadHabits() {
  if (initialized) return
  initialized = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) habits.value = JSON.parse(raw)
  } catch (e) {
    habits.value = []
  }
}

function saveHabits() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(habits.value)) } catch (e) { /* noop */ }
}

function addHabit(h) {
  habits.value.push(h)
  saveHabits()
}

function updateHabit(h) {
  const idx = habits.value.findIndex(x => x.id === h.id)
  if (idx === -1) return
  habits.value[idx] = { ...habits.value[idx], ...h }
  saveHabits()
}

function deleteHabit(id) {
  habits.value = habits.value.filter(h => h.id !== id)
  saveHabits()
}

// initialize eagerly when imported in browser
if (typeof window !== 'undefined') loadHabits()

export function useHabits() {
  return { habits, loadHabits, saveHabits, addHabit, updateHabit, deleteHabit }
}
