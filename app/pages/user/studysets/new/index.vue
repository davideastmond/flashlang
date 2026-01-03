<template>
  <div class="min-h-screen bg-gray-900">
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">Create New Study Set</h1>
        <p class="text-gray-400">Build your personalized study set with custom flash cards</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- Study Set Details Section -->
        <div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 class="text-2xl font-semibold text-white mb-6">Study Set Details</h2>

          <!-- Title Input -->
          <div class="mb-6">
            <label for="title" class="block text-sm font-medium text-gray-300 mb-2">
              Title <span class="text-red-400">*</span>
            </label>
            <input id="title" v-model="studySet.title" type="text" required
              placeholder="e.g., Spanish Vocabulary - Level 1"
              class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" />
            <p v-if="errors.title" class="mt-2 text-sm text-red-400">{{ errors.title }}</p>
          </div>

          <!-- Description Input -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea id="description" v-model="studySet.description" rows="4"
              placeholder="Describe what this study set covers..."
              class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"></textarea>
          </div>

          <!-- Language Select -->
          <div>
            <label for="language" class="block text-sm font-medium text-gray-300 mb-2">
              Language <span class="text-red-400">*</span>
            </label>
            <select id="language" v-model="studySet.language" required
              class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
              <option value="" disabled>Select a language</option>
              <option v-for="lang in SUPPORTED_LANGUAGES" :key="lang.code" :value="lang.code">
                {{ lang.name }}
              </option>
            </select>
            <p v-if="errors.language" class="mt-2 text-sm text-red-400">{{ errors.language }}</p>
          </div>
        </div>

        <!-- Flash Cards Section -->
        <div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl font-semibold text-white">Flash Cards</h2>
              <p class="text-sm text-gray-400 mt-1">Add at least one flash card to your study set</p>
            </div>
            <span
              class="px-3 py-1 bg-blue-900/30 border border-blue-500 rounded-full text-blue-400 text-sm font-medium">
              {{ flashCards.length }} {{ flashCards.length === 1 ? 'card' : 'cards' }}
            </span>
          </div>

          <!-- Flash Cards List -->
          <div class="space-y-4 mb-6">
            <div v-for="(card, index) in flashCards" :key="card.id"
              class="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
              <div class="flex items-start justify-between mb-4">
                <span class="text-sm font-medium text-gray-400">Card {{ index + 1 }}</span>
                <button type="button" @click="removeCard(index)"
                  class="text-red-400 hover:text-red-300 transition-colors" aria-label="Remove card">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Question -->
                <div>
                  <label :for="`question-${card.id}`" class="block text-xs font-medium text-gray-400 mb-2">
                    Question / Front
                  </label>
                  <textarea :id="`question-${card.id}`" v-model="card.question" rows="3"
                    placeholder="Enter the question..."
                    class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-sm"></textarea>
                </div>

                <!-- Answer -->
                <div>
                  <label :for="`answer-${card.id}`" class="block text-xs font-medium text-gray-400 mb-2">
                    Answer / Back
                  </label>
                  <textarea :id="`answer-${card.id}`" v-model="card.answer" rows="3" placeholder="Enter the answer..."
                    class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-sm"></textarea>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="flashCards.length === 0"
              class="text-center py-12 border-2 border-dashed border-gray-700 rounded-lg">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <p class="text-gray-500 mb-2">No flash cards yet</p>
              <p class="text-sm text-gray-600">Click the button below to add your first card</p>
            </div>
          </div>

          <!-- Add Card Button -->
          <button type="button" @click="addCard"
            class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Flash Card</span>
          </button>

          <p v-if="errors.flashCards" class="mt-4 text-sm text-red-400">{{ errors.flashCards }}</p>
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-between gap-4">
          <NuxtLink to="/studysets/view"
            class="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium">
            Cancel
          </NuxtLink>

          <div class="flex gap-4">
            <button type="button" @click="showAiModal = true" :disabled="isGenerating"
              class="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg v-if="isGenerating" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>Create with AI</span>
            </button>

            <button type="submit"
              class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isSubmitting || isGenerating">
              <svg v-if="isSubmitting" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              <span>{{ isSubmitting || isGenerating ? 'Creating...' : 'Create Study Set' }}</span>
            </button>
          </div>
        </div>
      </form>

      <!-- Success/Error Messages -->
      <div v-if="successMessage" class="mt-6 bg-green-900/20 border border-green-500 rounded-lg p-4">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <p class="text-green-400">{{ successMessage }}</p>
        </div>
      </div>

      <div v-if="errorMessage" class="mt-6 bg-red-900/20 border border-red-500 rounded-lg p-4">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <p class="text-red-400">{{ errorMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Full Screen Loading Overlay -->
    <div v-if="isGenerating" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="text-center">
        <div
          class="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4">
        </div>
        <p class="text-white text-xl font-semibold">Generating flashcards with AI...</p>
        <p class="text-gray-400 mt-2">This may take a moment</p>
      </div>
    </div>

    <!-- AI Generation Modal -->
    <AiGenerationModal v-if="showAiModal" :onSubmit="handleAiGenerate" :closeAiModal="closeAiModal" />
  </div>

</template>

<script setup lang="ts">
import AiGenerationModal from '~/components/ai-generation-modal.vue';
import type { AIFormAttributes } from '~~/shared/types/definitions/ai-form-attributes';
import type { FlashCard } from '~~/shared/types/definitions/flash-card';
import type { StudySet } from '~~/shared/types/definitions/study-set';
import { SUPPORTED_LANGUAGES } from '~~/shared/types/definitions/supported-languages';
import { createStudyValidator } from '~~/shared/validators/create-study-set/create-study-set-validator';

interface Errors {
  title?: string;
  flashCards?: string;
  language?: string;
}

// Page metadata
definePageMeta({
  auth: true,
  middleware: ['sidebase-auth'],
  layout: 'user-layout'
});

// Reactive state
const studySet = ref<Partial<StudySet>>({
  title: '',
  description: '',
  language: ''
});

const flashCards = ref<FlashCard[]>([]);
const errors = ref<Errors>({});
const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// AI Modal state
const showAiModal = ref(false);
const isGenerating = ref(false);

// Generate unique ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Add a new flash card
const addCard = () => {
  flashCards.value.push({
    id: generateId(),
    question: '',
    answer: ''
  });
};

// Remove a flash card
const removeCard = (index: number) => {
  flashCards.value.splice(index, 1);
};

// Handle form submission
const handleSubmit = async () => {
  try {
    createStudyValidator.parse({
      title: studySet.value.title?.trim(),
      description: studySet.value.description?.trim(),
      language: studySet.value.language,
      flashCards: flashCards.value
    })
  } catch (error) {
    //map the errors to the errors object
    if (error instanceof Error && 'issues' in error) {
      const zodError = error as any;
      zodError.issues.forEach((issue: any) => {
        const field: string = issue.path[0];
        (errors.value as any)[field] = issue.message;
      });
    }
    return;
  }

  isSubmitting.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    const response = await createNewStudySet(
      studySet.value.title as string,
      studySet.value.description as string,
      flashCards.value,
      studySet.value.language
    );

    /* Upon the successful creation, we should get the studySet ID back. 
    We can then navigate to its view page where user can add more cards or study. */
    successMessage.value = 'Study set created successfully!';

    // This returns a full uuid for the newly created study set
    if (!response.data) {
      throw new Error('No study set ID returned from API');
    }

    await navigateTo(`/user/studysets/${toShortenedUuid(response.data as string)}`);
  } catch (error) {
    console.error('Error creating study set:', error);
    errorMessage.value = 'Failed to create study set. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};

// Close AI modal
const closeAiModal = () => {
  showAiModal.value = false;
};


// Handle AI generation
const handleAiGenerate = async (attributes: AIFormAttributes) => {
  isGenerating.value = true;
  errorMessage.value = '';

  const concatTitleDescription = `${attributes.cefrLanguage} ${attributes.languageArea} at the ${attributes.cefrLevel} level`
  try {
    // Call the AI API to generate flashcards as a stringified JSON array
    const response = await $fetch('/api/ai/flashcards', {
      method: 'POST',
      body: {
        language: attributes.language,
        cefrLanguage: attributes.cefrLanguage,
        topic: attributes.languageArea,
        flashCardCount: attributes.count
      }
    });

    // If we get an empty array - we intentionally got an aborted response from the Ai Service
    if (Array.isArray(response.flashcards) && response.flashcards.length === 0) {
      errorMessage.value = 'Did not receive a meaningful response from the AI service.';
      return;
    }

    // We received something - attempt to parse it into a JSON array
    let parsedFlashCardData: string | null = null;
    try {
      parsedFlashCardData = JSON.parse(response.flashcards as string)
    } catch (error) {
      errorMessage.value = 'Failed to parse AI generated flashcards response from the server.' + error;
      return;
    }

    studySet.value.title = `${SUPPORTED_LANGUAGES.find(lang => lang.code === attributes.cefrLanguage)?.name || 'Language'} - ${attributes.languageArea} (${attributes.cefrLevel})`;
    studySet.value.description = concatTitleDescription;
    try {
      const aiResponse = await createNewStudySet(
        studySet.value.title as string,
        studySet.value.description as string,
        parsedFlashCardData as unknown as FlashCard[],
        attributes.language
      );
      closeAiModal();
      successMessage.value = `Successfully generated flashcards with AI!`;
      await navigateTo(`/user/studysets/${toShortenedUuid(aiResponse.data as string)}`);
    } catch (error) {
      console.error('Error creating study set from AI generated flashcards:', error);
      errorMessage.value = 'Failed to create study set from AI generated flashcards. Please try    again.';
      return;
    }
  } catch (error) {
    console.error('Error generating flashcards:', error);
    errorMessage.value = 'Failed to generate flashcards with AI. Please try again.';
  } finally {
    isGenerating.value = false;
  }
};

async function createNewStudySet(title: string, description: string, cards: FlashCard[], language?: string) {
  return $fetch('/api/studysets', {
    method: 'POST',
    body: {
      title,
      description,
      flashCards: cards,
      language: language || studySet.value.language
    }
  });
}

// Add initial card on mount
onMounted(() => {
  addCard();
});
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
