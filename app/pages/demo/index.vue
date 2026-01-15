<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-indigo-900/20"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center">
          <h1 class="text-5xl md:text-6xl font-bold text-white mb-6">
            Experience
            <span class="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              FlashLang
            </span>
          </h1>
          <p class="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Discover how AI-powered flashcards can transform your language learning journey.
            Try our interactive demo and see the difference.
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <NuxtLink to="/signup">
              <button
                class="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105">
                Get Started Free
              </button>
            </NuxtLink>
            <button @click="scrollToDemo"
              class="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold shadow-lg transition-all">
              Try Demo Below ↓
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Interactive Demo Section -->
    <section ref="demoSection" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <DemoInteractiveDemo />
    </section>

    <!-- Key Features Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center mb-12">
        <h2 class="text-4xl font-bold text-white mb-4">Powerful Features</h2>
        <p class="text-gray-400 text-lg">Everything you need to master a new language</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DemoFeatureShowcase icon-type="ai" icon-color="purple" title="AI-Powered Generation"
          description="Create flashcards automatically using advanced AI. Just specify your topic and proficiency level."
          :features="[
            'Gemini-Flash AI integration',
            'Custom topics and themes',
            'CEFR level support (A1-C2)',
            'Multiple language areas'
          ]" />

        <DemoFeatureShowcase icon-type="language" icon-color="blue" title="Multi-Language Support"
          description="Learn from 9 different languages with native pronunciations and cultural context." :features="[
            'English, Spanish, French, German',
            'Italian, Dutch, Portuguese',
            'Tagalog and more',
            'Native speaker quality'
          ]" />

        <DemoFeatureShowcase icon-type="flash" icon-color="yellow" title="Smart Flashcards"
          description="Interactive flashcards designed for effective learning and long-term retention." :features="[
            'Flip-to-reveal mechanics',
            'Visual learning aids',
            'Progress tracking',
            'Custom study sets'
          ]" />

        <DemoFeatureShowcase icon-type="voice" icon-color="green" title="Voice Recognition"
          description="Practice pronunciation with Web Speech API integration for real-time feedback." :features="[
            'Speech-to-text answers',
            'Pronunciation practice',
            'Hands-free learning',
            'Real-time feedback'
          ]" />

        <DemoFeatureShowcase icon-type="stats" icon-color="indigo" title="Progress Analytics"
          description="Track your learning journey with detailed statistics and insights." :features="[
            'Study session tracking',
            'Mastery percentages',
            'Learning streaks',
            'Performance charts'
          ]" />

        <DemoFeatureShowcase icon-type="deck" icon-color="pink" title="Organized Study Sets"
          description="Create, organize, and manage your flashcard collections efficiently." :features="[
            'Custom study sets',
            'Easy card management',
            'Set descriptions',
            'Quick access'
          ]" />
      </div>
    </section>

    <!-- Example Study Sets Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center mb-12">
        <h2 class="text-4xl font-bold text-white mb-4">Example Study Sets</h2>
        <p class="text-gray-400 text-lg">See what you can create with FlashLang</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DemoStudySetPreview title="Spanish Basics" description="Essential Spanish vocabulary for beginners"
          language="Spanish" :card-count="25" cefr-level="A1" :completion-rate="80" :show-actions="false" />

        <DemoStudySetPreview title="French Greetings" description="Common greetings and introductions in French"
          language="French" :card-count="15" cefr-level="A1" :completion-rate="100" :show-actions="false" />

        <DemoStudySetPreview title="German Business Terms" description="Professional vocabulary for business German"
          language="German" :card-count="40" cefr-level="B2" :completion-rate="45" :show-actions="false" />

        <DemoStudySetPreview title="Italian Food & Dining" description="Restaurant vocabulary and food terms"
          language="Italian" :card-count="30" cefr-level="A2" :completion-rate="60" :show-actions="false" />

        <DemoStudySetPreview title="Portuguese Travel" description="Essential phrases for traveling in Portugal"
          language="Portuguese" :card-count="35" cefr-level="B1" :completion-rate="72" :show-actions="false" />

        <DemoStudySetPreview title="Dutch Daily Routines" description="Vocabulary for everyday activities"
          language="Dutch" :card-count="20" cefr-level="A2" :completion-rate="90" :show-actions="false" />
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center mb-12">
        <h2 class="text-4xl font-bold text-white mb-4">How It Works</h2>
        <p class="text-gray-400 text-lg">Get started in three simple steps</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="text-center">
          <div
            class="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span class="text-3xl font-bold text-white">1</span>
          </div>
          <h3 class="text-xl font-bold text-white mb-2">Create an Account</h3>
          <p class="text-gray-400">Sign up for free and choose your target language</p>
        </div>

        <div class="text-center">
          <div
            class="w-20 h-20 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span class="text-3xl font-bold text-white">2</span>
          </div>
          <h3 class="text-xl font-bold text-white mb-2">Generate Flashcards</h3>
          <p class="text-gray-400">Use AI to create custom study sets or build your own</p>
        </div>

        <div class="text-center">
          <div
            class="w-20 h-20 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span class="text-3xl font-bold text-white">3</span>
          </div>
          <h3 class="text-xl font-bold text-white mb-2">Start Learning</h3>
          <p class="text-gray-400">Practice daily and track your progress to fluency</p>
        </div>
      </div>
    </section>

    <!-- Technologies Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-8 border-2 border-gray-700">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-white mb-4">Powered by Modern Technology</h2>
          <p class="text-gray-400">Built with cutting-edge tools for the best learning experience</p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div class="p-4">
            <div class="text-4xl mb-2">🤖</div>
            <h4 class="font-semibold text-white">Gemini AI</h4>
            <p class="text-xs text-gray-500">Smart Generation</p>
          </div>
          <div class="p-4">
            <div class="text-4xl mb-2">🧠</div>
            <h4 class="font-semibold text-white">OpenAI</h4>
            <p class="text-xs text-gray-500">Answer Validation</p>
          </div>
          <div class="p-4">
            <div class="text-4xl mb-2">⚡</div>
            <h4 class="font-semibold text-white">Nuxt 4</h4>
            <p class="text-xs text-gray-500">Full-Stack Framework</p>
          </div>
          <div class="p-4">
            <div class="text-4xl mb-2">🗄️</div>
            <h4 class="font-semibold text-white">NeonDB</h4>
            <p class="text-xs text-gray-500">PostgreSQL Database</p>
          </div>
          <div class="p-4">
            <div class="text-4xl mb-2">🎨</div>
            <h4 class="font-semibold text-white">Tailwind CSS</h4>
            <p class="text-xs text-gray-500">Modern Styling</p>
          </div>
          <div class="p-4">
            <div class="text-4xl mb-2">🎤</div>
            <h4 class="font-semibold text-white">Web Speech API</h4>
            <p class="text-xs text-gray-500">Voice Recognition</p>
          </div>
          <div class="p-4">
            <div class="text-4xl mb-2">🔐</div>
            <h4 class="font-semibold text-white">NextAuth</h4>
            <p class="text-xs text-gray-500">Secure Authentication</p>
          </div>
          <div class="p-4">
            <div class="text-4xl mb-2">🚀</div>
            <h4 class="font-semibold text-white">Vercel</h4>
            <p class="text-xs text-gray-500">Fast Deployment</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div
        class="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 rounded-xl p-12 text-center border-2 border-purple-500/50">
        <h2 class="text-4xl font-bold text-white mb-4">Ready to Start Learning?</h2>
        <p class="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Join thousands of language learners using FlashLang to achieve their goals.
          Start your journey today with our free plan.
        </p>
        <div v-if="status !== 'authenticated'" class="flex flex-wrap justify-center gap-4">
          <NuxtLink to="/signup">
            <button
              class="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-lg rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105">
              Create Free Account
            </button>
          </NuxtLink>
          <NuxtLink to="/login">
            <button
              class="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white text-lg rounded-lg font-semibold shadow-lg transition-all">
              Sign In
            </button>
          </NuxtLink>
        </div>
        <div v-else>
          <NuxtLink to="/user/dashboard">
            <button
              class="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-lg rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105">
              Go to Dashboard
            </button>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-800">
      <div class="text-center text-gray-500">
        <p>&copy; 2026 FlashLang. Master languages, one flash at a time.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const { status } = useAuth();
const demoSection = ref<HTMLElement | null>(null);

const scrollToDemo = () => {
  demoSection.value?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};
</script>
