import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { defineStore } from 'pinia';

export const useDarkModeStore = defineStore('darkMode', () => {
  const isDark = ref(false);

  function toggleDarkMode() {
    isDark.value = !isDark.value;
  }

  // Persist dark mode setting
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
  }

  watch(isDark, (newValue) => {
    try {
      localStorage.setItem('darkMode', JSON.stringify(newValue));
    } catch (e) {
      console.warn('Failed to save dark mode setting:', e);
    }
  });

  return {
    isDark,
    toggleDarkMode
  };
});

export function useDarkMode() {
  const $q = useQuasar();
  const darkModeStore = useDarkModeStore();

  // Sync Quasar dark mode with our store
  watch(() => darkModeStore.isDark, (isDark) => {
    $q.dark.set(isDark);
  }, { immediate: true });

  // Also watch Quasar's dark mode changes
  watch(() => $q.dark.isActive, (isDark) => {
    if (isDark !== darkModeStore.isDark) {
      darkModeStore.isDark = isDark;
    }
  });

  return {
    isDark: darkModeStore.isDark,
    toggleDarkMode: darkModeStore.toggleDarkMode
  };
}
