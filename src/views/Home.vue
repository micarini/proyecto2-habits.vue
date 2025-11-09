<template>
  <section class="home">
    <div class="home-container">

      <div class="home-date-title">
        <h2 class="date-title">{{ todayString }}</h2>
        <h3 class="day-title">{{ dayString }}</h3>
      </div>

      <WeekStrip v-model="selectedDate" @select="onWeekChipClick" />

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
        <HabitCard
          v-for="habit in habits"
          :key="habit.id"
          :habit="habit"
          :done="!!doneMap[habit.id]"
          @open="openHabitOptions"
          @toggle="toggleHabitDone"
        />
      </div>

      <!-- Habit options modal (add / edit) -->
      <HabitOptionsModal
        :visible="showHabitOptions"
        :initialHabit="habitForOptions"
        :creating="isCreating"
        @save="handleModalSave"
        @delete="handleModalDelete"
        @close="handleModalClose"
      />
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import motivations from '../assets/motivations.json'
import avatars from '../assets/avatars.json'
import WeekStrip from '../components/WeekStrip.vue'
import HabitCard from '../components/HabitCard.vue'
import { formatLocalDate } from '../utils/date.js'
import HabitOptionsModal from '../components/HabitOptionsModal.vue'

const router = useRouter()
const userName = ref('Friend')
const userAvatar = ref(null)
const motivationMessage = ref('')

// get avatar source
function getAvatarSrc(avatarId) {
  // avatars.json maps id -> path means we can use the id to get the correct image path
  return (avatars && avatars[avatarId]) ? avatars[avatarId] : avatars['1']
}

onMounted(() => {
  const savedName = localStorage.getItem('userName')
  if (savedName) {
    userName.value = savedName
  } else {
    router.push('/onboarding')
  }
  // initialize week/month structures
  buildMonthCells(currentMonth.value)
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
  // listen for global floating bar add event so the modal opens when user taps the global +
  window.addEventListener('floating-open-add', onFloatingOpenAdd)
})

onBeforeUnmount(() => {
  window.removeEventListener('floating-open-add', onFloatingOpenAdd)
})

function onFloatingOpenAdd() {
  openAddHabit()
}

const habits = ref([])
const doneMap = ref({})
const completions = ref({})

// Monthly calendar state
const currentMonth = ref(new Date())
const monthCells = ref([])
const selectedDate = ref(formatLocalDate(new Date()))
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
    const iso = formatLocalDate(d)
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
}

function onCalendarDateSelected(dateISO) {
  // receive date from Calendar component (ISO string)
  selectedDate.value = dateISO
  // sync transient done map for the newly selected date
  syncDoneMapForSelected()
}

function onWeekChipClick(dateISO) {
  // select the date locally and sync completions
  selectedDate.value = dateISO
  syncDoneMapForSelected()
}

function syncDoneMapForSelected() {
  const day = selectedDate.value || formatLocalDate(new Date())
  const ids = Array.isArray(completions.value[day]) ? completions.value[day] : []
  const map = {}
  for (const id of ids) map[id] = true
  doneMap.value = map
}

// Habit options modal state
const showHabitOptions = ref(false)
const habitForOptions = ref(null)
// are we creating a new habit in the options modal?
const isCreating = ref(false)

// When opening options, set state for modal
function openHabitOptions(habit) {
  habitForOptions.value = habit
  showHabitOptions.value = true
  isCreating.value = false
}

function openAddHabit() {
  isCreating.value = true
  habitForOptions.value = null
  showHabitOptions.value = true
}

// Handlers for modal emits
function handleModalSave(payload) {
  if (isCreating.value) {
    const newH = {
      id: payload.id || Date.now(),
      icon: payload.icon || '😶‍🌫️',
      title: payload.title || 'New habit',
      count: payload.count || '1'
    }
    habits.value.push(newH)
  } else {
    if (!payload || !payload.id) return
    const idx = habits.value.findIndex(h => h.id === payload.id)
    if (idx === -1) return
    habits.value[idx] = { ...habits.value[idx], ...payload }
  }
  localStorage.setItem('userHabits', JSON.stringify(habits.value))
  handleModalClose()
}

function handleModalDelete(id) {
  if (id == null) return
  habits.value = habits.value.filter(h => h.id !== id)
  localStorage.setItem('userHabits', JSON.stringify(habits.value))
  handleModalClose()
}

function handleModalClose() {
  habitForOptions.value = null
  showHabitOptions.value = false
  isCreating.value = false
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
  const day = selectedDate.value || formatLocalDate(new Date())
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

async function goToCalendar() {
  // navigate to the calendar view using async/await and log failures
  try {
    await router.push('/calendar')
  } catch (err) {
    console.warn('Navigation to /calendar failed', err)
  }
}

async function goToMoodTracker() {
  try {
    await router.push('/mood')
  } catch (err) {
    console.warn('Navigation to /mood failed', err)
  }
}
</script>

<style scoped>

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
}

.home-date-title { margin-bottom: 0.25rem; }

.motivation-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  border-radius: 24px;
  padding: 1.5rem 1.25rem;
  margin-bottom: 2rem;
  color: #fff;
}

.avatar-bg img { width: 70px; height: 70px; object-fit: contain; }
.motivation-title { font-size: 1.15rem; font-weight: 600; margin: 0; color: #fff; line-height: 1.4; }

.habits-title { margin-top: 1rem; }
.habits-list { display:flex; flex-direction:column; gap:1rem; margin-bottom:4rem }

</style>