<template>
  <div class="demo-flashcard-container">
    <div :class="['flashcard', { 'flipped': isFlipped }]" @click="toggleFlip">
      <div class="flashcard-inner">
        <div class="flashcard-front">
          <div class="flashcard-header">
            <span class="text-sm font-medium text-purple-400">Question</span>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flashcard-content">
            <p class="text-xl font-semibold text-white">{{ question }}</p>
          </div>
          <div class="flashcard-hint">
            <p class="text-xs text-gray-500">Click to reveal answer</p>
          </div>
        </div>

        <div class="flashcard-back">
          <div class="flashcard-header">
            <span class="text-sm font-medium text-green-400">Answer</span>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flashcard-content">
            <p class="text-xl font-semibold text-white">{{ answer }}</p>
          </div>
          <div class="flashcard-hint">
            <p class="text-xs text-gray-500">Click to see question</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  question: string;
  answer: string;
}>();

const isFlipped = ref(false);

const toggleFlip = () => {
  isFlipped.value = !isFlipped.value;
};
</script>

<style scoped>
.demo-flashcard-container {
  perspective: 1000px;
  padding: 1rem;
}

.flashcard {
  position: relative;
  width: 100%;
  height: 280px;
  cursor: pointer;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flashcard.flipped {
  transform: rotateY(180deg);
}

.flashcard-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flashcard-front,
.flashcard-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 1rem;
  @apply bg-gradient-to-br from-gray-800 to-gray-900;
  @apply border-2 border-gray-700;
  @apply shadow-xl;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

.flashcard-back {
  transform: rotateY(180deg);
  @apply bg-gradient-to-br from-green-900/30 to-gray-900;
}

.flashcard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.flashcard-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.flashcard-hint {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.flashcard:hover {
  @apply shadow-2xl border-purple-500;
}
</style>
