<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="bg-red-500/10 border border-red-500 rounded-lg p-6 max-w-md">
        <p class="text-red-400">{{ error }}</p>
        <NuxtLink :to="`/user/studysets/${studySetId}`"
          class="mt-4 inline-block text-indigo-400 hover:text-indigo-300 transition-colors">
          ← Back to Study Set
        </NuxtLink>
      </div>
    </div>

    <!-- Practice Session -->
    <div v-else-if="studySet && flashCards.length > 0" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <NuxtLink :to="`/user/studysets/${studySetId}`"
          class="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Study Set
        </NuxtLink>
        <h1 class="text-3xl font-bold text-white mb-2">{{ studySet.title }}</h1>
        <div class="flex items-center space-x-4 text-sm text-gray-400">
          <span>Card {{ currentIndex + 1 }} of {{ flashCards.length }}</span>
          <div class="h-2 flex-1 bg-gray-700 rounded-full overflow-hidden max-w-xs">
            <div class="h-full bg-indigo-500 transition-all duration-300"
              :style="{ width: `${((currentIndex + 1) / flashCards.length) * 100}%` }"></div>
          </div>
        </div>
      </div>

      <!-- Flashcard -->
      <div class="mb-8">
        <div class="perspective-1000">
          <div class="relative w-full h-96 cursor-pointer transition-transform duration-500 transform-style-3d"
            :class="{ 'rotate-y-180': isFlipped }" @click="flipCard">
            <!-- Front of card (Question) -->
            <div
              class="absolute w-full h-full backface-hidden bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700 flex items-center justify-center p-8">
              <div class="text-center">
                <span class="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-4 block">Question</span>
                <p class="text-2xl text-white font-medium">{{ currentCard?.question }}</p>
                <p class="text-sm text-gray-400 mt-6">Click to reveal answer</p>
              </div>
            </div>
            <!-- Back of card (Answer) -->
            <div
              class="absolute w-full h-full backface-hidden bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700 flex items-center justify-center p-8 rotate-y-180">
              <div class="text-center">
                <span class="text-xs font-semibold text-green-400 uppercase tracking-wide mb-4 block">Answer</span>
                <p class="text-2xl text-white font-medium">{{ currentCard?.answer }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex items-center justify-between">
        <button @click="previousCard" :disabled="currentIndex === 0"
          class="inline-flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white rounded-lg transition-colors font-medium">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        <button @click="isFlipped = !isFlipped"
          class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium">
          <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Flip Card
        </button>

        <button @click="nextCard" :disabled="currentIndex === flashCards.length - 1"
          class="inline-flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white rounded-lg transition-colors font-medium">
          Next
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Keyboard shortcuts hint -->
      <div class="mt-8 text-center text-sm text-gray-500">
        <p>Keyboard shortcuts: ← Previous | → Next | Space Flip</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="studySet && flashCards.length === 0" class="flex items-center justify-center min-h-screen">
      <div class="bg-gray-800/60 backdrop-blur-sm rounded-lg p-12 text-center border border-gray-700 max-w-md">
        <svg class="w-20 h-20 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 class="text-xl font-semibold text-gray-400 mb-2">No flash cards to practice</h3>
        <p class="text-gray-500 mb-6">Add some cards to this study set to start practicing</p>
        <NuxtLink :to="`/user/studysets/${studySetId}`"
          class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium inline-block">
          Go to Study Set
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import type { FlashCard } from "~~/shared/types/definitions/flash-card";
import type { StudySet } from "~~/shared/types/definitions/study-set";

const route = useRoute();
const studySetId = route.params.studySetId as string;

definePageMeta({
  auth: true,
  middleware: ['sidebase-auth'],
  layout: 'headerbar'
})

// State
const loading = ref(true);
const error = ref<string | null>(null);
const studySet = ref<StudySet | null>(null);
const flashCards = ref<FlashCard[]>([]);
const currentIndex = ref(0);
const isFlipped = ref(false);

// Computed
const currentCard = computed(() => flashCards.value[currentIndex.value]);

// Fetch study set data
const fetchStudySet = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await $fetch<{ success: boolean; data: StudySet & { flashCards: FlashCard[] } }>(
      `/api/studysets/${getFullUuid(studySetId)}`
    );

    if (response.success) {
      studySet.value = response.data;
      flashCards.value = response.data.flashCards || [];
    }
  } catch (err: any) {
    console.error("Error fetching study set:", err);
    error.value = err.data?.statusMessage || "Failed to load study set";
  } finally {
    loading.value = false;
  }
};

// Card navigation
const nextCard = () => {
  if (currentIndex.value < flashCards.value.length - 1) {
    currentIndex.value++;
    isFlipped.value = false;
  }
};

const previousCard = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    isFlipped.value = false;
  }
};

const flipCard = () => {
  isFlipped.value = !isFlipped.value;
};

// Keyboard shortcuts
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'ArrowRight') {
    nextCard();
  } else if (event.key === 'ArrowLeft') {
    previousCard();
  } else if (event.key === ' ') {
    event.preventDefault();
    flipCard();
  }
};

// Load data on mount
onMounted(() => {
  fetchStudySet();
  window.addEventListener('keydown', handleKeyPress);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
});
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}

.transform-style-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}
</style>
