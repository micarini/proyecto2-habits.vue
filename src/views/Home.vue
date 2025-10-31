<template>
  <section class="home">
    <div class="home-container">

      <div class="home-date-title">
        <h2 class="date-title">{{ todayString }}</h2>
        <h3 class="day-title">{{ dayString }}</h3>
      </div>

      <!-- Week calendar chips (scrollable) -->
      <div
        class="week-calendar"
        ref="calendarRef"
        @mousedown="onCalendarDragStart"
        @mousemove="onCalendarDragMove"
        @mouseup="onCalendarDragEnd"
        @mouseleave="onCalendarDragEnd"
        @touchstart.prevent="onCalendarDragStart"
        @touchmove.prevent="onCalendarDragMove"
        @touchend.prevent="onCalendarDragEnd"
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

      <div class="motivation-card motivation-full">
        <div class="motivation-avatar-face">
          <div class="avatar-bg">
            <img v-if="userAvatar" :src="getAvatarSrc(userAvatar)" alt="Avatar" />
          </div>
        </div>
        <div class="motivation-message-side">
          <h2 class="motivation-title">{{ motivationMessage }}</h2>
        </div>
      </div>

      <h2 class="habits-title">Habits</h2>

      <!-- Habits List -->
      <div class="habits-list">
        <div 
          v-for="habit in habits" 
          :key="habit.id"
          class="habit-card"
          :class="{ 'is-done': doneMap[habit.id] }"
          @click="openHabitOptions(habit)"
        >
          <div class="habit-icon">
            <span>{{ habit.icon }}</span>
          </div>
          <div class="habit-info">
            <h3 class="habit-title">{{ habit.title }}</h3>
          </div>
          <div class="habit-badge" @click.stop="toggleHabitDone(habit)">
            <span v-if="!doneMap[habit.id]" class="badge-empty"></span>
            <span v-else class="badge-check">✓</span>
          </div>
        </div>
      </div>

      <!-- Habit Options Modal (Inline Edit / Delete) -->
      <div v-if="showHabitOptions" class="options-overlay" @click.self="closeHabitOptions">
        <div class="options-modal">
          <h3 class="options-title">{{ isCreating ? 'New Habit' : 'Edit Habit' }}</h3>

          <div class="emoji-picker-row" style="justify-content:center;">
            <span class="emoji-preview" @click.stop="showEmojiPicker = !showEmojiPicker">{{ editingCopy.icon || '😀' }}</span>
            <transition name="fade">
              <div v-if="showEmojiPicker" class="emoji-picker-modal">
                  <EmojiPicker @emoji-selected="onEmojiSelect" />                
              </div>
            </transition>
          </div>

          <div class="modal-field">
            <label class="modal-label">Title</label>
            <input v-model="editingCopy.title" class="input" placeholder="Habit name" />
          </div>


          <div class="options-actions">
            <button v-if="!isCreating" class="btn btn-danger outline-left" @click="showDeleteConfirm = true">Delete</button>
            <button class="btn btn-secondary" :disabled="!editingCopy.title" @click="saveHabitEdits">Save</button>
          </div>

          <div v-if="showDeleteConfirm" class="delete-confirm">
            <p>Are you sure you want to delete "{{ editingCopy.title }}"?</p>
            <div style="display:flex;gap:0.5rem;justify-content:center;margin-top:0.5rem;">
              <button class="btn btn-danger" @click="confirmDelete">Yes, delete</button>
            </div>
          </div>
        </div>
      </div>

      <div class="add-habit-row">
        <button class="add-habit-pill" @click="openAddHabit">+ New habit</button>
        <div class="add-actions">
          <button class="mini-action" title="Calendar view" @click="goToCalendar">📅</button>
          <button class="mini-action" title="Statistics" @click="goToStats">📊</button>
        </div>
      </div>

      <!-- Calendar view is now a separate page (navigates to /calendar) -->

  </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import EmojiPicker from '../components/EmojiPicker.vue'
import motivations from '../assets/motivations.json'

const router = useRouter()
const userName = ref('Friend')
const userAvatar = ref(null)
const motivationMessage = ref('')

// get avatar source
function getAvatarSrc(avatarId) {
  const avatarMap = {
    '1': '/avatar01-cropped.svg',
    '2': '/avatar2-cropped.svg',
    '3': '/avatar3-cropped.svg',
    '4': '/avatar4-cropped.svg',
    '5': '/avatar5-cropped.svg',
    '6': '/avatar6-cropped.svg'
  };
  return avatarMap[avatarId] || '/avatar01-cropped.svg';
}

