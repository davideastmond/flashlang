<template>
  <!-- Header -->
  <header class="bg-gray-800/50 backdrop-blur-sm shadow-lg border-b border-gray-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">FlashLang</h1>
          <p class="text-sm text-gray-300 mt-1">Welcome back, {{ displayText }}!</p>
        </div>
        <button @click="handleSignOut"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600/90 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900 transition-colors">
          Sign Out
        </button>
      </div>
    </div>
  </header>
</template>
<script setup lang="ts">
const { displayText } = defineProps<{
  displayText: string;
}>();

const { signOut } = useAuth();
const handleSignOut = async () => {
  await signOut({ redirect: true, callbackUrl: '/login' });
};
</script>