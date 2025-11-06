<template>
  <section class="mood-tracker">
    <div class="mood-container">
      <!-- Week calendar chips (scrollable) placed at the top -->
      <div
        class="week-calendar"
        ref="calendarRef"
        @mousedown="onCalendarDragStart"
        @mousemove="onCalendarDragMove"
        @mouseup="onCalendarDragEnd"
        @mouseleave="onCalendarDragEnd"
        @touchstart="onCalendarDragStart"
        @touchmove="onCalendarDragMove"
        @touchend="onCalendarDragEnd"
      >
        <div
          v-for="d in weekDays"
          :key="d.date"
          :data-date="d.date"
          :class="['day-chip', { 'is-today': d.isToday, 'is-selected': d.date === selectedDate } ]"
          @click="onWeekChipClick(d.date)"
        >
          <div class="day-label">{{ d.label }}</div>
          <div class="day-number">{{ d.number }}</div>
        </div>
      </div>

      <header class="mood-header">
        <button class="icon-btn" @click="$router.back()">←</button>
        <h1 class="mood-title">Mood</h1>
      </header>

      <p class="mood-desc">How are you feeling today? Tap a mood to record it. You can edit later.</p>

      <div class="mood-grid">
        <div
          v-for="m in moods"
          :key="m.id"
          :class="['mood-card', { selected: isSelected(m.id) }]"
          @click="selectMood(m)"
        >
          <div class="mood-art">{{ m.emoji }}</div>
          <div class="mood-name">{{ m.name }}</div>
        </div>
      </div>

      <div v-if="showSaved" class="saved-toast">Saved</div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

const moods = [
  { id: 1, name: 'Happy', emoji: '😊' },
  { id: 2, name: 'Sad', emoji: '😢' },
  { id: 3, name: 'Angry', emoji: '😠' },
  { id: 4, name: 'Calm', emoji: '😌' },
  { id: 5, name: 'Anxious', emoji: '😰' },
  { id: 6, name: 'Motivated', emoji: '💪' }
]

const moodEntries = ref({})
function formatLocalDate(d) {
  const dt = (d instanceof Date) ? d : new Date(d)
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const selectedDate = ref(formatLocalDate(new Date()))
const showSaved = ref(false)

// Week chips state (copied from Home.vue)
const weekDays = ref([])
const calendarRef = ref(null)
let isDragging = false
let isPointerDown = false
let dragStartX = 0
let scrollStartX = 0

function onCalendarDragStart(e) {
  isPointerDown = true
  isDragging = false
  dragStartX = e.touches ? e.touches[0].clientX : e.clientX
  scrollStartX = calendarRef.value ? calendarRef.value.scrollLeft : 0
}

function onCalendarDragMove(e) {
  if (!isPointerDown) return
  const x = e.touches ? e.touches[0].clientX : e.clientX
  const dx = dragStartX - x
  if (!isDragging && Math.abs(dx) > 6) {
    isDragging = true
  }
  if (isDragging && calendarRef.value) {
    calendarRef.value.scrollLeft = scrollStartX + dx
  }
}

function onCalendarDragEnd() {
  isPointerDown = false
  isDragging = false
}

function updateWeekDays() {
  const today = new Date();
  const days = [];
  const labels = ['SU','MO','TU','WE','TH','FR','SA'];
  const before = 15
  const after = 15
  for (let i = -before; i <= after; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      label: labels[d.getDay()],
      number: d.getDate(),
      date: formatLocalDate(d),
      isToday: i === 0
    });
  }
  weekDays.value = days;
}

function scrollChipToCenter(dateISO) {
  const element = calendarRef.value
  if (!element) return
  const chip = element.querySelector(`.day-chip[data-date="${dateISO}"]`)
  if (!chip) return
  const containerRect = element.getBoundingClientRect()
  const chipRect = chip.getBoundingClientRect()
  const chipCenterRelative = (chipRect.left - containerRect.left) + (chipRect.width / 2)
  let target = chipCenterRelative + element.scrollLeft - (element.clientWidth / 2)
  const max = Math.max(0, element.scrollWidth - element.clientWidth)
  if (target < 0) target = 0
  if (target > max) target = max
  // delay slightly for stable layout on mobile
  setTimeout(() => requestAnimationFrame(() => element.scrollTo({ left: Math.round(target), behavior: 'smooth' })), 50)
}

