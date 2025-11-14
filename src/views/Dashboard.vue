<template>
  <section class="dashboard">
    <div class="left-pane">
      
      <div class="dashboard-date-title">
        <h2 class="greeting">{{ greeting }}</h2>
      </div>

      <MotivationCard avatar-id="1" :message="motivationMessage" />

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
      
      <Calendar
        :initialDate="selectedDate"
        :habitDates="Object.keys(completions.value || {})"
        :moodDates="Object.keys(moodEntries.value || {})"
        @select-date="onDateSelected"
      />

      <MoodGrid :moods="moods" :selected-id="selectedMoodId" @select="saveMoodForSelected" />
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { formatLocalDate } from '../utils/date.js'
import { useMoods } from '../composables/useMoods.js'
import motivations from '../assets/motivations.json'
import avatars from '../assets/avatars.json'
import WeekStrip from '../components/WeekStrip.vue'
import HabitCard from '../components/HabitCard.vue'
import Calendar from '../components/Calendar.vue'
import MotivationCard from '../components/MotivationCard.vue'
import MoodGrid from '../components/MoodGrid.vue'
import { useGreeting } from '../composables/useGreeting.js'
import { useHabits } from '../composables/useHabits.js'
import { useCompletions } from '../composables/useCompletions.js'

const selectedDate = ref(formatLocalDate(new Date()))
const { habits, loadHabits } = useHabits()
const { completions, loadCompletions, toggleCompletionForDay } = useCompletions()
const doneMap = ref({})
const { moodEntries, loadMoods, setMoodForDay, deleteMoodForDay, getMoodForDay, moods } = useMoods()
const motivationMessage = ref('')
const { userName, greeting } = useGreeting()

function getAvatarSrc(avatarId) {
  return (avatars && avatars[avatarId]) ? avatars[avatarId] : avatars['1']
}

onMounted(() => {
  loadHabits()
  loadCompletions()
  loadMoods()
  if (motivations && motivations.length) {
    motivationMessage.value = motivations[Math.floor(Math.random() * motivations.length)]
  } else {
    motivationMessage.value = 'Success is the sum of small efforts repeated daily.'
  }
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
.dashboard { min-height: 100dvh; }
.left-pane, .right-pane {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0; /* allow flex children to shrink and avoid overflow */
}
.left-pane {
  flex: 1 1 60%;
  display: flex;
  flex-direction: column;
  justify-content: center; 
  gap: 1.5rem;
}
.right-pane {
  flex: 0 0 36%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  justify-content: center; 
  gap: 1.5rem;
}
.habits-list { display:flex; flex-direction:column; gap:1rem }
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

h2.greeting{
    margin: 0;
}

@media (max-width: 1023px) {
  /* Hide dashboard on smaller screens — nav will route to individual views */
  .dashboard { display: none }
}
</style>