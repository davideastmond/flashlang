<template>
  <footer class="bg-gray-900 text-gray-300 px-4 pt-8 pb-4 mt-auto md:px-4 md:pt-8 md:pb-4">
    <div class="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-6">
      <div>
        <h3 class="text-2xl font-semibold mb-2 text-white">FlashLang</h3>
        <p class="text-gray-400 leading-relaxed">Master languages through smart flashcards powered by AI</p>
      </div>

      <div>
        <h4 class="text-lg font-medium mb-3 text-white">Quick Links</h4>
        <ul class="list-none p-0 m-0 space-y-2">
          <li>
            <NuxtLink to="/" class="text-gray-400 hover:text-blue-400 transition-colors duration-300 no-underline">Home
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/user/dashboard"
              class="text-gray-400 hover:text-blue-400 transition-colors duration-300 no-underline">Dashboard</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/user/studysets/new"
              class="text-gray-400 hover:text-blue-400 transition-colors duration-300 no-underline">Create Study Set
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div>
        <h4 class="text-lg font-medium mb-3 text-white">Resources</h4>
        <ul class="list-none p-0 m-0 space-y-2">
          <li><a href="#about"
              class="text-gray-400 hover:text-blue-400 transition-colors duration-300 no-underline">About</a></li>
          <li><a href="#help"
              class="text-gray-400 hover:text-blue-400 transition-colors duration-300 no-underline">Help</a></li>
          <li><a href="#privacy"
              class="text-gray-400 hover:text-blue-400 transition-colors duration-300 no-underline">Privacy Policy</a>
          </li>
        </ul>
      </div>

      <div>
        <h4 class="text-lg font-medium mb-3 text-white">Connect</h4>
        <ul class="list-none p-0 m-0 space-y-2">
          <li><a href="#contact"
              class="text-gray-400 hover:text-blue-400 transition-colors duration-300 no-underline">Contact Us</a></li>
          <li><a href="#feedback"
              class="text-gray-400 hover:text-blue-400 transition-colors duration-300 no-underline">Feedback</a></li>
        </ul>
      </div>
    </div>

    <div class="max-w-screen-xl mx-auto pt-6 border-t border-gray-700 text-center text-gray-500 text-sm">
      <p>&copy; {{ currentYear }} FlashLang. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = computed(() => new Date().getFullYear())
</script>
