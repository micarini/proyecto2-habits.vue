<template>
  <ul class="per-day-habits">
    <li v-for="item in items" :key="item.id">
      <span class="emoji">{{ item.icon }}</span>
      <span class="habit-title">{{ item.title }}</span>
    </li>
  </ul>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] }
})
</script>

<style scoped>
.per-day-habits { color: var(--muted); }
</style>
