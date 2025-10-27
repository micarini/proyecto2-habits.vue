<template>
  <div class="onboarding">
    <div class="onboarding-content">
      <h1 class="onboarding-title">What's your name?</h1>
      <p class="onboarding-subtitle">We'll use this to personalize your experience</p>
      
      <form @submit.prevent="handleSubmit" class="onboarding-form">
        <input
          v-model="userName"
          type="text"
          placeholder="Enter your name"
          class="name-input"
          maxlength="20"
          autofocus
          required
        />

        <div class="avatar-section">
          <p class="avatar-label">Choose your avatar</p>
          <div class="avatar-grid">
            <div 
              v-for="avatar in avatars" 
              :key="avatar.id"
              class="avatar-option"
              :class="{ selected: selectedAvatar === avatar.id }"
              @click="selectedAvatar = avatar.id"
            >
              <img :src="avatar.src" :alt="avatar.alt" />
            </div>
          </div>
        </div>
        
        <button type="submit" class="submit-btn" :disabled="!userName.trim() || !selectedAvatar">
          Continue
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userName = ref('')
const selectedAvatar = ref(null)

const avatars = [
  { id: 1, src: '/avatar01-cropped.svg', alt: 'Avatar 1' },
  { id: 2, src: '/avatar2-cropped.svg', alt: 'Avatar 2' },
  { id: 3, src: '/avatar3-cropped.svg', alt: 'Avatar 3' },
  { id: 4, src: '/avatar4-cropped.svg', alt: 'Avatar 4' },
  { id: 5, src: '/avatar5-cropped.svg', alt: 'Avatar 5' },
  { id: 6, src: '/avatar6-cropped.svg', alt: 'Avatar 6' }
]

const handleSubmit = () => {
  if (userName.value.trim() && selectedAvatar.value) {
    localStorage.setItem('userName', userName.value.trim())
    localStorage.setItem('userAvatar', selectedAvatar.value.toString())
    router.push('/goals')
  }
}
</script>

<style scoped>
.onboarding {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--gradient-bg);
  position: relative;
  overflow: hidden;
}

.onboarding-content {
  max-width: 480px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.onboarding-title {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0 0 0.75rem;
  color: #fff;
}

.onboarding-subtitle {
  font-size: 1.1rem;
  color: var(--muted);
  margin: 0 0 3rem;
  line-height: 1.5;
}

.onboarding-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.name-input {
  width: 100%;
  padding: 1.25rem 1.5rem;
  font-size: 1.125rem;
  font-family: 'Bricolage Grotesque', sans-serif;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: #fff;
  outline: none;
  transition: all 0.2s ease;
}

.name-input::placeholder {
  color: #64748b;
}

.name-input:focus {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--purple);
  box-shadow: 0 0 0 4px rgba(124, 34, 197, 0.1);
}

.submit-btn {
  padding: 1.125rem 2rem;
  font-size: 1.05rem;
  font-weight: 600;
  font-family: 'Bricolage Grotesque', sans-serif;
  background: linear-gradient(135deg, var(--purple) 0%, #a855f7 100%);
  color: white;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(124, 34, 197, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(124, 34, 197, 0.4);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.avatar-section {
  margin: 1rem 0;
}

.avatar-label {
  font-size: 1rem;
  color: var(--muted);
  margin: 0 0 1rem;
  text-align: center;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.avatar-option {
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-option img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.2s ease;
}

.avatar-option:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(124, 34, 197, 0.3);
  transform: translateY(-2px);
}

.avatar-option:hover img {
  transform: scale(1.1);
}

.avatar-option.selected {
  background: rgba(124, 34, 197, 0.15);
  border-color: var(--purple);
  box-shadow: 0 0 0 4px rgba(124, 34, 197, 0.1);
}

.avatar-option.selected img {
  transform: scale(1.05);
}

@media (max-width: 640px) {
  .onboarding-title {
    font-size: 2rem;
  }
  .onboarding-subtitle {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
  
  .avatar-grid {
    gap: 0.75rem;
  }
  
  .avatar-option {
    padding: 0.75rem;
  }
}
</style>
