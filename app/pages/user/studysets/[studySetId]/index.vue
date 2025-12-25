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
        <NuxtLink to="/user/dashboard"
          class="mt-4 inline-block text-indigo-400 hover:text-indigo-300 transition-colors">
          ← Back to Dashboard
        </NuxtLink>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="studySet" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Back Button -->
      <NuxtLink to="/user/dashboard"
        class="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </NuxtLink>

      <!-- Study Set Header -->
      <div class="bg-gray-800/60 backdrop-blur-sm rounded-lg shadow-xl p-8 mb-8 border border-gray-700">
        <div v-if="!isEditingInfo" class="space-y-4">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h1 class="text-4xl font-bold text-white mb-3">{{ studySet.title }}</h1>
              <p v-if="studySet.description" class="text-gray-300 text-lg">{{ studySet.description }}</p>
              <p v-else class="text-gray-500 italic">No description</p>
            </div>
            <button @click="startEditingInfo"
              class="ml-4 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div class="flex items-center space-x-6 text-sm text-gray-400">
              <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <span>{{ studySet.flashCards?.length || 0 }} cards</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Created {{ formatDate(studySet.createdAt) }}</span>
              </div>
            </div>
            <NuxtLink :to="`/user/studysets/${studySetId}/practice`"
              v-if="studySet.flashCards && studySet.flashCards.length > 0"
              class="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-lg">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Practice Now
            </NuxtLink>
          </div>
        </div>

        <!-- Edit Mode -->
        <div v-else class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input v-model="editForm.title" type="text"
              class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Study set title" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea v-model="editForm.description" rows="3"
              class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Optional description"></textarea>
          </div>
          <div class="flex space-x-3">
            <button @click="saveStudySetInfo" :disabled="isSaving"
              class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:opacity-50 text-white rounded-lg transition-colors font-medium">
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
            <button @click="cancelEditingInfo" :disabled="isSaving"
              class="px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Actions Bar -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-white">Flash Cards</h2>
        <button @click="showAddCardModal = true"
          class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium shadow-lg">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Card
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="!studySet.flashCards || studySet.flashCards.length === 0"
        class="bg-gray-800/40 backdrop-blur-sm rounded-lg p-12 text-center border border-gray-700">
        <svg class="w-20 h-20 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 class="text-xl font-semibold text-gray-400 mb-2">No flash cards yet</h3>
        <p class="text-gray-500 mb-6">Get started by adding your first flash card</p>
        <button @click="showAddCardModal = true"
          class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium">
          Add Your First Card
        </button>
      </div>

      <!-- Flash Cards Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="card in studySet.flashCards" :key="card.id"
          class="bg-gray-800/60 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700 hover:border-indigo-500 transition-all group">
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <span class="text-xs font-semibold text-indigo-400 uppercase tracking-wide">Question</span>
              <button @click="deleteCard(card.id)"
                class="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <p class="text-white font-medium mb-6 min-h-[3rem]">{{ card.question }}</p>

            <div class="border-t border-gray-700 pt-4">
              <span class="text-xs font-semibold text-green-400 uppercase tracking-wide mb-2 block">Answer</span>
              <p class="text-gray-300">{{ card.answer }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Card Modal -->
      <div v-if="showAddCardModal"
        class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        @click.self="closeAddCardModal">
        <div class="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full p-8 border border-gray-700">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold text-white">Add New Flash Card</h3>
            <button @click="closeAddCardModal" class="text-gray-400 hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="addCard" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Question</label>
              <textarea v-model="newCard.question" rows="3" required
                class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Enter the question..."></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Answer</label>
              <textarea v-model="newCard.answer" rows="3" required
                class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Enter the answer..."></textarea>
            </div>

            <div class="flex space-x-3 pt-4">
              <button type="submit" :disabled="isAddingCard || !newCard.question || !newCard.answer"
                class="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:opacity-50 text-white rounded-lg transition-colors font-medium">
                {{ isAddingCard ? 'Adding...' : 'Add Card' }}
              </button>
              <button type="button" @click="closeAddCardModal" :disabled="isAddingCard"
                class="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="deleteConfirmCard"
        class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        @click.self="deleteConfirmCard = null">
        <div class="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-8 border border-gray-700">
          <h3 class="text-2xl font-bold text-white mb-4">Delete Flash Card?</h3>
          <p class="text-gray-300 mb-6">Are you sure you want to delete this flash card? This action cannot be undone.
          </p>

          <div class="flex space-x-3">
            <button @click="confirmDelete" :disabled="isDeleting"
              class="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white rounded-lg transition-colors font-medium">
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </button>
            <button @click="deleteConfirmCard = null" :disabled="isDeleting"
              class="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createTranslator } from "short-uuid";
import type { FlashCard } from "~~/shared/types/definitions/flash-card";
import type { StudySet } from "~~/shared/types/definitions/study-set";

const route = useRoute();

// This id is a shortened UUID. Before we use it to fetch data, we need to convert it back to full UUID using the short-uuid library
const studySetId = route.params.studySetId as string;

definePageMeta({
  auth: true,
  middleware: ['sidebase-auth'],
  layout: 'headerbar'
})

// State
const loading = ref(true);
const error = ref<string | null>(null);
const studySet = ref<StudySet & { flashCards?: FlashCard[] } | null>(null);

// Edit mode state
const isEditingInfo = ref(false);
const isSaving = ref(false);
const editForm = ref({
  title: "",
  description: "",
});

// Add card state
const showAddCardModal = ref(false);
const isAddingCard = ref(false);
const newCard = ref({
  question: "",
  answer: "",
});

// Delete card state
const deleteConfirmCard = ref<string | null>(null);
const isDeleting = ref(false);

// Fetch study set data
const fetchStudySet = async () => {
  try {
    loading.value = true;
    error.value = null;

    const translator = createTranslator();
    const fullUuid = translator.toUUID(studySetId);

    const response = await $fetch<{ success: boolean; data: StudySet & { flashCards: FlashCard[] } }>(
      `/api/studysets/${fullUuid}`
    );

    if (response.success) {
      studySet.value = response.data;
    }
  } catch (err: any) {
    console.error("Error fetching study set:", err);
    error.value = err.data?.statusMessage || "Failed to load study set";
  } finally {
    loading.value = false;
  }
};

// Edit study set info
const startEditingInfo = () => {
  editForm.value = {
    title: studySet.value?.title || "",
    description: studySet.value?.description || "",
  };
  isEditingInfo.value = true;
};

const cancelEditingInfo = () => {
  isEditingInfo.value = false;
  editForm.value = { title: "", description: "" };
};

const saveStudySetInfo = async () => {
  if (!editForm.value.title.trim()) return;

  try {
    isSaving.value = true;

    const response = await $fetch<{ success: boolean; data: StudySet }>(
      `/api/studysets/${studySetId}`,
      {
        method: "PATCH",
        body: {
          title: editForm.value.title,
          description: editForm.value.description || null,
        },
      }
    );

    if (response.success && studySet.value) {
      studySet.value.title = response.data.title;
      studySet.value.description = response.data.description;
      isEditingInfo.value = false;
    }
  } catch (err: any) {
    console.error("Error updating study set:", err);
    alert(err.data?.statusMessage || "Failed to update study set");
  } finally {
    isSaving.value = false;
  }
};

// Add flash card
const closeAddCardModal = () => {
  showAddCardModal.value = false;
  newCard.value = { question: "", answer: "" };
};

const addCard = async () => {
  if (!newCard.value.question.trim() || !newCard.value.answer.trim()) return;

  try {
    isAddingCard.value = true;

    const response = await $fetch<{ success: boolean; data: FlashCard }>(
      `/api/studysets/${studySetId}/cards`,
      {
        method: "POST",
        body: {
          question: newCard.value.question,
          answer: newCard.value.answer,
        },
      }
    );

    if (response.success && studySet.value) {
      if (!studySet.value.flashCards) {
        studySet.value.flashCards = [];
      }
      studySet.value.flashCards.push(response.data);
      closeAddCardModal();
    }
  } catch (err: any) {
    console.error("Error adding card:", err);
    alert(err.data?.statusMessage || "Failed to add flash card");
  } finally {
    isAddingCard.value = false;
  }
};

// Delete flash card
const deleteCard = (cardId: string) => {
  deleteConfirmCard.value = cardId;
};

const confirmDelete = async () => {
  if (!deleteConfirmCard.value) return;

  try {
    isDeleting.value = true;

    const response = await $fetch<{ success: boolean }>(
      `/api/studysets/${studySetId}/cards/${deleteConfirmCard.value}`,
      {
        method: "DELETE",
      }
    );

    if (response.success && studySet.value?.flashCards) {
      studySet.value.flashCards = studySet.value.flashCards.filter(
        (card) => card.id !== deleteConfirmCard.value
      );
      deleteConfirmCard.value = null;
    }
  } catch (err: any) {
    console.error("Error deleting card:", err);
    alert(err.data?.statusMessage || "Failed to delete flash card");
  } finally {
    isDeleting.value = false;
  }
};

// Utility functions
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Load data on mount
onMounted(() => {
  fetchStudySet();
});
</script>