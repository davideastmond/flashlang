<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center p-8">
    <div class="w-full max-w-md">
      <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 sm:p-12 shadow-2xl">
        <!-- Logo -->
        <div class="text-4xl font-extrabold tracking-tight mb-8 text-center">
          <span class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Flash</span>
          <span class="text-slate-100">lang</span>
        </div>

        <!-- Header -->
        <h1 class="text-3xl font-bold text-slate-50 text-center mb-2 tracking-tight">Welcome Back</h1>
        <p class="text-slate-400 text-center mb-8 text-sm">Sign in to continue your learning journey</p>

        <!-- Login Form -->
        <form @submit.prevent="handleSignin" class="space-y-5">
          <!-- Email Field -->
          <div>
            <label for="email" class="block text-slate-300 text-sm font-medium mb-2">Email</label>
            <input type="email" id="email" v-model="email" placeholder="your@email.com" required
              class="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:bg-white/8 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300" />
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-slate-300 text-sm font-medium mb-2">Password</label>
            <input type="password" id="password" v-model="password" placeholder="••••••••" required
              class="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:bg-white/8 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300" />
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between text-sm mb-2">
            <label class="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input type="checkbox" v-model="rememberMe"
                class="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer" />
              <span>Remember me</span>
            </label>
            <a href="#" class="text-purple-400 hover:text-purple-300 font-medium transition-colors">
              Forgot password?
            </a>
          </div>

          <!-- Submit Button -->
          <button type="submit"
            class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 mt-6">
            Sign In
          </button>
        </form>
        <p v-if="apiError" class="mt-4 text-sm text-red-500 text-center">{{ apiError }}</p>
        <!-- Sign Up Link -->
        <div class="text-center mt-7 text-sm text-slate-400">
          Don't have an account?
          <NuxtLink to="/signup" class="text-purple-400 hover:text-purple-300 font-semibold ml-1 transition-colors">
            Sign up
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { signIn } = useAuth();
const email = ref('')
const password = ref('')
const rememberMe = ref(false)

const apiError = ref<string | null>(null)

const handleSignin = async () => {
  apiError.value = null;

  try {
    const { error } = await signIn('credentials', {
      redirect: false,
      email: email.value,
      password: password.value,
      callbackUrl: '/user/dashboard',
    })
    if (error) {
      apiError.value = error;
      return;
    }
    // If all goes ok, redirect to dashboard
    await navigateTo('/user/dashboard');
  } catch (error) {
    apiError.value = 'An unexpected error occurred. Please try again later.';
    console.error('SignIn error:', error)
  }
}
</script>