<template>
  <div class="app">
    <div class="container">
      <header class="header">
        <div class="logo">
          <span class="logo-flash">Flash</span>
          <span class="logo-lang">lang</span>
        </div>
      </header>

      <main class="hero">
        <h1 class="title">
          Master Any Language,<br />
          <span class="highlight">One Flash at a Time</span>
        </h1>
        <p class="subtitle">
          Learn languages faster with AI-powered flashcards. Smart, adaptive, and designed for rapid progress.
        </p>
        <div class="cta-buttons">
          <NuxtLink v-if="status !== 'authenticated'" to="/login">
            <button class="btn btn-primary">Get Started Free</button>
          </NuxtLink>
          <NuxtLink v-else to="/user/dashboard">
            <button class="btn btn-primary">Go to Dashboard</button>
          </NuxtLink>
          <button class="btn btn-secondary">Watch Demo</button>
        </div>
      </main>

      <section class="features">
        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <h3>Lightning Fast</h3>
          <p>Learn at your own pace with instant feedback and progress tracking</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🧠</div>
          <h3>AI-Powered</h3>
          <p>Automated flashcard creation and personalized learning paths</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🌍</div>
          <h3>Multi-Language</h3>
          <p>Support for {{ SUPPORTED_LANGUAGES_COUNT }} languages with native speaker pronunciations</p>
        </div>
      </section>
    </div>
  </div>
</template>
<script setup lang="ts">
import { SUPPORTED_LANGUAGES } from '~~/shared/types/definitions/supported-languages';

const { status } = useAuth();
const SUPPORTED_LANGUAGES_COUNT = SUPPORTED_LANGUAGES.length
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1429 100%);
  color: #e2e8f0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Header Styles */
.header {
  padding: 1.5rem 0 3rem;
}

.logo {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
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

/* Hero Section */
.hero {
  text-align: center;
  padding: 4rem 0 6rem;
  max-width: 900px;
  margin: 0 auto;
}

.title {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -0.03em;
  color: #f8fafc;
}

.highlight {
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.25rem;
  line-height: 1.7;
  color: #cbd5e1;
  margin-bottom: 3rem;
  font-weight: 400;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.01em;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Features Section */
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  padding: 3rem 0;
}

.feature-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(139, 92, 246, 0.3);
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(139, 92, 246, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  filter: grayscale(0.2);
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #f1f5f9;
  letter-spacing: -0.02em;
}

.feature-card p {
  color: #94a3b8;
  line-height: 1.6;
  font-size: 0.95rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .title {
    font-size: 2.5rem;
  }

  .subtitle {
    font-size: 1.1rem;
  }

  .cta-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .features {
    grid-template-columns: 1fr;
  }
}
</style>
