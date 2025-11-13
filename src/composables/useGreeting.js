import { ref, computed } from 'vue'

export function useGreeting() {
  const userName = ref('Friend')
  try {
    const saved = localStorage.getItem('userName')
    if (saved) userName.value = saved
  } catch (e) {
    // ignore localStorage failures in some environments
  }

  // Time-of-day aware greeting
  const greeting = computed(() => {
    const hour = new Date().getHours()
    const name = userName.value || 'Friend'
    if (hour < 12) return `Good morning, ${name}!`
    if (hour < 18) return `Good afternoon, ${name}!`
    return `Good evening, ${name}!`
  })

  function setUserName(name) {
    userName.value = name
    try { localStorage.setItem('userName', name) } catch (e) { /* noop */ }
  }

  return { userName, greeting, setUserName }
}
