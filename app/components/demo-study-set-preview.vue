<template>
  <div
    class="study-set-preview bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg p-6 border-2 border-gray-700 hover:border-indigo-500 transition-all shadow-lg hover:shadow-2xl">
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <h3 class="text-xl font-bold text-white mb-2">{{ title }}</h3>
        <p v-if="description" class="text-sm text-gray-400 mb-3">{{ description }}</p>
      </div>
      <div class="flex-shrink-0 ml-4">
        <div class="px-3 py-1 bg-purple-500/20 rounded-full">
          <span class="text-xs font-semibold text-purple-300">{{ language }}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4 mb-4">
      <div class="text-center p-3 bg-gray-900/50 rounded-lg">
        <div class="text-2xl font-bold text-indigo-400">{{ cardCount }}</div>
        <div class="text-xs text-gray-500 mt-1">Cards</div>
      </div>
      <div v-if="cefrLevel" class="text-center p-3 bg-gray-900/50 rounded-lg">
        <div class="text-2xl font-bold text-green-400">{{ cefrLevel }}</div>
        <div class="text-xs text-gray-500 mt-1">Level</div>
      </div>
      <div class="text-center p-3 bg-gray-900/50 rounded-lg">
        <div class="text-2xl font-bold text-yellow-400">{{ completionRate }}%</div>
        <div class="text-xs text-gray-500 mt-1">Mastered</div>
      </div>
    </div>

    <div v-if="showActions" class="flex space-x-2">
      <button @click="$emit('study')"
        class="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-medium transition-all">
        <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Study
      </button>
      <button @click="$emit('view')"
        class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all">
        <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
  language: string;
  cardCount: number;
  cefrLevel?: string;
  completionRate?: number;
  showActions?: boolean;
}>();

defineEmits<{
  study: [];
  view: [];
}>();
</script>
