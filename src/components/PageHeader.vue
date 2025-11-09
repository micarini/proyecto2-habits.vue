<template>
  <div class="page-header">
    <button v-if="showBack" class="icon-btn" @click="$emit('back')" aria-label="Back"><i class="fa fa-angle-left" aria-hidden="true"></i></button>
    <h2 class="date-title">{{ title }}</h2>
    <div style="width:48px"></div>
  </div>
</template>

<script setup>
const props = defineProps({ title: { type: String, default: '' }, showBack: { type: Boolean, default: true } })
</script>

<style scoped>
.page-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem }
.date-title { color:var(--text); font-weight:700 }
</style>
