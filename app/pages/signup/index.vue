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

        <!-- Sign Up Form -->
        <form @submit.prevent="handleSignup" class="space-y-5">
          <!-- Name Fields -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-slate-300 text-sm font-medium mb-2">First Name</label>
              <input type="text" id="firstName" v-model="firstName" placeholder="John" required
                class="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:bg-white/8 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300" />
              <p class="text-red-400 text-sm mt-1.5" v-if="validationErrors.firstName">{{ validationErrors.firstName }}
              </p>
            </div>

            <div>
              <label for="lastName" class="block text-slate-300 text-sm font-medium mb-2">Last Name</label>
              <input type="text" id="lastName" v-model="lastName" placeholder="Doe" required
                class="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:bg-white/8 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300" />
              <p class="text-red-400 text-sm mt-1.5" v-if="validationErrors.lastName">{{ validationErrors.lastName }}
              </p>
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
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim(),
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
      return;
    }
  }

  try {
    await $fetch('/api/signup', {
      method: 'POST',
      body: requestBody
    })
    // Add your signup logic here
    await signIn("credentials", {
      email: email.value,
      password: password1.value,
      redirect: true,
      callbackUrl: '/user/dashboard'
    })
  } catch (error) {
    console.error("Signup API error:", error);
    apiError.value = "Signup failed. Please try again"
  }
  finally {
    isBusy.value = false;
  }
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