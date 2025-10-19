<template>
  <section class="home">
    <div class="home-container">
      <!-- Greeting -->
      <header class="home-header">
        <h1 class="greeting">Hey, {{ userName }}!</h1>
      </header>

      <!-- calendario -->
      <div class="week-calendar" ref="calendarRef"
        @mousedown="onCalendarDragStart"
        @touchstart="onCalendarDragStart"
        @mousemove="onCalendarDragMove"
        @touchmove="onCalendarDragMove"
        @mouseup="onCalendarDragEnd"
        @mouseleave="onCalendarDragEnd"
        @touchend="onCalendarDragEnd"
      >
        <div 
          v-for="day in weekDays" 
          :key="day.date"
          class="day-chip"
          :class="{ 'is-today': day.isToday }"
        >
          <span class="day-label">{{ day.label }}</span>
          <span class="day-number">{{ day.number }}</span>
        </div>
      </div>

      <!-- mensaje de motivación /*a futuro van a haber varios y van a ir cambiando */-->
      <div class="motivation-card">
        <p class="motivation-text">{{ motivationMessage }}</p>
      </div>

      <!-- lista de habitos -->
      <div class="habits-list">
        <div 
          v-for="habit in habits" 
          :key="habit.id"
          class="habit-card"
          :class="{ 'is-done': habit.done }"
        >
          <div class="habit-icon">
            <span>{{ habit.icon }}</span>
          </div>
          <div class="habit-info">
            <h3 class="habit-title">{{ habit.title }}</h3>
            <p class="habit-status" v-if="habit.done">✓ Done</p>
            <p class="habit-status" v-else>{{ habit.duration }}</p>
          </div>
          <div class="habit-badge" @click="toggleHabitDone(habit)">
            <span v-if="!habit.done" class="badge-time">{{ habit.count }}</span>
            <span v-else class="badge-check">✓</span>
          </div>
          <div class="habit-actions">
            <button class="icon-btn" title="Edit" @click.stop="editHabit(habit)">✏️</button>
            <button class="icon-btn" title="Delete" @click.stop="deleteHabit(habit)">🗑️</button>
          </div>
        </div>
      </div>

  <button class="add-habit-btn" @click="openAddHabit">+ New habit</button>

      <!-- Habit Modal -->
      <div v-if="showAddHabit" class="modal-overlay" @click.self="closeHabitModal">
        <div class="modal-content">
          <h2 class="modal-title">New Habit</h2>
          <form @submit.prevent="addHabit">
            <div class="emoji-picker-row">
              <span class="emoji-preview" @click="showEmojiPicker = !showEmojiPicker">{{ newHabit.icon || '😀' }}</span>
              <transition name="fade">
                <div v-if="showEmojiPicker" class="emoji-picker-modal">
                    <EmojiPicker @emoji-selected="onEmojiSelect" />                
                </div>
              </transition>
            </div>
            <input v-model="newHabit.title" class="input" placeholder="Habit name" required />
            <input v-model="newHabit.duration" class="input" placeholder="Duration (e.g. 15 min)" />
            <div class="modal-actions">
              <button class="add-btn" type="submit">Add</button>
              <button class="cancel-btn" type="button" @click="closeHabitModal">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import EmojiPicker from '../components/EmojiPicker.vue'
import motivations from '../assets/motivations.json'

const router = useRouter()
const userName = ref('Friend')
const motivationMessage = ref('')

// Modal y picker
const showAddHabit = ref(false)
const showEmojiPicker = ref(false)
const newHabit = ref({ icon: '', title: '', duration: '', count: '1', done: false })
const editingHabitId = ref(null)

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
  // Mostrar los últimos 14 días (incluyendo hoy)
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push({
      label: labels[d.getDay()],
      number: d.getDate(),
      date: d.toISOString().slice(0,10),
      isToday: d.toDateString() === today.toDateString()
    });
  }
  weekDays.value = days;
}

onMounted(() => {
  const savedName = localStorage.getItem('userName')
  if (savedName) {
    userName.value = savedName
  } else {
    router.push('/onboarding')
  }
  updateWeekDays()
  // Mostrar frase aleatoria
  if (motivations && motivations.length) {
    motivationMessage.value = motivations[Math.floor(Math.random() * motivations.length)]
  } else {
    motivationMessage.value = 'Start your day with water. One glass will energize you'
  }
})

const habits = ref([
  { id: 1, icon: '🚶', title: 'Go for a walk', duration: '25 min', count: '1', done: false },
  { id: 2, icon: '📖', title: 'Read fiction', duration: '15 min', count: '1', done: false },
  { id: 3, icon: '🧋', title: 'Drink liquid', duration: '1 time', count: '1', done: true },
])


function openAddHabit() {
  editingHabitId.value = null
  Object.assign(newHabit.value, { icon: '', title: '', duration: '', count: '1', done: false })
  showAddHabit.value = true
  showEmojiPicker.value = false
}

function onEmojiSelect(emoji) {
  newHabit.value.icon = emoji.native || emoji.emoji || ''
  showEmojiPicker.value = false
}

function addHabit() {
  if (!newHabit.value.title) return
  if (editingHabitId.value) {
    // Edit existing
    const idx = habits.value.findIndex(h => h.id === editingHabitId.value)
    if (idx !== -1) {
      habits.value[idx] = { ...habits.value[idx], ...newHabit.value }
    }
  } else {
    // Add new
    habits.value.push({
      id: Date.now(),
      icon: newHabit.value.icon || '😀',
      title: newHabit.value.title,
      duration: newHabit.value.duration,
      count: '1',
      done: false
    })
  }
  newHabit.value = { icon: '', title: '', duration: '', count: '1', done: false }
  showAddHabit.value = false
  showEmojiPicker.value = false
  editingHabitId.value = null
}

function editHabit(habit) {
  Object.assign(newHabit.value, habit)
  editingHabitId.value = habit.id
  showAddHabit.value = true
  showEmojiPicker.value = false
}

function deleteHabit(habit) {
  if (confirm('Delete this habit?')) {
    habits.value = habits.value.filter(h => h.id !== habit.id)
  }
}

function toggleHabitDone(habit) {
  habit.done = !habit.done
}

function closeHabitModal() {
  showAddHabit.value = false;
  showEmojiPicker.value = false;
  editingHabitId.value = null;
}
</script>

<style scoped>
.habit-actions {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-left: 0.5rem;
}
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
.home-container {
  max-width: 480px;
  margin: 0 auto;
  width: 100%;
}

.home-header {
  margin-bottom: 1.5rem;
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
}

.day-chip.is-today {
  background: linear-gradient(135deg, var(--purple), var(--magenta));
  border-color: transparent;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.8;
}

.day-number {
  font-size: 1.125rem;
  font-weight: 700;
}

/* Motivation Card */
.motivation-card {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.motivation-text {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  font-style: italic;
  color: var(--text);
  opacity: 0.9;
}

/* Habits List */
.habits-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.habit-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  padding: 1rem 1.25rem;
  transition: all 0.2s ease;
}

.habit-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
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
  min-width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  font-weight: 600;
  font-size: 0.875rem;
}

.badge-check {
  color: #4ade80;
}

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
</style>
