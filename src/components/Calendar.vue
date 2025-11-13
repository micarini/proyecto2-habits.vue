<template>
  <div class="month-calendar">
    <div class="month-header">
      <button class="nav" @click="prevMonth" aria-label="Previous month">‹</button>
      <div class="month-title">{{ monthLabel }}</div>
      <button class="nav" @click="nextMonth" aria-label="Next month">›</button>
    </div>

    <div class="weekdays">
      <div v-for="d in weekdays" :key="d" class="weekday">{{ d }}</div>
    </div>

    <div class="days-grid">
      <div
        v-for="cell in calendarGrid"
        :key="cell.key"
  :class="['day-cell', { muted: cell.muted, today: cell.isToday, selected: cell.isSelected }]"
        @click="select(cell)">
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
          <div class="day-number">{{ cell.date.getDate() }}</div>
          <div v-if="cell.hasHabit && cell.hasMood" class="day-dot-group" aria-hidden>
            <span class="mini-dot mood" aria-hidden></span>
            <span class="mini-dot habit" aria-hidden></span>
          </div>
          <div v-else-if="cell.hasMood" class="day-dot mood" aria-hidden></div>
          <div v-else-if="cell.hasHabit" class="day-dot habit" aria-hidden></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatLocalDate } from '../utils/date.js'

const props = defineProps({
  initialDate: { type: String, default: null },
  markedDates: { type: Array, default: () => [] },
  habitDates: { type: Array, default: () => [] },
  moodDates: { type: Array, default: () => [] },
  // when true (default) the component will fallback to reading localStorage
  // keys (habitCompletions / moodEntries) when the corresponding props are  empty. Set to false to force the calendar to render only what props contain.
  allowLocalFallback: { type: Boolean, default: true }
})
const emit = defineEmits(['select-date'])

const weekdays = ['SU','MO','TU','WE','TH','FR','SA']

import { watch } from 'vue'

// parse YYYY-MM-DD into a local Date 
function parseIsoToLocalDate(iso) {
  if (!iso || typeof iso !== 'string') return null
  const parts = iso.slice(0,10).split('-').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return null
  const [y,m,d] = parts
  return new Date(y, m - 1, d)
}

const showDate = ref(props.initialDate ? parseIsoToLocalDate(props.initialDate) : new Date())
const selectedDate = ref(props.initialDate ? parseIsoToLocalDate(props.initialDate) : new Date())

// react to parent changes to initialDate so parent-controlled selection updates calendar
watch(() => props.initialDate, (val) => {
  if (!val) return
  const d = parseIsoToLocalDate(val)
  if (!d) return
  showDate.value = new Date(d.getFullYear(), d.getMonth(), 1)
  selectedDate.value = d
})

function startOfMonth(d){ return new Date(d.getFullYear(), d.getMonth(), 1) }
function endOfMonth(d){ return new Date(d.getFullYear(), d.getMonth() + 1, 0) }

function isSameDay(a,b){ return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate() }

const monthLabel = computed(() => showDate.value.toLocaleString(undefined, { month: 'long', year: 'numeric' }))


// If the parent didn't provide separate arrays, attempt to load from localStorage
// so existing saved data is visible even if the caller omitted props.
function loadKeysFromLocalStorage(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Object.keys(parsed || {})
  } catch (e) { return [] }
}
// sanitize arrays of date-like values: normalize to YYYY-MM-DD strings, filter invalid, dedupe
function sanitizeDates(arr) {
  if (!Array.isArray(arr)) return []
  const seen = new Set()
  const out = []
  for (const v of arr) {
    if (v == null) continue
    const s = String(v).slice(0,10)
    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(s)) continue
    if (seen.has(s)) continue
    seen.add(s)
    out.push(s)
  }
  return out
}

const effectiveHabitDates = computed(() => {
  // Prefer explicit prop (sanitized).
  if (Array.isArray(props.habitDates) && props.habitDates.length) return sanitizeDates(props.habitDates)
  // If fallback is allowed, try legacy markedDates then localStorage.
  if (props.allowLocalFallback) {
    if (Array.isArray(props.markedDates) && props.markedDates.length) return sanitizeDates(props.markedDates)
    return sanitizeDates(loadKeysFromLocalStorage('habitCompletions'))
  }
  // otherwise, no habit dates
  return []
})

const effectiveMoodDates = computed(() => {
  if (Array.isArray(props.moodDates) && props.moodDates.length) return sanitizeDates(props.moodDates)
  if (props.allowLocalFallback) return sanitizeDates(loadKeysFromLocalStorage('moodEntries'))
  return []
})

