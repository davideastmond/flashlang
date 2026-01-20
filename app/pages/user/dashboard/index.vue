<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Quick Actions -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Create New Study Set Card -->
          <div
            class="bg-gray-800/60 backdrop-blur-sm rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-2xl hover:bg-gray-800/80 transition-all border-2 border-gray-700 hover:border-indigo-500">
            <NuxtLink to="/user/studysets/new">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-12 w-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-white">Create New Study Set</h3>
                  <p class="text-sm text-gray-400">Create a new study and new flashcards</p>
                </div>
              </div>
            </NuxtLink>
          </div>

          <!-- Browse Sessions Card -->
          <div
            class="bg-gray-800/60 backdrop-blur-sm rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-2xl hover:bg-gray-800/80 transition-all border-2 border-gray-700 hover:border-green-500">
            <NuxtLink to="/user/studysets/view">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-12 w-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-white">Browse Study Sets</h3>
                  <p class="text-sm text-gray-400">View all your study sets</p>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-white mb-4">Your Progress</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-gray-800/60 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-400">Total Study Sets</p>
                <p class="text-2xl font-bold text-white mt-1">{{ stats?.totalStudySets }}</p>
              </div>
              <div class="p-3 bg-blue-500/20 rounded-full">
                <svg class="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-gray-800/60 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-400">Total Study Sessions</p>
                <p class="text-2xl font-bold text-white mt-1">{{ stats?.totalStudySessions }}</p>
              </div>
              <div class="p-3 bg-blue-500/20 rounded-full">
                <svg class="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-gray-800/60 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-400">Flash Cards</p>
                <p class="text-2xl font-bold text-white mt-1">{{ stats?.totalCards }}</p>
              </div>
              <div class="p-3 bg-green-500/20 rounded-full">
                <svg class="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-gray-800/60 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-400">Study Streak</p>
                <p class="text-2xl font-bold text-white mt-1">{{ stats?.studyStreak }} days</p>
              </div>
              <div class="p-3 bg-yellow-500/20 rounded-full">
                <svg class="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-gray-800/60 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-400">Accuracy</p>
                <p class="text-2xl font-bold text-white mt-1">{{ stats?.accuracy }}%</p>
              </div>
              <div class="p-3 bg-purple-500/20 rounded-full">
                <svg class="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent History -->
      <div>
        <h2 class="text-xl font-semibold text-white mb-4">Recent History</h2>
        <div class="bg-gray-800/60 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden border border-gray-700">
          <div v-if="stats?.recentSessions.length === 0" class="p-8 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-white">No sessions yet</h3>
            <p class="mt-1 text-sm text-gray-400">Get started by creating your first study set of cards.</p>
            <div class="mt-6">
              <button @click="handleCreateSession"
                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900">
                <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Create Study Set
              </button>
            </div>
          </div>

          <ul v-else class="divide-y divide-gray-700">
            <NuxtLink v-for="session in stats?.recentSessions" :key="session.id"
              :to="`/user/studysets/${toShortenedUuid(session.studySetId)}`" class="block">
              <li class="p-4 sm:p-6 hover:bg-gray-700/50 cursor-pointer transition-colors">
                <div class="flex items-center justify-between">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-2">
                      <h3 class="text-sm font-medium text-white truncate">{{ session.title }}</h3>

                    </div>
                    <div class="flex items-center text-sm text-gray-400 space-x-4">
                      <span class="flex items-center">
                        <svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ formatDate(new Date(session.startTime)) }}
                      </span>
                      <span class="flex items-center">
                        <svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        {{ session.totalCount }} cards
                      </span>
                      <span v-if="session.correctCount !== null" class="flex items-center">
                        <svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ session.correctCount !== undefined && session.totalCount !== 0 ?
                          Math.round((session.correctCount / session.totalCount) * 100) : 0 }}% correct
                      </span>
                    </div>
                  </div>
                  <div class="ml-4 flex-shrink-0">
                    <svg class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </li>
            </NuxtLink>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
definePageMeta({
  auth: true,
  middleware: ['sidebase-auth'],
  layout: 'user-layout'
});

type StatsType = {
  totalStudySets: number;
  totalStudySessions: number;
  totalCards: number;
  studyStreak: number;
  accuracy: number;
  recentSessions: Array<{
    id: string;
    title: string;
    startTime: string;
    totalCount: number;
    correctCount: number;
    studySetId: string;
  }>;
}


const { data: stats } = await useFetch<StatsType>('/api/user/profile/stats');

// Handle create session
async function handleCreateSession() {
  // Navigate to create session page
  await navigateTo('/user/studysets/new');
}

// Format date
function formatDate(date: Date): string {
  dayjs.extend(relativeTime);
  return dayjs(date).fromNow();
}
</script>

<style scoped>
/* Dark mode glass-morphism effect */
.backdrop-blur-sm {
  backdrop-filter: blur(12px);
}

/* Smooth transitions for interactive elements */
button,
div[class*="cursor-pointer"] {
  transition: all 0.2s ease-in-out;
}

/* Custom scrollbar for dark mode */
:deep(*) {
  scrollbar-width: thin;
  scrollbar-color: #4b5563 #1f2937;
}

:deep(*::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}

:deep(*::-webkit-scrollbar-track) {
  background: #1f2937;
  border-radius: 4px;
}

:deep(*::-webkit-scrollbar-thumb) {
  background: #4b5563;
  border-radius: 4px;
}

:deep(*::-webkit-scrollbar-thumb:hover) {
  background: #6b7280;
}

/* Enhanced hover effects for cards */
.hover\:shadow-2xl:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.hover\:shadow-lg:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
}
</style>
