<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3>FlashLang</h3>
        <p>Master languages through smart flashcards powered by AI</p>
      </div>

      <div class="footer-section">
        <h4>Quick Links</h4>
        <ul>
          <li>
            <NuxtLink to="/">Home</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/user/dashboard">Dashboard</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/user/studysets/new">Create Study Set</NuxtLink>
          </li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>Resources</h4>
        <ul>
          <li><a href="#about">About</a></li>
          <li><a href="#help">Help</a></li>
          <li><a href="#privacy">Privacy Policy</a></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>Connect</h4>
        <ul>
          <li><a href="#contact">Contact Us</a></li>
          <li><a href="#feedback">Feedback</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; {{ currentYear }} FlashLang. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer {
  background-color: #1a1a1a;
  color: #e0e0e0;
  padding: 2rem 1rem 1rem;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  padding-bottom: 1.5rem;
}

.footer-section h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #ffffff;
}

.footer-section h4 {
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
  color: #ffffff;
}

.footer-section p {
  color: #b0b0b0;
  line-height: 1.5;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section ul li {
  margin-bottom: 0.5rem;
}

.footer-section a {
  color: #b0b0b0;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-section a:hover {
  color: #4a9eff;
}

.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 1.5rem;
  border-top: 1px solid #333;
  text-align: center;
  color: #808080;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .footer {
    padding: 1.5rem 1rem 0.75rem;
  }
}
</style>
