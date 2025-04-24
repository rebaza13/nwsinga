<template>
  <q-page class="q-pa-md">
    <!-- Header Section -->
    <div class="text-h5 q-mb-md">{{ $t('settings.title') }}</div>

    <!-- Settings List -->
    <q-list separator>
      <!-- Language Setting -->
      <q-item>
        <q-item-section>
          <q-item-label>{{ $t('settings.language') }}</q-item-label>
          <q-item-label caption>{{ currentLanguageLabel }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn-dropdown color="primary" :label="currentLanguageLabel" flat>
            <q-list>
              <q-item clickable v-close-popup @click="changeLanguage('en-US')">
                <q-item-section>
                  <q-item-label>{{ $t('settings.english') }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="changeLanguage('ckb')">
                <q-item-section>
                  <q-item-label>{{ $t('settings.kurdish') }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-item-section>
      </q-item>

      <!-- Dark Mode Setting -->
      <q-item>
        <q-item-section>
          <q-item-label>{{ $t('settings.theme') }}</q-item-label>
          <q-item-label caption>{{ isDark ? $t('settings.darkMode') : $t('settings.lightMode') }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="isDark" @update:model-value="toggleDarkMode" color="primary"
            :icon="isDark ? 'dark_mode' : 'light_mode'" />
        </q-item-section>
      </q-item>

      <!-- Theme Preview Card -->
      <q-card class="q-mt-md" :class="{ 'bg-dark text-white': isDark }">
        <q-card-section>
          <div class="text-h6">{{ $t('settings.theme') }} {{ $t('settings.preview') }}</div>
          <p class="q-mt-sm">
            {{ $t('app.title') }}
          </p>
        </q-card-section>
        <q-card-actions>
          <q-btn :color="isDark ? 'primary' : 'primary'" :label="$t('app.save')" flat />
        </q-card-actions>
      </q-card>

      <!-- Color Palette Preview -->
      <div class="q-pa-md q-mt-md">
        <div class="row q-col-gutter-sm">
          <div class="col-4">
            <div class="color-box bg-primary text-white">{{ $t('settings.primary') }}</div>
          </div>
          <div class="col-4">
            <div class="color-box bg-secondary text-white">{{ $t('settings.secondary') }}</div>
          </div>
          <div class="col-4">
            <div class="color-box bg-accent text-white">{{ $t('settings.accent') }}</div>
          </div>
        </div>
      </div>

      <!-- Save Settings Button -->
      <div class="q-mt-lg text-center">
        <q-btn color="primary" :label="$t('app.save')" @click="saveSettings" />
      </div>
    </q-list>
  </q-page>
</template>

<script setup lang="ts">
import { useDarkMode } from 'src/composables/useDarkMode';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const { isDark, toggleDarkMode } = useDarkMode();
const { t, locale } = useI18n({ useScope: 'global' });

// Get current language label
const currentLanguageLabel = computed(() => {
  return locale.value === 'ckb' ? t('settings.kurdish') : t('settings.english');
});

// Change language
function changeLanguage(lang: string) {
  locale.value = lang;
  localStorage.setItem('language', lang);

  // Set RTL mode for Kurdish
  document.dir = lang === 'ckb' ? 'rtl' : 'ltr';

  // Update Quasar's RTL setting
  $q.lang.rtl = lang === 'ckb';
}

// Save settings
function saveSettings() {
  $q.notify({
    color: 'positive',
    message: t('settings.saveSuccess'),
    icon: 'check_circle'
  });
}

// Initialize RTL setting based on current language
const currentLang = localStorage.getItem('language') || 'en-US';
document.dir = currentLang === 'ckb' ? 'rtl' : 'ltr';
$q.lang.rtl = currentLang === 'ckb';
</script>

<style lang="scss" scoped>
.color-box {
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-size: 0.8rem;
}

// Dark mode specific styles
:deep(.body--dark) {
  .q-card {
    background: $dark;
  }
}
</style>