const calendarGrid = computed(() => {
  const start = startOfMonth(showDate.value)
  const end = endOfMonth(showDate.value)
  const grid = []

  const startDay = start.getDay() // 0..6
  // days from previous month
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(showDate.value.getFullYear(), showDate.value.getMonth() - 1, (new Date(showDate.value.getFullYear(), showDate.value.getMonth(), 0)).getDate() - i)
    const iso = formatLocalDate(date)
    const hasHabitPrev = effectiveHabitDates.value.includes(iso)
    const hasMoodPrev = effectiveMoodDates.value.includes(iso)
    const hasMarkedPrev = props.markedDates.includes(iso)
    grid.push({
      date,
      muted: true,
      key: date.toISOString(),
      isToday: isSameDay(date, new Date()),
      isSelected: isSameDay(date, selectedDate.value),
      hasHabit: hasHabitPrev,
      hasMood: hasMoodPrev
    })
  }

  for (let d = 1; d <= end.getDate(); d++) {
    const date = new Date(showDate.value.getFullYear(), showDate.value.getMonth(), d)
    const iso = formatLocalDate(date)
    const hasHabit = effectiveHabitDates.value.includes(iso)
    const hasMood = effectiveMoodDates.value.includes(iso)
    const hasMarked = props.markedDates.includes(iso)
    grid.push({
      date,
      muted: false,
      key: date.toISOString(),
      isToday: isSameDay(date, new Date()),
      isSelected: isSameDay(date, selectedDate.value),
      hasHabit: hasHabit,
      hasMood: hasMood
    })
  }

  // fill to 42 cells
  let nextDay = 1
  while (grid.length < 42) {
    const date = new Date(showDate.value.getFullYear(), showDate.value.getMonth() + 1, nextDay++)
    const iso = formatLocalDate(date)
    const hasHabitNext = effectiveHabitDates.value.includes(iso)
    const hasMoodNext = effectiveMoodDates.value.includes(iso)
    const hasMarkedNext = props.markedDates.includes(iso)
    grid.push({
      date,
      muted: true,
      key: date.toISOString(),
      isToday: isSameDay(date, new Date()),
      isSelected: isSameDay(date, selectedDate.value),
      hasHabit: hasHabitNext,
      hasMood: hasMoodNext
    })
  }

  return grid
})

function prevMonth(){ showDate.value = new Date(showDate.value.getFullYear(), showDate.value.getMonth() - 1, 1) }
function nextMonth(){ showDate.value = new Date(showDate.value.getFullYear(), showDate.value.getMonth() + 1, 1) }

function select(cell){ selectedDate.value = cell.date; emit('select-date', formatLocalDate(cell.date)) }
</script>

<style scoped>
.month-calendar {
  background: #141414;
  color: var(--text, #fff);
  padding: 0.6rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}
.month-header {
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding: 0.25rem 0.5rem;
}
.month-title { font-weight:700 }
.nav { background: transparent; border: none; color: var(--muted, #ccc); font-size:1.1rem; cursor:pointer }
.weekdays { display:grid; grid-template-columns: repeat(7, 1fr); gap:0.25rem; padding:0.5rem 0 }
.weekday { text-align:center; font-size:0.75rem; color:var(--muted,#bbb) }
.days-grid { display:grid; grid-template-columns: repeat(7, 1fr); gap:0.4rem }
.day-cell { min-height: 44px; display:flex; align-items:center; justify-content:center; border-radius:10px; cursor:pointer; background: rgba(255,255,255,0.02); }
.day-cell.muted { opacity:0.35 }
.day-cell.today { box-shadow: 0 0 0 2px rgba(167,139,250,0.12); border: 1px solid rgba(167,139,250,0.18); }
.day-cell.selected { background: linear-gradient(90deg,#a78bfa,#e91e8c); color: #fff }
.day-number { font-weight:600 }
.day-dot { width:10px; height:10px; border-radius:50%; box-shadow: 0 2px 6px rgba(0,0,0,0.25); display:inline-block; background: #9ca3af }
.day-dot.habit { background: #4ade80; /* green for habit */ }
.day-dot.mood { background: #60a5fa; /* blue for mood */ }
.day-dot-group { display:inline-flex; gap:6px; align-items:center; justify-content:center }
.mini-dot { width:6px; height:6px; border-radius:50%; box-shadow: 0 1px 3px rgba(0,0,0,0.25); display:inline-block }
.mini-dot.habit { background: #4ade80 }
.mini-dot.mood { background: #60a5fa }
</style>
 