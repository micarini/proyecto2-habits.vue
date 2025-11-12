<template>
  <section class="mood-tracker">
    <div class="mood-container">
      <!-- Week calendar chips (scrollable) placed at the top -->
      <WeekStrip v-model="selectedDate" @select="onWeekChipClick" />

      <PageHeader title="Mood" :showBack="true" @back="$router.back()" />

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
import { ref, computed, onMounted } from 'vue'
import { formatLocalDate } from '../utils/date.js'
import WeekStrip from '../components/WeekStrip.vue'
import PageHeader from '../components/PageHeader.vue'
import { useMoods } from '../composables/useMoods.js'

const { moodEntries, loadMoods, setMoodForDay, deleteMoodForDay, getMoodForDay, moods } = useMoods()
const selectedDate = ref(formatLocalDate(new Date()))
const showSaved = ref(false)

function onWeekChipClick(dateISO) {
  // WeekStrip handles dragging/centering; just update selected date
  selectedDate.value = dateISO
}

const displayDate = computed(() => {
  const d = new Date(selectedDate.value)
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
})

function isSelected(id) {
  const v = getMoodForDay(selectedDate.value)
  return v && v.moodId === id
}

function selectMood(m) {
  const day = selectedDate.value
  const existing = getMoodForDay(day)
  // toggle: if same mood clicked again, remove it
  if (existing && existing.moodId === m.id) {
    deleteMoodForDay(day)
    showSaved.value = true
    setTimeout(() => showSaved.value = false, 700)
    return
  }
  // otherwise set the mood for the day
  setMoodForDay(day, { moodId: m.id, emoji: m.emoji, name: m.name })
  showSaved.value = true
  setTimeout(() => showSaved.value = false, 700)
}

function clearMood() {
  deleteMoodForDay(selectedDate.value)
}

function openHistory() {
  // placeholder — for now navigate to calendar view which shows dots
  // user can later implement a dedicated history view
  try { $router.push('/calendar') } catch (e) { /* noop */ }
}

onMounted(() => {
  loadMoods()
})
</script>

<style scoped>
.mood-tracker { min-height: 100dvh; background: #0f0f10; color: #fff; display:flex; align-items:flex-start; justify-content:center; padding:1.5rem; }
.mood-container { width:100%; max-width:520px }
.mood-desc { color:var(--muted); margin-bottom:1rem }
.mood-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:0.75rem; margin-bottom:4rem }
.mood-card { background: rgba(255,255,255,0.03); border-radius:14px; padding:1rem; display:flex; flex-direction:column; align-items:center; gap:0.5rem; cursor:pointer; border:1px solid rgba(255,255,255,0.04) }
.mood-card .mood-art { font-size:2.4rem }
.mood-card .mood-name { font-weight:600 }
.mood-card.selected { background: linear-gradient(135deg,var(--purple),var(--magenta)); color:#fff; border-color:transparent; transform:translateY(-4px) }
.saved-toast { position:fixed; left:50%; transform:translateX(-50%); bottom:calc(1.2rem + env(safe-area-inset-bottom,0px)); background:rgba(255,255,255,0.08); padding:0.5rem 0.75rem; border-radius:999px; font-weight:600 }

@media (max-width:640px) {
  .mood-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
}
</style>