// Semana dinámica y scroll automático a hoy
const weekDays = ref([])
const calendarRef = ref(null)
let isDragging = false
let dragStartX = 0
let scrollStartX = 0

function onCalendarDragStart(e) {
  isDragging = true
  dragStartX = e.touches ? e.touches[0].clientX : e.clientX
  scrollStartX = calendarRef.value.scrollLeft
}

function onCalendarDragMove(e) {
  if (!isDragging) return
  const x = e.touches ? e.touches[0].clientX : e.clientX
  const dx = dragStartX - x
  calendarRef.value.scrollLeft = scrollStartX + dx
}

function onCalendarDragEnd() {
  isDragging = false
}
function updateWeekDays() {
  const today = new Date();
  const days = [];
  const labels = ['SU','MO','TU','WE','TH','FR','SA'];
  // Build a range with days before and after today so user sees context around today
  const before = 2
  const after = 12
  for (let i = -before; i <= after; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      label: labels[d.getDay()],
      number: d.getDate(),
      date: d.toISOString().slice(0,10),
      isToday: i === 0
    });
  }
  weekDays.value = days;
}

async function scrollTodayToStart() {
  // wait for DOM
  await nextTick()
  const element = calendarRef.value
  if (!element) return
  const chips = element.querySelectorAll('.day-chip')
  for (const chip of chips) {
    if (chip.classList.contains('is-today')) {
      // scroll so the today chip has two previous chips visible
      const chipWidth = chip.clientWidth || 56
      const target = Math.max(0, chip.offsetLeft - (2 * chipWidth))
      element.scrollTo({ left: target, behavior: 'smooth' })
      break
    }
  }
}

onMounted(() => {
  const savedName = localStorage.getItem('userName')
  if (savedName) {
    userName.value = savedName
  } else {
    router.push('/onboarding')
  }
  updateWeekDays()
  // frase aleatoria
  if (motivations && motivations.length) {
    motivationMessage.value = motivations[Math.floor(Math.random() * motivations.length)]
  } else {
    motivationMessage.value = 'Start your day with water. One glass will energize you'
  }
  
  // Load recommended habits if first time
  loadRecommendedHabits()
  // load persisted completions
  const savedCompletions = localStorage.getItem('habitCompletions')
  if (savedCompletions) {
    try { completions.value = JSON.parse(savedCompletions) } catch (e) { completions.value = {} }
  }
  // sync initial done map for today's selected date
  syncDoneMapForSelected()
  // after the calendar chips render, scroll so today's chip appears first
  scrollTodayToStart()
})

const habits = ref([])
const doneMap = ref({})
// per-day completions persisted as { 'YYYY-MM-DD': [habitId, ...] }
const completions = ref({})

// Monthly calendar state
const currentMonth = ref(new Date())
const monthCells = ref([])
const selectedDate = ref(new Date().toISOString().slice(0,10))
const weekDayLabels = ['Su','Mo','Tu','We','Th','Fr','Sa']

const monthTitle = computed(() => {
  const d = new Date(currentMonth.value)
  return d.toLocaleString(undefined, { month: 'long', year: 'numeric' })
})

function buildMonthCells(date) {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
  const startDay = firstOfMonth.getDay() // 0..6 (Sunday..Saturday)
  // grid shows 6 weeks x 7 days
  const cells = []
  // start from the Sunday before/at the first day
  const start = new Date(firstOfMonth)
  start.setDate(firstOfMonth.getDate() - startDay)

  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const iso = d.toISOString().slice(0,10)
    cells.push({
      date: iso,
      number: d.getDate(),
      inMonth: d.getMonth() === date.getMonth(),
      isToday: d.toDateString() === new Date().toDateString(),
      isSelected: iso === selectedDate.value
    })
  }
  monthCells.value = cells
}

function prevMonth() {
  const d = new Date(currentMonth.value)
  d.setMonth(d.getMonth() - 1)
  currentMonth.value = d
  buildMonthCells(d)
}

function nextMonth() {
  const d = new Date(currentMonth.value)
  d.setMonth(d.getMonth() + 1)
  currentMonth.value = d
  buildMonthCells(d)
}

function selectDate(dateISO) {
  selectedDate.value = dateISO
  // update selected flag in cells
  monthCells.value = monthCells.value.map(c => ({ ...c, isSelected: c.date === dateISO }))
  // also update weekDays focus if desired (not changing behavior now)
}

function onCalendarDateSelected(dateISO) {
  // receive date from Calendar component (ISO string)
  selectedDate.value = dateISO
  // if you want, sync other UI elements here
}

