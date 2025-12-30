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

      <!-- Answer Input -->
      <div v-if="!showResults" class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Your Answer:</label>
        <input v-model="userAnswer" type="text" placeholder="Type your answer here..."
          class="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          @keydown.enter="flipCard" />
        <!-- Answer Check Result -->
        <div v-if="cardResults[currentIndex]?.checked" class="mt-3 p-3 rounded-lg" :class="[
          cardResults[currentIndex]?.isCorrect
            ? 'bg-green-500/20 border border-green-500/50'
            : 'bg-red-500/20 border border-red-500/50'
        ]">
          <div class="flex items-center space-x-2">
            <svg v-if="cardResults[currentIndex]?.isCorrect" class="w-5 h-5 text-green-400" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span :class="cardResults[currentIndex]?.isCorrect ? 'text-green-300' : 'text-red-300'" class="font-medium">
              {{ cardResults[currentIndex]?.isCorrect ? 'Correct!' : 'Incorrect' }}
            </span>
          </div>
          <p v-if="!cardResults[currentIndex]?.isCorrect" class="text-sm text-gray-300 mt-2">
            Your answer: <span class="font-medium">{{ cardResults[currentIndex]?.userAnswer }}</span>
          </p>
        </div>
      </div>

      <!-- Flashcard -->
      <div v-if="!showResults" class="mb-8">
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

      <!-- AI Processing Spinner -->
      <div v-if="!showResults && isAiProcessing" class="mb-6 flex items-center justify-center">
        <div class="flex items-center space-x-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg px-6 py-4">
          <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-400"></div>
          <span class="text-indigo-300 font-medium">AI is checking your answer...</span>
        </div>
      </div>

      <!-- Controls -->
      <div v-if="!showResults" class="flex flex-col space-y-4">
        <div class="flex items-center justify-between">
          <button @click="previousCard" :disabled="currentIndex === 0 || isAiProcessing"
            class="inline-flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white rounded-lg transition-colors font-medium">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <div class="flex items-center space-x-3">
            <button @click="isFlipped = !isFlipped" :disabled="isAiProcessing"
              class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium disabled:bg-gray-800 disabled:opacity-50">
              <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Flip Card
            </button>

            <button @click="toggleSpeechRecognition" :class="[
              'px-6 py-3 rounded-lg transition-colors font-medium inline-flex items-center disabled:bg-gray-800 disabled:opacity-50',
              isRecording
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                : 'bg-green-600 hover:bg-green-700 text-white'
            ]" :disabled="isAiProcessing">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              {{ isRecording ? 'Stop Recording' : 'Speak Answer' }}
            </button>
          </div>

          <button @click="currentIndex === flashCards.length - 1 ? finishSession() : nextCard()"
            :disabled="isAiProcessing"
            class="inline-flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium disabled:bg-gray-800 disabled:opacity-50"
            :class="currentIndex === flashCards.length - 1 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'">
            {{ currentIndex === flashCards.length - 1 ? 'Finish' : 'Next' }}
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Transcription Display -->
        <div v-if="transcript || recognitionError"
          class="bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <div v-if="isRecording" class="flex items-center space-x-2 text-red-400">
            <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span class="text-sm font-medium">Listening...</span>
          </div>
          <div v-if="transcript" class="mt-2">
            <span class="text-xs font-semibold text-indigo-400 uppercase tracking-wide">Your Response:</span>
            <p class="text-white mt-1">{{ transcript }}</p>
          </div>
          <div v-if="recognitionError" class="mt-2">
            <span class="text-xs font-semibold text-red-400 uppercase tracking-wide">Error:</span>
            <p class="text-red-300 mt-1 text-sm">{{ recognitionError }}</p>
          </div>
        </div>
      </div>

      <!-- Keyboard shortcuts hint -->
      <div v-if="!showResults" class="mt-8 text-center text-sm text-gray-500">
        <p>Keyboard shortcuts: ← Previous | → Next </p>
      </div>
    </div>

    <!-- Results Screen -->
    <div v-if="showResults" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700 p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-indigo-500/20 rounded-full mb-4">
            <svg class="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-white mb-2">Practice Complete!</h2>
          <p class="text-gray-400">{{ studySet?.title }}</p>
        </div>

        <!-- Score Summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-gray-900/50 rounded-lg p-6 text-center">
            <div class="text-4xl font-bold text-white mb-2">{{ sessionScore.correctCount }}/{{ flashCards.length }}
            </div>
            <div class="text-sm text-gray-400">Correct Answers</div>
          </div>
          <div class="bg-gray-900/50 rounded-lg p-6 text-center">
            <div class="text-4xl font-bold text-indigo-400 mb-2">{{ sessionScore.percentage }}%</div>
            <div class="text-sm text-gray-400">Accuracy</div>
          </div>
          <div class="bg-gray-900/50 rounded-lg p-6 text-center">
            <div class="text-4xl font-bold text-green-400 mb-2">{{ sessionScore.duration }}</div>
            <div class="text-sm text-gray-400">Duration</div>
          </div>
        </div>

        <!-- Card Results Details -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-white mb-4">Card Results</h3>
          <div class="space-y-3">
            <div v-for="(result, index) in cardResults" :key="index" class="bg-gray-900/50 rounded-lg p-4 border"
              :class="result.isCorrect ? 'border-green-500/30' : 'border-red-500/30'">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <span class="text-sm font-medium text-gray-400">Card {{ index + 1 }}</span>
                    <span v-if="result.isCorrect"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-300">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Correct
                    </span>
                    <span v-else
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-300">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Incorrect
                    </span>
                  </div>
                  <p class="text-white mb-1"><span class="text-gray-400 text-sm">Q:</span> {{
                    flashCards[index]?.question }}</p>
                  <p class="text-green-300 mb-1"><span class="text-gray-400 text-sm">A:</span> {{
                    flashCards[index]?.answer }}</p>
                  <p v-if="!result.isCorrect && result.userAnswer" class="text-red-300">
                    <span class="text-gray-400 text-sm">Your answer:</span> {{ result.userAnswer }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-center space-x-4">
          <button @click="resetSession"
            class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium">
            Practice Again
          </button>
          <NuxtLink :to="`/user/studysets/${studySetId}`"
            class="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium">
            Back to Study Set
          </NuxtLink>
        </div>
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
const isRecording = ref(false);
const transcript = ref<string>('');
const recognitionError = ref<string>('');
let recognition: any = null;

// Practice session tracking
const userAnswer = ref<string>('');
const cardResults = ref<Array<{
  cardId: string;
  userAnswer: string;
  isCorrect: boolean;
  checked: boolean;
  answeredAt?: Date;
}>>([]);
const sessionStartTime = ref<Date | null>(null);
const sessionEndTime = ref<Date | null>(null);
const showResults = ref(false);

const isAiProcessing = ref(false);

// Utility function to shuffle array
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i] as any, shuffled[j] as any] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Computed
const currentCard = computed(() => flashCards.value[currentIndex.value]);

