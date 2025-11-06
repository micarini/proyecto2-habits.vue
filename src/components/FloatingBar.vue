<template>
  <div class="floating-action-bar" role="toolbar" aria-label="Primary actions">
    <div class="floating-inner">
      <button class="add-habit-pill" @click="$emit('open-add')">+ New habit</button>
      <div class="add-actions">
        <button class="mini-action" title="Mood Tracker" @click="$emit('open-mood')"><i class="fa fa-smile-o" aria-hidden="true"></i></button>
        <button class="mini-action" title="Calendar view" @click="$emit('open-calendar')"><i class="fa fa-calendar-o" aria-hidden="true"></i></button>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>