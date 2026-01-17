<template>
  <div class="feature-showcase">
    <div class="feature-icon-wrapper">
      <div :class="['feature-icon-container', `bg-${iconColor}-500/20`]">
        <svg v-if="iconType === 'ai'" :class="['feature-icon', `text-${iconColor}-400`]" fill="none"
          stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <svg v-else-if="iconType === 'language'" :class="['feature-icon', `text-${iconColor}-400`]" fill="none"
          stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <svg v-else-if="iconType === 'flash'" :class="['feature-icon', `text-${iconColor}-400`]" fill="none"
          stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <svg v-else-if="iconType === 'stats'" :class="['feature-icon', `text-${iconColor}-400`]" fill="none"
          stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <svg v-else-if="iconType === 'voice'" :class="['feature-icon', `text-${iconColor}-400`]" fill="none"
          stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <svg v-else-if="iconType === 'deck'" :class="['feature-icon', `text-${iconColor}-400`]" fill="none"
          stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
    </div>

    <div class="feature-content">
      <h3 class="text-xl font-bold text-white mb-2">{{ title }}</h3>
      <p class="text-gray-400 text-sm leading-relaxed">{{ description }}</p>

      <ul v-if="features && features.length" class="mt-4 space-y-2">
        <li v-for="(feature, index) in features" :key="index" class="flex items-start text-sm text-gray-300">
          <svg class="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{{ feature }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  iconType: 'ai' | 'language' | 'flash' | 'stats' | 'voice' | 'deck';
  iconColor: string;
  title: string;
  description: string;
  features?: string[];
}>();
</script>

<style scoped>
.feature-showcase {
  @apply bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm;
  @apply rounded-xl p-6 border-2 border-gray-700;
  @apply hover:border-gray-600 transition-all duration-300;
  @apply shadow-lg hover:shadow-2xl;
}

.feature-icon-wrapper {
  @apply mb-4;
}

.feature-icon-container {
  @apply w-16 h-16 rounded-full flex items-center justify-center;
}

.feature-icon {
  @apply w-8 h-8;
}

.feature-content {
  @apply space-y-2;
}
</style>
