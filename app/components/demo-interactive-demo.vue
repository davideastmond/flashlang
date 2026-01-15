<template>
  <div
    class="interactive-demo bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 border-2 border-gray-700">
    <div class="text-center mb-8">
      <h3 class="text-2xl font-bold text-white mb-2">Try It Yourself</h3>
      <p class="text-gray-400">Experience how flashcards help you learn</p>
    </div>

    <!-- Demo Controls -->
    <div class="mb-6 flex justify-center space-x-4">
      <button v-for="(topic, index) in demoTopics" :key="index" @click="selectTopic(index)" :class="[
        'px-4 py-2 rounded-lg font-medium transition-all',
        selectedTopicIndex === index
          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      ]">
        {{ topic.name }}
      </button>
    </div>

    <!-- Flashcard Display -->
    <div class="mb-6">
      <DemoFlashcard :question="currentCard!.question" :answer="currentCard!.answer" />
    </div>

    <!-- Navigation -->
    <div class="flex items-center justify-between">
      <button @click="previousCard" :disabled="currentCardIndex === 0" :class="[
        'flex items-center px-4 py-2 rounded-lg font-medium transition-all',
        currentCardIndex === 0
          ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
          : 'bg-gray-700 text-white hover:bg-gray-600'
      ]">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>

      <div class="text-center">
        <p class="text-sm text-gray-400">
          Card {{ currentCardIndex + 1 }} of {{ currentTopic!.cards.length }}
        </p>
        <div class="flex space-x-1 mt-2 justify-center">
          <div v-for="(card, index) in currentTopic!.cards" :key="index" :class="[
            'w-2 h-2 rounded-full transition-all',
            index === currentCardIndex ? 'bg-purple-500 w-6' : 'bg-gray-600'
          ]" />
        </div>
      </div>

      <button @click="nextCard" :disabled="currentCardIndex === currentTopic!.cards.length - 1" :class="[
        'flex items-center px-4 py-2 rounded-lg font-medium transition-all',
        currentCardIndex === currentTopic!.cards.length - 1
          ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
          : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500'
      ]">
        Next
        <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Progress Stats -->
    <div class="mt-6 pt-6 border-t border-gray-700">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <p class="text-2xl font-bold text-green-400">{{ viewedCards.size }}</p>
          <p class="text-xs text-gray-500">Cards Viewed</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-purple-400">{{ currentTopic!.cards.length }}</p>
          <p class="text-xs text-gray-500">Total Cards</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-yellow-400">{{ Math.round((viewedCards.size / currentTopic!.cards.length) *
            100) }}%</p>
          <p class="text-xs text-gray-500">Progress</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

type DemoCard = {
  question: string;
  answer: string;
};

type DemoTopic = {
  name: string;
  cards: DemoCard[];
};

const demoTopics: DemoTopic[] = [
  {
    name: '🇪🇸 Spanish',
    cards: [
      { question: 'Hello', answer: 'Hola' },
      { question: 'Thank you', answer: 'Gracias' },
      { question: 'Goodbye', answer: 'Adiós' },
      { question: 'Please', answer: 'Por favor' },
      { question: 'Yes', answer: 'Sí' },
    ]
  },
  {
    name: '🇫🇷 French',
    cards: [
      { question: 'Hello', answer: 'Bonjour' },
      { question: 'Thank you', answer: 'Merci' },
      { question: 'Goodbye', answer: 'Au revoir' },
      { question: 'Please', answer: "S'il vous plaît" },
      { question: 'Yes', answer: 'Oui' },
    ]
  },
  {
    name: '🇩🇪 German',
    cards: [
      { question: 'Hello', answer: 'Hallo' },
      { question: 'Thank you', answer: 'Danke' },
      { question: 'Goodbye', answer: 'Auf Wiedersehen' },
      { question: 'Please', answer: 'Bitte' },
      { question: 'Yes', answer: 'Ja' },
    ]
  }
];

const selectedTopicIndex = ref(0);
const currentCardIndex = ref(0);
const viewedCards = ref(new Set<string>());

const currentTopic = computed(() => demoTopics[selectedTopicIndex.value]);
const currentCard = computed(() => currentTopic.value!.cards[currentCardIndex.value]);

const selectTopic = (index: number) => {
  selectedTopicIndex.value = index;
  currentCardIndex.value = 0;
  viewedCards.value.clear();
  trackCardView();
};

const nextCard = () => {
  if (currentCardIndex.value < currentTopic.value!.cards.length - 1) {
    currentCardIndex.value++;
    trackCardView();
  }
};

const previousCard = () => {
  if (currentCardIndex.value > 0) {
    currentCardIndex.value--;
    trackCardView();
  }
};

const trackCardView = () => {
  const cardKey = `${selectedTopicIndex.value}-${currentCardIndex.value}`;
  viewedCards.value.add(cardKey);
};

// Track initial card view
trackCardView();
</script>
