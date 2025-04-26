import { ref, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { defineStore } from 'pinia';

export const useDarkModeStore = defineStore('darkMode', () => {
  const isDark = ref(false);

  function toggleDarkMode() {
    isDark.value = !isDark.value;
  }

  function setDarkMode(value: boolean) {
    isDark.value = value;
  }

  // Initialize dark mode from localStorage
  function initDarkMode() {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      // Handle both boolean strings and Quasar's format
      try {
        if (savedDarkMode.startsWith('__q_bool')) {
          isDark.value = savedDarkMode.includes('|1');
        } else {
          isDark.value = JSON.parse(savedDarkMode);
        }
      } catch (e) {
        console.warn('Failed to parse dark mode setting:', e);
        isDark.value = false;
      }
    } else {
      // Check for system preference if no saved setting
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      isDark.value = prefersDark;
    }
  }

  // Initialize on store creation
  initDarkMode();

  // Persist dark mode setting
  watch(isDark, (newValue) => {
    try {
      localStorage.setItem('darkMode', JSON.stringify(newValue));
      // Dispatch a custom event to notify other components
      window.dispatchEvent(new CustomEvent('dark-mode-changed', { detail: newValue }));
    } catch (e) {
      console.warn('Failed to save dark mode setting:', e);
    }
  });

  return {
    isDark,
    toggleDarkMode,
    setDarkMode,
    initDarkMode
  };
});

export function useDarkMode() {
  const $q = useQuasar();
  const darkModeStore = useDarkModeStore();

  onMounted(() => {
    // Ensure dark mode is properly initialized
    darkModeStore.initDarkMode();

    // Apply the dark mode setting to Quasar
    $q.dark.set(darkModeStore.isDark);
  });

  // Sync Quasar dark mode with our store
  watch(() => darkModeStore.isDark, (isDark) => {
    $q.dark.set(isDark);
    // Force body class update
    if (isDark) {
      document.body.classList.add('body--dark');
    } else {
      document.body.classList.remove('body--dark');
    }
  }, { immediate: true });

  // Also watch Quasar's dark mode changes
  watch(() => $q.dark.isActive, (isDark) => {
    if (isDark !== darkModeStore.isDark) {
      darkModeStore.setDarkMode(isDark);
    }
  });

  // Listen for dark mode changes from other components
  window.addEventListener('dark-mode-changed', (event) => {
    const isDark = (event as CustomEvent).detail;
    if (isDark !== darkModeStore.isDark) {
      darkModeStore.setDarkMode(isDark);
    }
  });

  return {
    isDark: darkModeStore.isDark,
    toggleDarkMode: darkModeStore.toggleDarkMode
  };
}