function onWeekChipClick(dateISO) {
  // ignore click if user was dragging the week strip
  if (isDragging) {
    // clear dragging flag and ignore this click
    isDragging = false
    return
  }
  // select the date locally
  selectedDate.value = dateISO
  // sync the transient done map from persisted completions for this date
  syncDoneMapForSelected()
}

function syncDoneMapForSelected() {
  const day = selectedDate.value || new Date().toISOString().slice(0,10)
  const ids = Array.isArray(completions.value[day]) ? completions.value[day] : []
  const map = {}
  for (const id of ids) map[id] = true
  doneMap.value = { ...doneMap.value, ...map }
}

// Habit options modal state
const showHabitOptions = ref(false)
const habitForOptions = ref(null)
// are we creating a new habit in the options modal?
const isCreating = ref(false)
// emoji picker flag (used inside the unified modal)
const showEmojiPicker = ref(false)

function closeHabitOptions() {
  habitForOptions.value = null
  showHabitOptions.value = false
  // reset create/edit flags so modal state is clean for next open
  isCreating.value = false
  showEmojiPicker.value = false
  showDeleteConfirm.value = false
  // clear editing copy to avoid stale data
  editingCopy.value = { title: '', icon: '' }
}

// Editable copy for inline edits and delete confirmation
const editingCopy = ref({ title: '', icon: '' })
const showDeleteConfirm = ref(false)

// When opening options, create a shallow copy we can edit/cancel
function openHabitOptions(habit) {
  habitForOptions.value = habit
  editingCopy.value = { ...habit }
  showDeleteConfirm.value = false
  showHabitOptions.value = true
}

function openAddHabit() {
  // open the same options modal but in create mode
  isCreating.value = true
  habitForOptions.value = null
  editingCopy.value = { id: null, icon: '', title: '', count: '1' }
  showDeleteConfirm.value = false
  showEmojiPicker.value = false
  showHabitOptions.value = true
}

function saveHabitEdits() {
  // unified save handler: if creating, push new habit; else update existing
  if (isCreating.value) {
    const newH = {
      id: Date.now(),
      icon: editingCopy.value.icon || '😀',
      title: editingCopy.value.title || 'New habit',
      count: editingCopy.value.count || '1',
    }
    habits.value.push(newH)
  } else {
    if (!habitForOptions.value) return
    const idx = habits.value.findIndex(h => h.id === habitForOptions.value.id)
    if (idx === -1) return
    // apply edits
    habits.value[idx] = { ...habits.value[idx], ...editingCopy.value }
  }
  localStorage.setItem('userHabits', JSON.stringify(habits.value))
  // close and reset modal state (closeHabitOptions resets isCreating)
  closeHabitOptions()
}

function confirmDelete() {
  if (!habitForOptions.value) return
  habits.value = habits.value.filter(h => h.id !== habitForOptions.value.id)
  localStorage.setItem('userHabits', JSON.stringify(habits.value))
  closeHabitOptions()
}

function onEmojiSelect(emoji) {
  // attach selected emoji to the editing copy used by unified modal
  editingCopy.value.icon = emoji.native || emoji.emoji || ''
  showEmojiPicker.value = false
}

function loadRecommendedHabits() {
  // Check if habits are already saved
  const savedHabits = localStorage.getItem('userHabits')
  if (savedHabits) {
    habits.value = JSON.parse(savedHabits)
  } else {
    // Load recommended habits based on goal
    const recommendedHabits = localStorage.getItem('recommendedHabits')
    if (recommendedHabits) {
      const parsed = JSON.parse(recommendedHabits)
      habits.value = parsed.map((h, idx) => ({
        id: Date.now() + idx,
        icon: h.icon,
        title: h.duration ? `${h.title} for ${h.duration}` : h.title,
        count: '1'
      }))
      // Save to localStorage
      localStorage.setItem('userHabits', JSON.stringify(habits.value))
    }
  }
}

function toggleHabitDone(habit) {
  // Toggle a lightweight in-memory map to control the opacity only.
  const id = habit.id
  const current = !!doneMap.value[id]
  // trigger reactivity
  doneMap.value = { ...doneMap.value, [id]: !current }

  // Persist per-day completion state for the currently selected date
  const day = selectedDate.value || new Date().toISOString().slice(0,10)
  const dayList = Array.isArray(completions.value[day]) ? [...completions.value[day]] : []
  if (!current) {
    // marking as done -> add id if not present
    if (!dayList.includes(id)) dayList.push(id)
  } else {
    // un-marking -> remove id
    const idx = dayList.indexOf(id)
    if (idx !== -1) dayList.splice(idx, 1)
  }
  // save back
  completions.value = { ...completions.value, [day]: dayList }
  try { localStorage.setItem('habitCompletions', JSON.stringify(completions.value)) } catch (e) { /* noop */ }
}

