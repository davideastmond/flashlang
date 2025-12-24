<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center p-8">
    <div class="w-full max-w-lg">
      <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 sm:p-12 shadow-2xl">
        <!-- Logo -->
        <div class="text-4xl font-extrabold tracking-tight mb-8 text-center">
          <span class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Flash</span>
          <span class="text-slate-100">lang</span>
        </div>

        <!-- Header -->
        <h1 class="text-3xl font-bold text-slate-50 text-center mb-2 tracking-tight">Create Your Account</h1>
        <p class="text-slate-400 text-center mb-8 text-sm">Start your language learning journey today</p>

        <!-- Google Sign Up Button -->
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
          Sign up with Google
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

        <!-- Sign Up Form -->
        <form @submit.prevent="handleSignup" class="space-y-5">
          <!-- Name Fields -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-slate-300 text-sm font-medium mb-2">First Name</label>
              <input type="text" id="firstName" v-model="firstName" placeholder="John" required
                class="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:bg-white/8 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300" />
            </div>

            <div>
              <label for="lastName" class="block text-slate-300 text-sm font-medium mb-2">Last Name</label>
              <input type="text" id="lastName" v-model="lastName" placeholder="Doe" required
                class="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:bg-white/8 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300" />
            </div>
          </div>

          <!-- Email Field -->
          <div>
            <label for="email" class="block text-slate-300 text-sm font-medium mb-2">Email</label>
            <input type="email" id="email" v-model="email" placeholder="your@email.com" required
              class="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:bg-white/8 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300" />
            <p class="text-red-400 text-sm mt-1.5" v-if="validationErrors.email">{{ validationErrors.email }}</p>
          </div>

          <!-- Date of Birth Field -->
          <div>
            <label for="dateOfBirth" class="block text-slate-300 text-sm font-medium mb-2">Date of Birth</label>
            <input type="date" id="dateOfBirth" v-model="dateOfBirth" required
              class="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:bg-white/8 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 [color-scheme:dark]" />
            <p class="text-red-400 text-sm mt-1.5" v-if="validationErrors.dateOfBirth">{{ validationErrors.dateOfBirth
            }}</p>
          </div>

          <!-- Password Field -->
          <div>
            <label for="password1" class="block text-slate-300 text-sm font-medium mb-2">Password</label>
            <input type="password" id="password1" v-model="password1" placeholder="••••••••" required
              class="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:bg-white/8 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300" />
            <p class="text-red-400 text-sm mt-1.5" v-if="validationErrors.password1">{{ validationErrors.password1 }}
            </p>
          </div>

          <!-- Confirm Password Field -->
          <div>
            <label for="password2" class="block text-slate-300 text-sm font-medium mb-2">Confirm Password</label>
            <input type="password" id="password2" v-model="password2" placeholder="••••••••" required
              class="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:bg-white/8 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300" />
            <p class="text-red-400 text-sm mt-1.5" v-if="validationErrors.password2">{{ validationErrors.password2 }}
            </p>
          </div>

          <!-- Terms Checkbox -->
          <div class="mb-2">
            <label class="flex items-start gap-2 text-slate-300 text-sm cursor-pointer leading-relaxed">
              <input type="checkbox" v-model="agreeToTerms" required
                class="w-4 h-4 mt-0.5 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer flex-shrink-0" />
              <span>I agree to the <a href="#"
                  class="text-purple-400 hover:text-purple-300 font-medium transition-colors">Terms of Service</a> and
                <a href="#" class="text-purple-400 hover:text-purple-300 font-medium transition-colors">Privacy
                  Policy</a></span>
            </label>
          </div>

          <!-- Submit Button -->
          <button type="submit" :disabled="isBusy"
            class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2">
            Create Account
            <LoadingSpinner v-if="isBusy" />
          </button>
        </form>

        <!-- API Error Message -->
        <p v-if="apiError" class="text-red-400 text-sm mt-4 text-center">{{ apiError }}</p>

        <!-- Login Link -->
        <div class="text-center mt-7 text-sm text-slate-400">
          Already have an account?
          <NuxtLink to="/login" class="text-purple-400 hover:text-purple-300 font-semibold ml-1 transition-colors">
            Sign in
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod';
import { signupFormValidator } from '~~/shared/validators/signup/signup-validator';
const { signIn } = useAuth();
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const dateOfBirth = ref('')
const password1 = ref('')
const password2 = ref('')
const agreeToTerms = ref(false)

const apiError = ref<string | null>(null);
const isBusy = ref(false);
const validationErrors = ref({
  firstName: null as string | null,
  lastName: null as string | null,
  email: null as string | null,
  dateOfBirth: null as string | null,
  password1: null as string | null,
  password2: null as string | null,
  agreeToTerms: null as string | null
})

const handleSignup = async () => {
  resetValidationErrors();
  apiError.value = null;
  isBusy.value = true;
  const requestBody = {
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    dateOfBirth: dateOfBirth.value,
    password1: password1.value,
    password2: password2.value,
  }
  try {
    signupFormValidator.parse(requestBody);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation errors (e.g., display error messages to the user)
      error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof typeof validationErrors.value
        validationErrors.value[field] = issue.message
      })
      return
    }
  }

  const result = await $fetch('/api/signup', {
    method: 'POST',
    body: requestBody
  })

  if (!result.success) {
    apiError.value = 'Signup failed. Please try again: ' + ('errors' in result && result.errors ? result.errors.map((e: any) => e).join(', ') : 'Unknown error')
    isBusy.value = false
    return
  }
  // Add your signup logic here
  await signIn("credentials", {
    email: email.value,
    password: password1.value,
    redirect: true,
    callbackUrl: '/dashboard'
  })
}

function resetValidationErrors() {
  validationErrors.value = {
    firstName: null,
    lastName: null,
    email: null,
    dateOfBirth: null,
    password1: null,
    password2: null,
    agreeToTerms: null
  }
}
</script>