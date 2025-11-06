<script setup>
import FloatingBar from './components/FloatingBar.vue'
import { ref, nextTick, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// only show the floating bar on these route names
const showFloating = computed(() => {
  const n = route.name
  return n === 'Home' || n === 'Calendar' || n === 'MoodTracker'
})

async function handleOpenAdd() {
  // If we're already on Home, trigger the Home add modal immediately.
  // If we're on Calendar or Mood, just navigate to Home (don't open the modal).
  const current = route.name
  if (current === 'Home') {
    // already on home — open the modal
    window.dispatchEvent(new CustomEvent('floating-open-add'))
    return
  }
  try {
    await router.push('/home')
  } catch (e) { /* ignore */ }
}

async function handleOpenCalendar() {
  try { await router.push('/calendar') } catch (e) { /* noop */ }
}

async function handleOpenMood() {
  try { await router.push('/mood') } catch (e) { /* noop */ }
}
</script>

<template>
  <router-view />
  <FloatingBar v-if="showFloating" @open-add="handleOpenAdd" @open-calendar="handleOpenCalendar" @open-mood="handleOpenMood" />
</template>

<style scoped>
</style>
