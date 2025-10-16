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
        
        <button type="submit" class="submit-btn" :disabled="!userName.trim()">
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

const handleSubmit = () => {
  if (userName.value.trim()) {
    localStorage.setItem('userName', userName.value.trim())
    router.push('/home')
  }
}
</script>
