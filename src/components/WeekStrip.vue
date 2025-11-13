<template>
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
      :class="['day-chip', { 'is-today': d.isToday, 'is-selected': d.date === internalSelected } ]"
      @click="onWeekChipClick(d.date)"
    >
      <div class="day-label">{{ d.label }}</div>
      <div class="day-number">{{ d.number }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { formatLocalDate } from '../utils/date.js'

const props = defineProps({
  modelValue: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue','select'])

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
  element.scrollTo({ left: Math.round(target), behavior: 'smooth' })
}

const internalSelected = ref(props.modelValue || formatLocalDate(new Date()))

function onWeekChipClick(dateISO) {
  if (isDragging) { isDragging = false; return }
  internalSelected.value = dateISO
  emit('update:modelValue', dateISO)
  emit('select', dateISO)
  nextTick(() => scrollChipToCenter(dateISO))
}

onMounted(() => {
  updateWeekDays()
  // center on the provided/initial selected date
  nextTick(() => scrollChipToCenter(internalSelected.value))
})

watch(() => props.modelValue, (v) => {
  if (!v) return
  internalSelected.value = v
  nextTick(() => scrollChipToCenter(v))
})
</script>

<style scoped>
.week-calendar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  padding-bottom: 1.6rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.05) ;
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
  box-shadow: 0 0 0 2px rgba(167,139,250,0.12);
  border: 1px solid rgba(167,139,250,0.18);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.95;
}

.day-chip.is-selected {
  background: linear-gradient(135deg, var(--purple), var(--magenta));
  border-color: transparent;
  color: #fff;
  font-weight: 700;
  transform: translateY(-2px);
}

.day-number {
  font-size: 1.125rem;
  font-weight: 700;
}
</style>
