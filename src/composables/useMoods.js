import { ref } from 'vue'

const STORAGE_KEY = 'moodEntries'
const moodEntries = ref({})
let initialized = false

const moods = [
  { id: 1, name: 'Happy', emoji: '😊' },
  { id: 2, name: 'Sad', emoji: '😢' },
  { id: 3, name: 'Angry', emoji: '😠' },
  { id: 4, name: 'Calm', emoji: '😌' },
  { id: 5, name: 'Anxious', emoji: '😰' },
  { id: 6, name: 'Motivated', emoji: '💪' }
]

function loadMoods() {
  if (initialized) return
  initialized = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) moodEntries.value = JSON.parse(raw)
  } catch (e) { moodEntries.value = {} }
}

function saveMoods() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(moodEntries.value)) } catch (e) { /* noop */ }
}

function setMoodForDay(dayISO, mood) {
  moodEntries.value = { ...moodEntries.value, [dayISO]: mood }
  saveMoods()
}

function deleteMoodForDay(dayISO) {
  if (!moodEntries.value[dayISO]) return
  const copy = { ...moodEntries.value }
  delete copy[dayISO]
  moodEntries.value = copy
  saveMoods()
}

function getMoodForDay(dayISO) {
  return moodEntries.value[dayISO] || null
}

if (typeof window !== 'undefined') loadMoods()

export function useMoods() {
  return { moodEntries, loadMoods, saveMoods, setMoodForDay, deleteMoodForDay, getMoodForDay, moods }
}