function onWeekChipClick(dateISO) {
  if (isDragging) { isDragging = false; return }
  selectedDate.value = dateISO
  // center the selected chip
  nextTick(() => scrollChipToCenter(dateISO))
}

const displayDate = computed(() => {
  const d = new Date(selectedDate.value)
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
})

function loadEntries() {
  const raw = localStorage.getItem('moodEntries')
  if (raw) {
    try { moodEntries.value = JSON.parse(raw) } catch (e) { moodEntries.value = {} }
  }
}

function saveEntries() {
  localStorage.setItem('moodEntries', JSON.stringify(moodEntries.value))
}

function isSelected(id) {
  const v = moodEntries.value[selectedDate.value]
  return v && v.moodId === id
}

function selectMood(m) {
  const day = selectedDate.value
  const existing = moodEntries.value[day]
  // toggle: if same mood clicked again, remove it
  if (existing && existing.moodId === m.id) {
    const copy = { ...moodEntries.value }
    delete copy[day]
    moodEntries.value = copy
    saveEntries()
    showSaved.value = true
    setTimeout(() => showSaved.value = false, 700)
    return
  }
  // otherwise set the mood for the day
  moodEntries.value = { ...moodEntries.value, [day]: { moodId: m.id } }
  saveEntries()
  showSaved.value = true
  setTimeout(() => showSaved.value = false, 700)
}

function clearMood() {
  if (!moodEntries.value[selectedDate.value]) return
  const copy = { ...moodEntries.value }
  delete copy[selectedDate.value]
  moodEntries.value = copy
  saveEntries()
}

function openHistory() {
  // placeholder — for now navigate to calendar view which shows dots
  // user can later implement a dedicated history view
  try { $router.push('/calendar') } catch (e) { /* noop */ }
}

onMounted(() => {
  loadEntries()
  updateWeekDays()
  nextTick(() => scrollChipToCenter(selectedDate.value))
})
</script>

<style scoped>
.mood-tracker { min-height: 100dvh; background: #0f0f10; color: #fff; display:flex; align-items:flex-start; justify-content:center; padding:1.5rem; }
.mood-container { width:100%; max-width:520px }
.mood-header { display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem }
.mood-title { flex:1; font-size:1.5rem; margin:0 }
.mood-desc { color:var(--muted); margin-bottom:1rem }
.mood-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:0.75rem; margin-bottom:1rem }
.mood-card { background: rgba(255,255,255,0.03); border-radius:14px; padding:1rem; display:flex; flex-direction:column; align-items:center; gap:0.5rem; cursor:pointer; border:1px solid rgba(255,255,255,0.04) }
.mood-card .mood-art { font-size:2.4rem }
.mood-card .mood-name { font-weight:600 }
.mood-card.selected { background: linear-gradient(135deg,var(--purple),var(--magenta)); color:#fff; border-color:transparent; transform:translateY(-4px) }
.btn { padding:0.6rem 0.9rem; border-radius:12px; border:none; cursor:pointer }
.saved-toast { position:fixed; left:50%; transform:translateX(-50%); bottom:calc(1.2rem + env(safe-area-inset-bottom,0px)); background:rgba(255,255,255,0.08); padding:0.5rem 0.75rem; border-radius:999px; font-weight:600 }

/* Week Calendar (copied from Home) */
.week-calendar { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; overflow-x: auto; padding-bottom: 0.5rem; -webkit-overflow-scrolling: touch; scroll-snap-type: x mandatory; padding-inline: calc(50% - 26px); }
.day-chip { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 0.25rem; padding: 0.75rem 0.85rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; min-width: 52px; transition: all 0.2s ease; cursor: pointer; scroll-snap-align: center; }
.day-chip.is-today { box-shadow: 0 0 0 2px rgba(167,139,250,0.12); border: 1px solid rgba(167,139,250,0.18); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; opacity: 0.95; }
.day-chip.is-selected { background: linear-gradient(135deg, var(--purple), var(--magenta)); border-color: transparent; color: #fff; font-weight: 700; transform: translateY(-2px); }
.day-number { font-size: 1.125rem; font-weight: 700; }

@media (max-width:640px) {
  .mood-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
}
</style>
