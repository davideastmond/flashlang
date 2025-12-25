<template>
  <div class="min-h-screen bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">Study Sets</h1>
        <p class="text-gray-400">Browse and select a study set to begin learning</p>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="flex justify-center items-center py-20">
        <LoadingSpinner />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
        <p class="text-red-400">{{ error.message || 'Failed to load study sets' }}</p>
        <button @click="refresh()"
          class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
          Retry
        </button>
      </div>

      <!-- Study Sets Grid -->
      <div v-else>
        <!-- Empty State -->
        <div v-if="!studySets || studySets.length === 0" class="text-center py-20">
          <div class="text-gray-500 mb-4">
            <svg class="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="text-xl font-semibold text-gray-400 mb-2">No Study Sets Found</h3>
            <p class="text-gray-500">Create your first study set to get started</p>
          </div>
          <NuxtLink to="/user/studysets/new"
            class="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Create Study Set
          </NuxtLink>
        </div>

        <!-- Study Sets Grid -->
        <div v-else>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <NuxtLink v-for="studySet in paginatedStudySets" :key="studySet.id" :to="`/studysets/${studySet.id}`"
              class="group bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 cursor-pointer">
              <!-- Card Header -->
              <div class="flex justify-between items-start mb-4">
                <h3 class="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                  {{ studySet.title }}
                </h3>
                <svg class="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors flex-shrink-0 ml-2"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>

              <!-- Card Description -->
              <p class="text-gray-400 text-sm mb-4 line-clamp-3">
                {{ studySet.description || 'No description available' }}
              </p>

              <!-- Card Footer -->
              <div class="flex items-center justify-between pt-4 border-t border-gray-700">
                <div class="flex items-center text-gray-500 text-sm">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>{{ studySet.cardCount || 0 }} cards</span>
                </div>
                <div class="text-gray-500 text-xs">
                  {{ formatDate(studySet.createdAt) }}
                </div>
              </div>
            </NuxtLink>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex justify-center items-center gap-2">
            <button @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1"
              class="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div class="flex gap-1">
              <button v-for="page in visiblePages" :key="page" @click="currentPage = page" :class="[
                'px-4 py-2 rounded-lg transition-colors',
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
              ]">
                {{ page }}
              </button>
            </div>

            <button @click="currentPage = Math.min(totalPages, currentPage + 1)" :disabled="currentPage === totalPages"
              class="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Define types for study sets
import type { StudySet } from '~~/shared/types/definitions/study-set';
definePageMeta({
  auth: true,
  middleware: ['sidebase-auth'],
  layout: 'headerbar'
});
// Protect with authentication

// Pagination state
const currentPage = ref(1);
const itemsPerPage = 9; // 3x3 grid

// Fetch study sets from API
const { data: studySetsResponse, pending, error, refresh } = await useLazyAsyncData<{ success: boolean; data: StudySet[] }>(
  'study-sets',
  async () => {
    const response = await $fetch<{ success: boolean; data: StudySet[] }>('/api/studysets');
    return response;
  }
);

const studySets = computed(() => studySetsResponse.value?.data || []);

// Computed properties for pagination
const totalPages = computed(() => {
  if (!studySets.value) return 0;
  return Math.ceil(studySets.value.length / itemsPerPage);
});

const paginatedStudySets = computed(() => {
  if (!studySets.value) return [];
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return studySets.value.slice(start, end);
});

const visiblePages = computed(() => {
  const pages: number[] = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

// Helper functions
const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Reset to page 1 when study sets change
watch(() => studySets.value, () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
