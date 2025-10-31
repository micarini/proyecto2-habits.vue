<template>
  <section class="goals">
    <div class="goals-container">
      <!-- Mascot -->
      <div class="mascot">
        <div class="mascot-avatar">
          <img v-if="userAvatarSrc" :src="userAvatarSrc" alt="Mascot Avatar" style="width:100%;height:100%;object-fit:contain;" />
        </div>
      </div>

      <!-- Title -->
      <h1 class="goals-title">What's your goal?</h1>

      <!-- Goals List -->
      <div class="goals-list">
        <button 
          v-for="goal in goals" 
          :key="goal.id"
          class="goal-item"
          :class="{ 'is-selected': selectedGoal === goal.id }"
          @click="selectGoal(goal.id)"
        >
          <span class="goal-icon">{{ goal.icon }}</span>
          <span class="goal-title">{{ goal.title }}</span>
        </button>
      </div>

      <!-- Continue Button -->
      <button 
        class="continue-btn" 
        :disabled="!selectedGoal"
        @click="continueToHome"
      >
        Continue
      </button>
      
      <!-- Confirmation Modal -->
      <div v-if="showConfirmModal" class="confirm-overlay">
        <div class="confirm-modal">
          <h3 class="confirm-title">Replace current habits?</h3>
          <p class="confirm-body">This will overwrite your current habits.</p>
          <div class="confirm-actions">
            <button class="btn btn-secondary" @click="cancelReplace">Keep existing</button>
            <button class="btn btn-primary" @click="confirmReplace">Replace</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import goalsData from '../assets/goalsData.json'

const router = useRouter()
const goals = ref(goalsData)
const selectedGoal = ref(null)

const userAvatar = ref(null)
const avatarMap = {
  '1': '/avatar01-cropped.svg',
  '2': '/avatar2-cropped.svg',
  '3': '/avatar3-cropped.svg',
  '4': '/avatar4-cropped.svg',
  '5': '/avatar5-cropped.svg',
  '6': '/avatar6-cropped.svg'
}
const userAvatarSrc = computed(() => avatarMap[userAvatar.value] || null)

// in-app confirmation
const showConfirmModal = ref(false)
const pendingGoalData = ref(null)

onMounted(() => {
  // onboarding check
  const savedName = localStorage.getItem('userName')
  if (!savedName) {
    router.push('/onboarding')
  }
  
  // get goal selected
  const savedGoal = localStorage.getItem('userGoal')
  if (savedGoal) {
    selectedGoal.value = savedGoal
  }

  // get user avatar
  const savedAvatar = localStorage.getItem('userAvatar')
  if (savedAvatar) {
    userAvatar.value = savedAvatar
  }
})

function selectGoal(goalId) {
  selectedGoal.value = goalId
}

function continueToHome() {
  if (!selectedGoal.value) return
  
  // guardo selected goal
  localStorage.setItem('userGoal', selectedGoal.value)
  
  // recommended habits for goal selected
  const goalData = goals.value.find(g => g.id === selectedGoal.value)
  if (goalData && goalData.habits) {
    const existingUserHabits = localStorage.getItem('userHabits')
    if (existingUserHabits) {
      // in-app confirmation modal y guardo pending goal data
      pendingGoalData.value = goalData
      showConfirmModal.value = true
      return
    }
    // si no hay habitos previos aplico recomendaciones inmediatamente sin preguntar
    localStorage.setItem('recommendedHabits', JSON.stringify(goalData.habits))
  }
  
  // to home
  router.push('/home')
}

function confirmReplace() {
  if (!pendingGoalData.value) return
  localStorage.removeItem('userHabits')
  localStorage.setItem('recommendedHabits', JSON.stringify(pendingGoalData.value.habits))
  showConfirmModal.value = false
  pendingGoalData.value = null
  router.push('/home')
}

function cancelReplace() {
  if (pendingGoalData.value) {
    // keep user's habits, but still save recommended for later
    localStorage.setItem('recommendedHabits', JSON.stringify(pendingGoalData.value.habits))
  }
  showConfirmModal.value = false
  pendingGoalData.value = null
  router.push('/home')
}
</script>

<style scoped>
.goals {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.goals-container {
  max-width: 420px;
  width: 100%;
  border-radius: 28px;
  padding: 2.5rem 1.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mascot {
  margin-bottom: 1.5rem;
}

.mascot-avatar {
  width: 100px;
  height: 100px;
  font-size: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.goals-title {
  font-size: clamp(1.75rem, 5vw, 2rem);
  font-weight: 700;
  margin-bottom: 2rem;
  color: var(--text);
  text-align: center;
}

.goals-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.goal-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.06);
  border: 2px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  color: var(--text);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.goal-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(168, 85, 247, 0.4);
  transform: translateX(4px);
}

.goal-item.is-selected {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2));
  border-color: var(--purple);
  box-shadow: 0 4px 16px rgba(168, 85, 247, 0.3);
}

.goal-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.goal-title {
  flex: 1;
}

.continue-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, var(--purple), var(--magenta));
  color: white;
  border: none;
  border-radius: 16px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.continue-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(124, 34, 197, 0.3);
}

.continue-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.continue-btn:active:not(:disabled) {
  transform: translateY(0);
}

/* Confirmation modal styles */
.confirm-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.5);
  z-index: 2000;
}
.confirm-modal {
  background: var(--background, #0f0f10);
  padding: 1.25rem;
  border-radius: 12px;
  width: 92%;
  max-width: 420px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.6);
  text-align: center;
}
.confirm-title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  color: var(--text);
}
.confirm-body {
  margin: 0 0 1rem;
  color: var(--muted);
}
.confirm-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}
.btn { padding: 0.6rem 0.9rem; border-radius: 10px; border: none; cursor: pointer; font-weight: 600 }
.btn-primary { background: linear-gradient(135deg, var(--purple), var(--magenta)); color: #fff }
.btn-secondary { background: transparent; border: 1px solid rgba(255,255,255,0.08); color: var(--muted) }
</style>