const sessionScore = computed(() => {
  const correctCount = cardResults.value.filter(r => r.isCorrect).length;
  const totalCount = flashCards.value.length;
  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  let duration = '0s';
  if (sessionStartTime.value && sessionEndTime.value) {
    const durationMs = sessionEndTime.value.getTime() - sessionStartTime.value.getTime();
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      duration = `${minutes}m ${remainingSeconds}s`;
    } else {
      duration = `${seconds}s`;
    }
  }

  return {
    correctCount,
    totalCount,
    percentage,
    duration
  };
});

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
      // Randomize the order of flashcards
      flashCards.value = shuffleArray(response.data.flashCards || []);

      // Initialize card results tracking
      cardResults.value = flashCards.value.map(card => ({
        cardId: card.id,
        userAnswer: '',
        isCorrect: false,
        checked: false
      }));

      // Start session timer
      sessionStartTime.value = new Date();
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
    if (isFlipped.value) {
      // If card is flipped, flip back first and wait for animation
      isFlipped.value = false;
      setTimeout(() => {
        currentIndex.value++;
      }, 500); // Match the CSS transition duration
    } else {
      // Card is already showing question, just move to next
      currentIndex.value++;
    }
  }
};

const previousCard = () => {
  if (currentIndex.value > 0) {
    if (isFlipped.value) {
      // If card is flipped, flip back first and wait for animation
      isFlipped.value = false;
      setTimeout(() => {
        currentIndex.value--;
      }, 500); // Match the CSS transition duration
    } else {
      // Card is already showing question, just move to previous
      currentIndex.value--;
    }
  }
};

const flipCard = async () => {
  // Check answer only on first flip
  if (!isFlipped.value && !cardResults.value[currentIndex.value]?.checked) {
    await checkAnswer();
  }
  isFlipped.value = !isFlipped.value;
};

const checkAnswer = async () => {
  const currentResult = cardResults.value[currentIndex.value];
  if (!currentResult || currentResult.checked) return;

  const correctAnswer = currentCard.value?.answer?.toLowerCase().trim() || '';
  const providedAnswer = (userAnswer.value || transcript.value).toLowerCase().trim();

  // Simple exact match check (can be enhanced with fuzzy matching later)
  let isCorrect = correctAnswer === providedAnswer || providedAnswer.includes(correctAnswer);


  if (!isCorrect && providedAnswer !== '') {
    isAiProcessing.value = true;
    await checkAnswerUsingAI(currentCard.value?.question || '', correctAnswer, providedAnswer)
      .then(result => {
        isCorrect = result;
      })
      .catch(err => {
        console.error("AI answer checking failed:", err);
      })
      .finally(() => {
        isAiProcessing.value = false;
      })
  }


  currentResult.userAnswer = userAnswer.value || transcript.value;
  currentResult.isCorrect = isCorrect;
  currentResult.checked = true;
  currentResult.answeredAt = new Date();
};