function closeHabitModal() {
  // kept for compatibility if used elsewhere
  showEmojiPicker.value = false;
}

function goToCalendar() {
  // navigate to the calendar view
  try { router.push('/calendar') } catch (e) { /* noop */ }
}

function goToStats() {
  try { router.push('/stats') } catch (e) { /* noop */ }
}
</script>

<style scoped>
.motivation-message-center {
  position: relative;
  z-index: 2;
  text-align: center;
  width: 100%;
}

.motivation-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: #222;
  line-height: 1.4;
}
.habits-title {
  margin-top: 2.5rem;
}
/* Home Layout */
.home {
  min-height: 100dvh;
  background: #101010;
  position: relative;
  overflow-y: auto;
  padding: clamp(1.5rem, 5vw, 3rem);
}

.home-container {
  max-width: 480px;
  margin: 0 auto;
  width: 100%;
  display: block;
}

/* Ensure simple vertical spacing: header, calendar, motivation, habits */
.home-date-title { margin-bottom: 0.25rem; }
.week-calendar { margin-bottom: 1rem; }
.motivation-card { margin-bottom: 1.25rem; }
.habits-title { margin-top: 1rem; }

.icon-btn {
  background: none;
  border: none;
  color: var(--muted, #aaa);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.2em 0.4em;
  border-radius: 6px;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: rgba(255,255,255,0.08);
  color: var(--magenta, #e91e8c);
}
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: var(--background, #18181b);
  border-radius: 18px;
  padding: 2rem 1.5rem 1.5rem;
  min-width: 320px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0,0,0,0.35);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.modal-title {
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--text);
}
.emoji-picker-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.emoji-preview {
  font-size: 2.2rem;
  cursor: pointer;
  border: 2px solid var(--muted, #444);
  border-radius: 50%;
  padding: 0.25em 0.4em;
  background: rgba(255,255,255,0.07);
  transition: border 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
}
.emoji-preview:hover {
  border-color: var(--purple, #a78bfa);
}
.emoji-picker-modal {
  position: absolute;
  z-index: 1100;
  top: 3.5rem;
  left: 0;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
}
.input {
  width: 100%;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--muted, #444);
  background: rgba(255,255,255,0.04);
  color: var(--text);
  font-size: 1rem;
  outline: none;
  transition: border 0.2s;
}
.input:focus {
  border-color: var(--purple, #a78bfa);
}
.modal-actions {
  display: flex;
  gap: 0.75rem;
}
.add-btn {
  flex: 1;
  padding: 0.75rem;
  background: linear-gradient(135deg, var(--purple), var(--magenta));
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.add-btn:hover {
  background: linear-gradient(135deg, var(--magenta), var(--purple));
}
.cancel-btn {
  flex: 1;
  padding: 0.75rem;
  background: none;
  color: var(--muted, #aaa);
  border: 1px solid var(--muted, #444);
  border-radius: 12px;
  font-size: 1rem;
  cursor: pointer;
  transition: border 0.2s;
}
.cancel-btn:hover {
  border-color: var(--magenta, #f472b6);
  color: var(--magenta, #f472b6);
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.home-header {
  margin-bottom: 1.5rem;
}

.home-header {
  margin-bottom: 1.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 60px;
  height: 60px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  padding: 0.5rem;
}

.greeting {
  font-size: clamp(1.75rem, 5vw, 2.25rem);
  font-weight: 700;
  margin: 0;
  color: var(--text);
}

/* Week Calendar */
.week-calendar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.day-chip {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 0.85rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  min-width: 52px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.day-chip.is-today {
  background: linear-gradient(135deg, var(--purple), var(--magenta));
  border-color: transparent;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.8;
}

.day-chip.is-selected {
  box-shadow: 0 6px 18px rgba(167,139,250,0.12);
  border: 2px solid rgba(233,30,140,0.18);
  transform: translateY(-2px);
}

.day-number {
  font-size: 1.125rem;
  font-weight: 700;
} 

/* Motivation Card */
.motivation-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  border-radius: 24px;
  padding: 1.5rem 1.25rem;
  margin-bottom: 2rem;
  color: #fff;
}

.motivation-with-avatar {
  min-height: 120px;
}

.motivation-avatar {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.12);
  border-radius: 50%;
  box-shadow: 0 2px 12px rgba(168,85,247,0.10);
}
.motivation-avatar img {
  width: 70px;
  height: 70px;
  object-fit: contain;
}
.motivation-message {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.motivation-title {
  font-size: 1.15rem;
  font-weight: 600;
  margin: 0;
  color: #fff;
  line-height: 1.4;
}

/* Habits List */
.habits-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.habit-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #222222;
  border-radius: 18px;
  padding: 1.15rem 1.25rem;
  box-shadow: 0 2px 12px rgba(168,85,247,0.08);
  transition: box-shadow 0.2s, transform 0.2s;
  border: none;
}

.habit-card:hover {
  box-shadow: 0 4px 24px rgba(168,85,247,0.15);
  transform: translateY(-2px);
}

.habit-card.is-done {
  opacity: 0.6;
}

.habit-icon {
  font-size: 1.75rem;
  flex-shrink: 0;
}

.habit-info {
  flex: 1;
  min-width: 0;
}

.habit-title {
  margin: 0 0 0.25rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
}

.habit-status {
  margin: 0;
  font-size: 0.875rem;
  color: var(--muted);
}

.habit-badge {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  min-width: 28px;
  height: 28px;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.875rem;
  border: 2px solid rgba(255,255,255,0.18);
}

.badge-check {
  color: #4ade80;
}

/* Options modal styles */
.options-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.5);
  z-index: 1200;
}
.options-modal {
  background: var(--background, #18181b);
  padding: 1rem 1.25rem;
  border-radius: 12px;
  width: 92%;
  max-width: 360px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}
.options-title { margin: 0 0 0.25rem; color: var(--text); font-size: 1.1rem }
.options-body { margin: 0 0 1rem; color: var(--muted) }
.options-actions { display:flex; gap:0.5rem; justify-content:center }
.outline-left { background: transparent; border: 1px solid rgba(255,255,255,0.08); color: var(--muted); padding:0.65rem 0.9rem; border-radius:12px }
.btn-primary { background: linear-gradient(135deg, var(--purple), var(--magenta)); color: #fff; padding:0.65rem 0.9rem; border-radius:12px }
.delete-confirm { margin-top: 0.75rem; color: var(--muted); }
.modal-field { margin-bottom: 0.5rem; text-align: left }
.modal-label { display:block; margin-bottom: 0.25rem; color: var(--muted); font-size:0.85rem }
.btn-danger { background: linear-gradient(135deg,#ff5f6d,#ff7a5a); color: #fff; border:none; padding:0.5rem 0.75rem; border-radius:8px; font-weight:600 }
.btn-secondary { background: transparent; border:1px solid rgba(255,255,255,0.08); color:var(--muted); padding:0.5rem 0.75rem; border-radius:8px }

/* Add Habit Button */
.add-habit-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, var(--purple), var(--magenta));
  color: white;
  border: none;
  border-radius: 16px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-habit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(124, 34, 197, 0.3);
}

.add-habit-btn:active {
  transform: translateY(0);
}

.add-habit-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-top: 0.75rem;
}
.add-habit-pill {
  flex: 1 1 auto;
  padding: 0.9rem 1.1rem;
  background: linear-gradient(135deg, var(--purple), var(--magenta));
  color: #fff;
  font-weight: 700;
  border: none;
  border-radius: 28px;
  box-shadow: 0 8px 24px rgba(124, 34, 197, 0.18);
  cursor: pointer;
}
.add-actions {
  display: flex;
  gap: 0.5rem;
}
.mini-action {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  display: grid;
  place-items: center;
  cursor: pointer;
  font-size: 1.05rem;
}
.mini-action:hover { background: rgba(255,255,255,0.06); }

/* Monthly calendar styles */
.month-calendar {
  background: rgba(255,255,255,0.02);
  border-radius: 14px;
  padding: 0.75rem;
  margin-bottom: 1rem;
}
.month-header {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:0.5rem;
  margin-bottom:0.5rem;
}
.month-title { font-weight:700; color:var(--text); }
.month-nav { background:transparent; border:none; color:var(--muted); font-size:1.25rem; cursor:pointer }
.month-weekdays { display:grid; grid-template-columns:repeat(7,1fr); gap:0.25rem; margin-bottom:0.25rem }
.wd { text-align:center; font-size:0.75rem; color:var(--muted) }
.month-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:0.35rem }
.day-cell { min-height:44px; display:flex; align-items:flex-start; justify-content:flex-end; padding:0.45rem; border-radius:8px; cursor:pointer }
.day-cell.other-month { opacity:0.35 }
.day-cell.today { box-shadow: inset 0 0 0 2px rgba(167,139,250,0.14); border-radius:8px }
.day-cell.selected { background: linear-gradient(135deg,var(--purple),var(--magenta)); color:#fff }
.day-num { font-weight:600 }
</style>
