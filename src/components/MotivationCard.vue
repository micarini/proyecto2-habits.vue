<template>
  <div class="motivation-card motivation-full">
    <div class="motivation-avatar-face">
      <div class="avatar-bg">
        <img :src="getAvatarSrc(avatarId)" alt="Avatar" />
      </div>
    </div>
    <div class="motivation-message-side">
      <h2 class="motivation-title">{{ message }}</h2>
    </div>
  </div>
</template>

<script setup>
import avatars from '../assets/avatars.json'
import { computed } from 'vue'

const props = defineProps({
  avatarId: { type: [String, Number], default: '1' },
  message: { type: String, default: '' }
})

function getAvatarSrc(id) {
  return (avatars && avatars[id]) ? avatars[id] : avatars['1']
}
</script>

<style scoped>
.motivation-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  border-radius: 20px;
  padding: 1rem 1rem;
  margin-bottom: 0.75rem;
  color: #fff;
  background: rgba(255,255,255,0.02);
}
.motivation-avatar-face .avatar-bg img { width: 56px; height: 56px; object-fit: contain; border-radius: 12px }
.motivation-title { font-size: 1rem; font-weight: 600; margin: 0 }
</style>
