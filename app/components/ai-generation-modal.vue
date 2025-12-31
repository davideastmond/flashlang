<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
      <div class="bg-gray-800 border border-gray-700 rounded-lg max-w-md w-full p-6 shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-white flex items-center space-x-2">
            <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>Create with AI</span>
          </h3>
          <button @click="closeAiModal" class="text-gray-400 hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleFormSubmit" class="space-y-4">
          <!-- Language Select -->
          <div>
            <label for="ai-language" class="block text-sm font-medium text-gray-300 mb-2">
              Language <span class="text-red-400">*</span>
            </label>
            <select id="ai-language" v-model="aiForm.language" required
              class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors">
              <option value="" disabled>Select a language</option>
              <option v-for="lang in SUPPORTED_LANGUAGES" :key="lang.code" :value="lang.code">
                {{ lang.name }}
              </option>
            </select>
            <p v-if="formErrors.language" class="mt-2 text-sm text-red-400">{{ formErrors.language }}</p>
          </div>
          <!-- CEFR Language Select -->
          <div>
            <label for="cefr-language" class="block text-sm font-medium text-gray-300 mb-2">
              CEFR Language <span class="text-red-400">*</span>
            </label>
            <select id="cefr-language" v-model="aiForm.cefrLanguage" required
              class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors">
              <option value="" disabled>Select a CEFR language</option>
              <option v-for="lang in SUPPORTED_LANGUAGES" :key="lang.code" :value="lang.code">
                {{ lang.name }}
              </option>
            </select>
            <p v-if="formErrors.cefrLanguage" class="mt-2 text-sm text-red-400">{{ formErrors.cefrLanguage }}</p>
          </div>
          <!-- CEFR Language level -->
          <div>
            <label for="cefr-level" class="block text-sm font-medium text-gray-300 mb-2">
              CEFR Language Level <span class="text-red-400">*</span>
            </label>
            <select required id="cefr-level" v-model="aiForm.cefrLevel"
              class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors">
              <option value="">Select a level</option>
              <option v-for="cefr in CEFR_LEVELS" :key="cefr" :value="cefr">
                {{ cefr }}
              </option>
            </select>
            <p v-if="formErrors.cefrLevel" class="mt-2 text-sm text-red-400">{{ formErrors.cefrLevel }}</p>
          </div>
          <!-- Language learning areas dropdown-->
          <div>
            <label for="ai-language-area" class="block text-sm font-medium text-gray-300 mb-2">
              Language Learning Area <span class="text-red-400">*</span>
            </label>
            <select id="ai-language-area" v-model="aiForm.languageArea" required
              placeholder="e.g., Basic Vocabulary, Travel Phrases, Business Terms"
              class="w-full px-4 py-3 bg-gray-900 border border-gray- 600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors">
              <option value="">Select a learning area</option>
              <option v-for="area in LANGUAGE_LEARNING_AREAS" :key="area.code" :value="area.code">{{ area.name }}
              </option>
            </select>
            <p v-if="formErrors.languageArea" class="mt-2 text-sm text-red-400">{{ formErrors.languageArea }}</p>
          </div>
          <!-- Number of Flashcards Dropdown -->
          <div>
            <label for="ai-count" class="block text-sm font-medium text-gray-300 mb-2">
              Number of Flashcards
            </label>
            <select id="ai-count" v-model.number="aiForm.count" required
              class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors">
              <option v-for="n in 16" :key="n" :value="n + 4">{{ n + 4 }}</option>
            </select>
          </div>

          <!-- Modal Actions -->
          <div class="flex items-center justify-end gap-3 pt-4">
            <button type="button" @click="closeAiModal"
              class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium">
              Cancel
            </button>
            <button type="submit"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <span>Generate</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
<script lang="ts" setup>
import type { AIFormAttributes } from '~~/shared/types/definitions/ai-form-attributes';
import { CEFR_LEVELS, LANGUAGE_LEARNING_AREAS, SUPPORTED_LANGUAGES } from '~~/shared/types/definitions/supported-languages';
const formErrors = ref<AIFormAttributes>({} as AIFormAttributes);


const { onSubmit, closeAiModal } = defineProps<{
  onSubmit: (attributes: AIFormAttributes) => void;
  closeAiModal: () => void;

}>();

const aiForm = ref<AIFormAttributes>({
  language: 'en-US',
  languageArea: '',
  cefrLanguage: 'en-US',
  count: 10,
  cefrLevel: '',
});

const handleFormSubmit = () => {
  // Handle form submission validation
  if (!validateForm()) {
    return;
  }
  onSubmit(aiForm.value);
  closeAiModal();
}

const validateForm = (): boolean => {
  let isValid = true;

  // Reset errors
  formErrors.value.language = '';
  formErrors.value.languageArea = '';
  formErrors.value.cefrLevel = '';

  // Validate language
  if (!aiForm.value.language) {
    formErrors.value.language = 'Please select a language.';
    isValid = false;
  }

  // Validate cefr Language
  if (!aiForm.value.cefrLanguage) {
    formErrors.value.cefrLanguage = 'Please select a CEFR language.';
    isValid = false;
  }

  // Validate language area
  if (!aiForm.value.languageArea) {
    formErrors.value.languageArea = 'Please select a language learning area.';
    isValid = false;
  }

  // Validate CEFR level
  if (!aiForm.value.cefrLevel) {
    formErrors.value.cefrLevel = 'Please select a CEFR level.';
    isValid = false;
  }

  return isValid;
}

</script>
