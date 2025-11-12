<template>
  <section class="dashboard">
    <div class="left-pane">
      <PageHeader title="Habits" :showBack="false" />
      <WeekStrip v-model="selectedDate" @select="onWeekChipClick" />

      <div class="habits-list">
        <HabitCard
          v-for="habit in habits"
          :key="habit.id"
          :habit="habit"
          :done="!!doneMap[habit.id]"
          @open="openHabitOptions"
          @toggle="toggleHabitDonePersist"
        />
      </div>
    </div>

    <div class="right-pane">
      <PageHeader title="Calendar" :showBack="false" />
      <Calendar
        :initialDate="selectedDate"
        :habitDates="Object.keys(completions.value || {})"
        :moodDates="Object.keys(moodEntries.value || {})"
        @select-date="onDateSelected"
      />

      <div class="mood-grid">
        <div v-for="m in moods" :key="m.id" class="mood-card" :class="{ 'mood-selected': selectedMoodId === m.id }" @click="saveMoodForSelected(m)">
          <div class="mood-art">{{ m.emoji }}</div>
          <div class="mood-name">{{ m.name }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { formatLocalDate } from '../utils/date.js'
import { useMoods } from '../composables/useMoods.js'
import WeekStrip from '../components/WeekStrip.vue'
import HabitCard from '../components/HabitCard.vue'
import Calendar from '../components/Calendar.vue'
import PageHeader from '../components/PageHeader.vue'
import { useHabits } from '../composables/useHabits.js'
import { useCompletions } from '../composables/useCompletions.js'

const selectedDate = ref(formatLocalDate(new Date()))
const { habits, loadHabits } = useHabits()
const { completions, loadCompletions, toggleCompletionForDay } = useCompletions()
const doneMap = ref({})
const { moodEntries, loadMoods, setMoodForDay, deleteMoodForDay, getMoodForDay, moods } = useMoods()

onMounted(() => {
  loadHabits()
  loadCompletions()
  loadMoods()
  syncDoneMapForSelected()
})

const selectedMoodId = computed(() => {
  const day = selectedDate.value || formatLocalDate(new Date())
  const m = getMoodForDay(day)
  return m ? m.moodId || m.id || null : null
})

function saveMoodForSelected(mood) {
  const day = selectedDate.value || formatLocalDate(new Date())
  setMoodForDay(day, { moodId: mood.id, emoji: mood.emoji, name: mood.name })
}

function onWeekChipClick(dateISO) {
  selectedDate.value = dateISO
  syncDoneMapForSelected()
}

function onDateSelected(iso) {
  selectedDate.value = iso
  syncDoneMapForSelected()
}

function syncDoneMapForSelected() {
  const day = selectedDate.value || formatLocalDate(new Date())
  const ids = Array.isArray(completions.value[day]) ? completions.value[day] : []
  const map = {}
  for (const id of ids) map[id] = true
  doneMap.value = map
}

function openHabitOptions(habit) {
  // open modal - delegate to Home if needed
}

function toggleHabitDone(habit) {
  const id = habit.id
  const current = !!doneMap.value[id]
  doneMap.value = { ...doneMap.value, [id]: !current }
}

function toggleHabitDonePersist(habit) {
  const id = habit.id
  const day = selectedDate.value || formatLocalDate(new Date())
  // persist via composable
  toggleCompletionForDay(day, id)
  // update transient map for UI
  const current = !!doneMap.value[id]
  doneMap.value = { ...doneMap.value, [id]: !current }
}
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  padding: 2rem;
  max-width: 1440px;
  margin: 0 auto;
}
.left-pane, .right-pane {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0; /* allow flex children to shrink and avoid overflow */
}
.left-pane {
  flex: 1 1 60%;
}
.right-pane {
  flex: 0 0 36%;
  max-width: 460px;
}
.habits-list { display:flex; flex-direction:column; gap:1rem }
.mood-grid { display:grid; grid-template-columns: repeat(3, 1fr); gap:1rem }
.mood-card { background: rgba(255,255,255,0.03); border-radius:14px; padding:1rem; display:flex; flex-direction:column; align-items:center; gap:0.5rem; cursor:pointer; border:1px solid rgba(255,255,255,0.04) }
.mood-card .mood-art { font-size:2.4rem }
.mood-card .mood-name { font-weight:600 }
.mood-card.mood-selected { background: linear-gradient(135deg,var(--purple),var(--magenta)); color:#fff; border-color:transparent; transform:translateY(-4px); }
.mood-art { font-size:2rem }

.habits-list, .habits-list > * {
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}

/* Prevent the dashboard from producing a horizontal scrollbar */
.dashboard {
  box-sizing: border-box;
  overflow-x: hidden;
}

@media (max-width: 1023px) {
  /* Hide dashboard on smaller screens — nav will route to individual views */
  .dashboard { display: none }
}
</style>