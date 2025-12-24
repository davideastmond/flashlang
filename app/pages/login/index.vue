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

        <!-- Google Sign In Button -->
        <button type="button"
          class="w-full bg-white text-gray-800 font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-xl mb-7">
          <svg class="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4" />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853" />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05" />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <!-- Divider -->
        <div class="relative my-7">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-white/10"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-4 bg-white/5 text-slate-500">or</span>
          </div>
        </div>

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
  // Add your login logic here
  const res = await signIn('credentials', {
    redirect: true,
    email: email.value,
    password: password.value,
    callbackUrl: '/dashboard'
  });

  if (res?.error) {
    apiError.value = res.error;
    console.error('SignIn error:', res.error);

    return;
  }
  console.log('SignIn response:', res);
}
</script>