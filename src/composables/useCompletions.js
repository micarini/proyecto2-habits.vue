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
  // if dayList is empty after toggling, remove the day key entirely so calendar doesn't show an empty-dot
  if (dayList.length === 0) {
    const copy = { ...completions.value }
    delete copy[dayISO]
    completions.value = copy
  } else {
    completions.value = { ...completions.value, [dayISO]: dayList }
  }
  saveCompletions()
}

function setCompletionsForDay(dayISO, ids) {
  // if ids is not an array or is empty, remove the day key to avoid leaving an empty marker
  if (!Array.isArray(ids) || ids.length === 0) {
    const copy = { ...completions.value }
    delete copy[dayISO]
    completions.value = copy
  } else {
    completions.value = { ...completions.value, [dayISO]: ids }
  }
  saveCompletions()
}

if (typeof window !== 'undefined') loadCompletions()

export function useCompletions() {
  return { completions, loadCompletions, saveCompletions, toggleCompletionForDay, setCompletionsForDay }
}
