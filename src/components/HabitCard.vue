<template>
  <div :class="['habit-card', { 'is-done': done }]" @click="onOpen">
    <div class="habit-icon">
      <span>{{ habit.icon }}</span>
    </div>
    <div class="habit-info">
      <h3 class="habit-title">{{ habit.title }}</h3>
    </div>
    <div class="habit-badge" @click.stop="onToggle">
      <span v-if="!done" class="badge-empty"></span>
      <span v-else class="badge-check">✓</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  habit: { type: Object, required: true },
  done: { type: Boolean, default: false }
})
const emit = defineEmits(['open','toggle'])
function onOpen() { emit('open', props.habit) }
function onToggle() { emit('toggle', props.habit) }
</script>

<style scoped>
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
.habit-card:hover { box-shadow: 0 4px 24px rgba(168,85,247,0.15); transform: translateY(-2px); }
.habit-card.is-done { opacity: 0.6; }
.habit-icon { font-size: 1.75rem; flex-shrink: 0; }
.habit-info { flex: 1; min-width: 0; }
.habit-title { margin: 0 0 0.25rem; font-size: 1rem; font-weight: 600; color: var(--text); }
.habit-status { margin: 0; font-size: 0.875rem; color: var(--muted); }
.habit-badge { flex-shrink: 0; display: grid; place-items: center; min-width: 28px; height: 28px; border-radius: 50%; font-weight: 600; font-size: 0.875rem; border: 2px solid rgba(255,255,255,0.18); }
.badge-check { color: #4ade80; }
</style>
