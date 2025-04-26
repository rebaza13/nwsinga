<template>
  <router-view v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { onMounted, onBeforeMount } from 'vue';
import { useQuasar } from 'quasar';
import { useDarkMode, useDarkModeStore } from 'src/composables/useDarkMode';

const $q = useQuasar();
const { isDark } = useDarkMode();

// Initialize dark mode as early as possible
onBeforeMount(() => {
  // Get dark mode setting from localStorage
  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode !== null) {
    try {
      const darkMode = JSON.parse(savedDarkMode);
      // Apply dark mode immediately
      $q.dark.set(darkMode);
      if (darkMode) {
        document.body.classList.add('body--dark');
      } else {
        document.body.classList.remove('body--dark');
      }
    } catch (e) {
      console.warn('Failed to parse dark mode setting:', e);
    }
  }
});

// Set up viewport meta tag for mobile devices
onMounted(() => {
  // Add viewport-fit=cover for iOS safe area support
  const metaViewport = document.createElement('meta');
  metaViewport.name = 'viewport';
  metaViewport.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
  document.head.appendChild(metaViewport);

  // Force dark mode application
  $q.dark.set(isDark);

  // Add a global event listener for dark mode toggle
  window.addEventListener('keydown', (event) => {
    // Ctrl+Shift+D to toggle dark mode
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
      const darkModeStore = useDarkModeStore();
      darkModeStore.toggleDarkMode();

      // Force immediate update
      $q.dark.set(darkModeStore.isDark);

      // Update body class
      if (darkModeStore.isDark) {
        document.body.classList.add('body--dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.body.classList.remove('body--dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }
  });
});
</script>