const checkAnswerUsingAI = async (question: string, correctAnswer: string, userAnswer: string): Promise<boolean> => {
  const response = await $fetch("/api/ai/answerjudge", {
    method: "POST",
    body: {
      question,
      correctAnswer,
      userAnswer
    }
  });

  if (response.data) {
    const result = JSON.parse(response.data as string) as { isCorrect: boolean, reasoning?: string };
    return result.isCorrect;
  }
  return false;
};
// Speech Recognition
const initSpeechRecognition = () => {
  if (typeof window !== 'undefined') {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      recognitionError.value = 'Speech recognition is not supported in your browser';
      return null;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.lang = studySet.value?.language || 'en-US';

    recognition.onstart = () => {
      isRecording.value = true;
      transcript.value = '';
      recognitionError.value = '';
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece;
        } else {
          interimTranscript += transcriptPiece;
        }
      }

      transcript.value = finalTranscript || interimTranscript;
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      isRecording.value = false;

      switch (event.error) {
        case 'no-speech':
          recognitionError.value = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          recognitionError.value = 'No microphone found. Please check your microphone.';
          break;
        case 'not-allowed':
          recognitionError.value = 'Microphone permission denied. Please allow microphone access.';
          break;
        default:
          recognitionError.value = `Error: ${event.error}`;
      }
    };

    recognition.onend = () => {
      isRecording.value = false;
      voiceRecognitionEndedCallback();
    };

    return recognition;
  }
  return null;
};

const toggleSpeechRecognition = async () => {
  if (!recognition) {
    recognition = initSpeechRecognition();
    if (!recognition) return;
  }

  if (isRecording.value) {
    recognition.stop();
  } else {
    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      recognitionError.value = 'Failed to start recording. Please try again.';
    }
  }
};

const finishSession = async () => {
  sessionEndTime.value = new Date();
  showResults.value = true;

  // Submit session data to API (placeholder)
  await submitSessionData();
};

const resetSession = () => {
  currentIndex.value = 0;
  isFlipped.value = false;
  userAnswer.value = '';
  transcript.value = '';
  recognitionError.value = '';
  showResults.value = false;

  // Reset card results
  cardResults.value = flashCards.value.map(card => ({
    cardId: card.id,
    userAnswer: '',
    isCorrect: false,
    checked: false
  }));

  // Reset session timer
  sessionStartTime.value = new Date();
  sessionEndTime.value = null;
};

const submitSessionData = async () => {
  // Placeholder API request - will be implemented later
  const sessionData = {
    studySetId: getFullUuid(studySetId),
    startTime: sessionStartTime.value,
    endTime: sessionEndTime.value,
    results: cardResults.value.map(result => ({
      cardId: result.cardId,
      userAnswer: result.userAnswer,
      isCorrect: result.isCorrect,
      answeredAt: result.answeredAt
    })),
    score: {
      correctCount: sessionScore.value.correctCount,
      totalCount: sessionScore.value.totalCount,
      percentage: sessionScore.value.percentage
    }
  };

  try {
    await $fetch('/api/study-sessions', {
      method: 'POST',
      body: sessionData
    });
  } catch (err) {
    console.error('Failed to submit session data:', err);
  }
};

const voiceRecognitionEndedCallback = () => {
  // Check answer when recognition ends?
  if (!cardResults.value[currentIndex.value]?.checked) {
    checkAnswer();
  }
}

// Watch for card changes to reset transcript and user input
watch(currentIndex, () => {
  userAnswer.value = '';
  transcript.value = '';
  recognitionError.value = '';
  if (isRecording.value && recognition) {
    recognition.stop();
  }
});

// Keyboard shortcuts
const handleKeyPress = (event: KeyboardEvent) => {
  // Ignore key presses when the ai is busy
  if (isAiProcessing.value) return;
  if (event.key === 'ArrowRight') {
    nextCard();
  } else if (event.key === 'ArrowLeft') {
    previousCard();
  }
};

watch(studySet, (newSet) => {
  if (newSet && recognition) {
    recognition.lang = newSet.language || 'en-US';
  }
});
// Load data on mount
onMounted(() => {
  fetchStudySet();
  window.addEventListener('keydown', handleKeyPress);
  initSpeechRecognition();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
  if (recognition) {
    recognition.abort();
  }
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
