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
          <div v-if="cell.hasMarks" class="day-dot" aria-hidden></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  initialDate: { type: String, default: null },
  markedDates: { type: Array, default: () => [] }
})
const emit = defineEmits(['select-date'])

const weekdays = ['SU','MO','TU','WE','TH','FR','SA']

const showDate = ref(props.initialDate ? new Date(props.initialDate) : new Date())
const selectedDate = ref(props.initialDate ? new Date(props.initialDate) : new Date())

function startOfMonth(d){ return new Date(d.getFullYear(), d.getMonth(), 1) }
function endOfMonth(d){ return new Date(d.getFullYear(), d.getMonth() + 1, 0) }

function isSameDay(a,b){ return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate() }

const monthLabel = computed(() => showDate.value.toLocaleString(undefined, { month: 'long', year: 'numeric' }))

const calendarGrid = computed(() => {
  const start = startOfMonth(showDate.value)
  const end = endOfMonth(showDate.value)
  const grid = []

  const startDay = start.getDay() // 0..6
  // days from previous month
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(showDate.value.getFullYear(), showDate.value.getMonth() - 1, (new Date(showDate.value.getFullYear(), showDate.value.getMonth(), 0)).getDate() - i)
    const iso = date.toISOString().slice(0,10)
    grid.push({ date, muted: true, key: date.toISOString(), isToday: isSameDay(date, new Date()), isSelected: isSameDay(date, selectedDate.value), hasMarks: props.markedDates.includes(iso) })
  }

  for (let d = 1; d <= end.getDate(); d++) {
    const date = new Date(showDate.value.getFullYear(), showDate.value.getMonth(), d)
    const iso = date.toISOString().slice(0,10)
    grid.push({ date, muted: false, key: date.toISOString(), isToday: isSameDay(date, new Date()), isSelected: isSameDay(date, selectedDate.value), hasMarks: props.markedDates.includes(iso) })
  }

  // fill to 42 cells
  let nextDay = 1
  while (grid.length < 42) {
    const date = new Date(showDate.value.getFullYear(), showDate.value.getMonth() + 1, nextDay++)
    const iso = date.toISOString().slice(0,10)
    grid.push({ date, muted: true, key: date.toISOString(), isToday: isSameDay(date, new Date()), isSelected: isSameDay(date, selectedDate.value), hasMarks: props.markedDates.includes(iso) })
  }

  return grid
})

function prevMonth(){ showDate.value = new Date(showDate.value.getFullYear(), showDate.value.getMonth() - 1, 1) }
function nextMonth(){ showDate.value = new Date(showDate.value.getFullYear(), showDate.value.getMonth() + 1, 1) }

function select(cell){ selectedDate.value = cell.date; emit('select-date', cell.date.toISOString()) }
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
.day-dot { width:8px; height:8px; border-radius:50%; background: #4ade80; box-shadow: 0 2px 6px rgba(0,0,0,0.25); }
</style>
