import { ref, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { defineStore } from 'pinia';

export const useDarkModeStore = defineStore('darkMode', () => {
  const isDark = ref(false);

  function toggleDarkMode() {
    // Toggle the dark mode value
    isDark.value = !isDark.value;

    // Force immediate update to Quasar
    try {
      // Directly update the DOM for immediate visual feedback
      if (isDark.value) {
        document.body.classList.add('body--dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.body.classList.remove('body--dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    } catch (e) {
      console.error('Error updating dark mode:', e);
    }
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
    // Apply dark mode to Quasar
    $q.dark.set(isDark);

    // Force body class update
    if (isDark) {
      document.body.classList.add('body--dark');
    } else {
      document.body.classList.remove('body--dark');
    }

    // Force update on all components by dispatching a global event
    window.dispatchEvent(new CustomEvent('dark-mode-changed', { detail: isDark }));

    // Force update CSS variables
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');

    // Update localStorage directly to ensure persistence
    localStorage.setItem('darkMode', JSON.stringify(isDark));
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
