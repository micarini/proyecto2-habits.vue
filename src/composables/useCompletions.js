import { ref } from 'vue'

const STORAGE_KEY = 'habitCompletions'
const completions = ref({})
let initialized = false

function loadCompletions() {
  if (initialized) return
  initialized = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) completions.value = JSON.parse(raw)
  } catch (e) { completions.value = {} }
}

function saveCompletions() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(completions.value)) } catch (e) { /* noop */ }
}

function toggleCompletionForDay(dayISO, habitId) {
  const dayList = Array.isArray(completions.value[dayISO]) ? [...completions.value[dayISO]] : []
  const idx = dayList.indexOf(habitId)
  if (idx === -1) dayList.push(habitId)
  else dayList.splice(idx, 1)
  completions.value = { ...completions.value, [dayISO]: dayList }
  saveCompletions()
}

function setCompletionsForDay(dayISO, ids) {
  completions.value = { ...completions.value, [dayISO]: Array.isArray(ids) ? ids : [] }
  saveCompletions()
}

if (typeof window !== 'undefined') loadCompletions()

export function useCompletions() {
  return { completions, loadCompletions, saveCompletions, toggleCompletionForDay, setCompletionsForDay }
}
