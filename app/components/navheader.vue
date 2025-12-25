<template>
  <!-- Navigation -->
  <nav
    class="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 backdrop-blur-sm shadow-lg border-b border-gray-700 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink to="/user/dashboard" class="flex items-center space-x-2">
          <div class="bg-blue-600 p-2 rounded-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white">FlashLang</h1>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-8">
          <NuxtLink to="/user/dashboard" class="text-gray-300 hover:text-white transition-colors font-medium">
            Dashboard
          </NuxtLink>
          <NuxtLink to="/user/studysets/view" class="text-gray-300 hover:text-white transition-colors font-medium">
            Study Sets
          </NuxtLink>
          <NuxtLink to="/user/studysets/new" class="text-gray-300 hover:text-white transition-colors font-medium">
            Create Set
          </NuxtLink>
          <NuxtLink to="/user/flashcards" class="text-gray-300 hover:text-white transition-colors font-medium">
            Flash Cards
          </NuxtLink>
          <NuxtLink to="/user/progress" class="text-gray-300 hover:text-white transition-colors font-medium">
            Progress
          </NuxtLink>
        </div>

        <!-- Desktop User Menu -->
        <div class="hidden md:flex items-center space-x-4">
          <span class="text-sm text-gray-300">{{ displayText }}</span>
          <button @click="handleSignOut"
            class="p-2 text-white bg-red-600/90 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900 transition-colors"
            title="Sign Out">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        <!-- Mobile Hamburger Button -->
        <button @click="toggleMenu"
          class="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          aria-label="Toggle menu">
          <svg v-if="!isMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Slide Menu -->
    <Transition enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="transform translate-x-full" enter-to-class="transform translate-x-0"
      leave-active-class="transition-transform duration-300 ease-in" leave-from-class="transform translate-x-0"
      leave-to-class="transform translate-x-full">
      <div v-if="isMenuOpen" class="fixed inset-y-0 right-0 w-64 bg-gray-800 shadow-2xl md:hidden top-[65px]">
        <div class="flex flex-col h-[500px] bg-gray-900">
          <!-- Mobile Menu Header -->
          <div class="p-4 border-b border-gray-700">
            <p class="text-sm text-gray-400">Welcome back,</p>
            <p class="text-white font-medium">{{ displayText }}</p>
          </div>

          <!-- Mobile Menu Items -->
          <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <NuxtLink to="/user/dashboard" @click="closeMenu"
              class="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </NuxtLink>
            <NuxtLink to="/user/studysets/view" @click="closeMenu"
              class="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Study Sets
            </NuxtLink>
            <NuxtLink to="/user/studysets/new" @click="closeMenu"
              class="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Set
            </NuxtLink>
            <NuxtLink to="/flashcards" @click="closeMenu"
              class="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Flash Cards
            </NuxtLink>
            <NuxtLink to="/progress" @click="closeMenu"
              class="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Progress
            </NuxtLink>
          </nav>

          <!-- Mobile Menu Footer -->
          <div class="p-4 border-t border-gray-700">
            <button @click="handleSignOut"
              class="w-full px-4 py-3 text-sm font-medium text-white bg-red-600/90 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Mobile Menu Overlay -->
    <Transition enter-active-class="transition-opacity duration-300 ease-out" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition-opacity duration-300 ease-in"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="isMenuOpen" @click="closeMenu" class="fixed inset-0 bg-black/50 md:hidden" style="z-index: -1;" />
    </Transition>
  </nav>
</template>

<script setup lang="ts">
const { displayText } = defineProps<{
  displayText: string;
}>();

const { signOut } = useAuth();
const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const handleSignOut = async () => {
  closeMenu();
  await signOut({ redirect: true, callbackUrl: '/login' });
};

// Close menu on route change
const route = useRoute();
watch(() => route.path, () => {
  closeMenu();
});
</script>