<template>
  <div class="signup-page">
    <div class="signup-container">
      <div class="signup-card">
        <div class="logo">
          <span class="logo-flash">Flash</span>
          <span class="logo-lang">lang</span>
        </div>

        <h1 class="signup-title">Create Your Account</h1>
        <p class="signup-subtitle">Start your language learning journey today</p>

        <div class="signup-form">
          <button class="btn btn-google">
            <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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

          <div class="divider">
            <span>or</span>
          </div>

          <form @submit.prevent="handleSignup" class="form">
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">First Name</label>
                <input type="text" id="firstName" v-model="firstName" placeholder="John" required />
              </div>

              <div class="form-group">
                <label for="lastName">Last Name</label>
                <input type="text" id="lastName" v-model="lastName" placeholder="Doe" required />
              </div>
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" v-model="email" placeholder="your@email.com" required />
            </div>

            <div class="form-group">
              <label for="dateOfBirth">Date of Birth</label>
              <input type="date" id="dateOfBirth" v-model="dateOfBirth" required />
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" v-model="password" placeholder="••••••••" required />
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirm Password</label>
              <input type="password" id="confirmPassword" v-model="confirmPassword" placeholder="••••••••" required />
            </div>

            <div class="terms-checkbox">
              <label class="checkbox-label">
                <input type="checkbox" v-model="agreeToTerms" required />
                <span>I agree to the <a href="#" class="link">Terms of Service</a> and <a href="#" class="link">Privacy
                    Policy</a></span>
              </label>
            </div>

            <button type="submit" class="btn btn-primary">Create Account</button>
          </form>

          <div class="login-prompt">
            Already have an account?
            <NuxtLink to="/login" class="login-link">Sign in</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const dateOfBirth = ref('')
const password = ref('')
const confirmPassword = ref('')
const agreeToTerms = ref(false)

const handleSignup = () => {
  if (password.value !== confirmPassword.value) {
    alert('Passwords do not match')
    return
  }

  console.log('Signup with:', {
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    dateOfBirth: dateOfBirth.value,
    password: password.value,
    agreeToTerms: agreeToTerms.value
  })
  // Add your signup logic here
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.signup-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1429 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.signup-container {
  width: 100%;
  max-width: 520px;
}

.signup-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.5rem;
  padding: 3rem 2.5rem;
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* Logo */
.logo {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 2rem;
  text-align: center;
}

.logo-flash {
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-lang {
  color: #f1f5f9;
}

/* Headers */
.signup-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
  text-align: center;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.signup-subtitle {
  color: #94a3b8;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

/* Buttons */
.btn {
  width: 100%;
  padding: 0.875rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.01em;
}

.btn-google {
  background: white;
  color: #1f2937;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-google:hover {
  background: #f9fafb;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.google-icon {
  width: 20px;
  height: 20px;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
  margin-top: 1.5rem;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(59, 130, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Divider */
.divider {
  position: relative;
  text-align: center;
  margin: 1.75rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.divider span {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  padding: 0 1rem;
  color: #64748b;
  font-size: 0.875rem;
}

/* Form */
.form {
  margin-top: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  color: #cbd5e1;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.625rem;
  color: #f1f5f9;
  font-size: 0.95rem;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.08);
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.form-group input::placeholder {
  color: #64748b;
}

.form-group input[type="date"] {
  color-scheme: dark;
}

.form-group input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

/* Terms Checkbox */
.terms-checkbox {
  margin-bottom: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  color: #cbd5e1;
  font-size: 0.875rem;
  cursor: pointer;
  line-height: 1.5;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin-top: 0.25rem;
  cursor: pointer;
  flex-shrink: 0;
}

.link {
  color: #a78bfa;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.link:hover {
  color: #c4b5fd;
}

/* Login Prompt */
.login-prompt {
  text-align: center;
  margin-top: 1.75rem;
  color: #94a3b8;
  font-size: 0.9rem;
}

.login-link {
  color: #a78bfa;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.login-link:hover {
  color: #c4b5fd;
}

/* Responsive */
@media (max-width: 580px) {
  .signup-card {
    padding: 2rem 1.5rem;
  }

  .signup-title {
    font-size: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>