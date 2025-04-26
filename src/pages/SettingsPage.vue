<template>
  <q-page class="q-pa-md">
    <!-- Header Section -->
    <div class="text-h5 q-mb-lg">{{ $t('settings.title') }}</div>

    <div class="settings-container">
      <!-- Settings Categories -->
      <div class="row q-col-gutter-md">
        <!-- Appearance Settings -->
        <div class="col-12 col-md-6">
          <q-card class="settings-card">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="palette" class="q-mr-sm" />
                {{ $t('settings.appearance') }}
              </div>

              <q-list separator>
                <!-- Language Setting -->
                <q-item tag="label" class="q-py-md">
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
                <q-item tag="label" class="q-py-md">
                  <q-item-section>
                    <q-item-label>{{ $t('settings.theme') }}</q-item-label>
                    <q-item-label caption>{{ isDark ? $t('settings.darkMode') : $t('settings.lightMode')
                    }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle v-model="isDark" @update:model-value="toggleDarkMode" color="primary"
                      :icon="isDark ? 'dark_mode' : 'light_mode'" />
                  </q-item-section>
                </q-item>
              </q-list>

              <!-- Color Palette Preview -->
              <div class="q-mt-md">
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
            </q-card-section>
          </q-card>
        </div>

        <!-- Display Settings -->
        <div class="col-12 col-md-6">
          <q-card class="settings-card">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="visibility" class="q-mr-sm" />
                {{ $t('settings.display') }}
              </div>

              <q-list separator>
                <!-- Hide Timeline Setting -->
                <q-item tag="label" class="q-py-md">
                  <q-item-section>
                    <q-item-label>{{ $t('settings.hideTimeline') }}</q-item-label>
                    <q-item-label caption>{{ $t('settings.hideTimelineDesc') }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle v-model="hideTimeline" @update:model-value="toggleHideTimeline" color="primary"
                      icon="visibility_off" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>

        <!-- Data Export -->
        <div class="col-12">
          <q-card class="settings-card">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="download" class="q-mr-sm" />
                {{ $t('settings.dataExport') }}
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-4">
                  <q-card class="export-card" @click="exportData('properties')">
                    <q-card-section class="text-center">
                      <q-icon name="home_work" size="48px" color="primary" />
                      <div class="text-subtitle1 q-mt-sm">{{ $t('properties.title') }}</div>
                      <q-btn color="primary" :label="$t('settings.export')" class="q-mt-sm" icon="download" />
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-12 col-sm-4">
                  <q-card class="export-card" @click="exportData('tenants')">
                    <q-card-section class="text-center">
                      <q-icon name="people" size="48px" color="secondary" />
                      <div class="text-subtitle1 q-mt-sm">{{ $t('tenants.title') }}</div>
                      <q-btn color="secondary" :label="$t('settings.export')" class="q-mt-sm" icon="download" />
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-12 col-sm-4">
                  <q-card class="export-card" @click="exportData('contracts')">
                    <q-card-section class="text-center">
                      <q-icon name="description" size="48px" color="accent" />
                      <div class="text-subtitle1 q-mt-sm">{{ $t('contracts.title') }}</div>
                      <q-btn color="accent" :label="$t('settings.export')" class="q-mt-sm" icon="download" />
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Save Settings Button -->
      <div class="q-mt-lg text-center">
        <q-btn color="primary" :label="$t('app.save')" @click="saveSettings" size="lg" />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useDarkMode } from 'src/composables/useDarkMode';
import { useI18n } from 'vue-i18n';
import { computed, ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { usePropertyStore } from 'src/stores/property-store';
import { useContractStore } from 'src/stores/contract-store';
import { useBuildingStore } from 'src/stores/building-store';
import { useRentPaymentStore } from 'src/stores/rent-payment-store';

const $q = useQuasar();
const { isDark, toggleDarkMode } = useDarkMode();
const { t, locale } = useI18n({ useScope: 'global' });
const propertyStore = usePropertyStore();
const contractStore = useContractStore();
const buildingStore = useBuildingStore();
const rentPaymentStore = useRentPaymentStore();

// Timeline visibility setting
const hideTimeline = ref(localStorage.getItem('hideTimeline') === 'true');

function toggleHideTimeline(value: boolean) {
  localStorage.setItem('hideTimeline', value.toString());

  // Dispatch a custom event to notify other components about the setting change
  window.dispatchEvent(new CustomEvent('settings-changed'));
}

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

// Export data function
function exportData(dataType: 'properties' | 'tenants' | 'contracts') {
  let data: Record<string, unknown> = {};
  let filename = '';

  // Get the data based on the type
  switch (dataType) {
    case 'properties':
      data = {
        properties: propertyStore.properties,
        buildings: buildingStore.buildings
      };
      filename = 'properties-export.json';
      break;
    case 'tenants':
      data = {
        tenants: propertyStore.tenants
      };
      filename = 'tenants-export.json';
      break;
    case 'contracts':
      data = {
        contracts: contractStore.contracts,
        payments: rentPaymentStore.rentPayments
      };
      filename = 'contracts-export.json';
      break;
  }

  // Convert to JSON
  const jsonData = JSON.stringify(data, null, 2);

  // Create a blob and download link
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Create a temporary link and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // Show notification
  $q.notify({
    color: 'positive',
    message: t('settings.exportSuccess', { type: t(`${dataType}.title`) }),
    icon: 'check_circle'
  });
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

// Listen for dark mode changes from other components
onMounted(() => {
  // Force dark mode application on mount
  if (isDark) {
    document.body.classList.add('body--dark');
  } else {
    document.body.classList.remove('body--dark');
  }

  // Listen for dark mode changes
  window.addEventListener('dark-mode-changed', () => {
    // The isDark ref will be updated by the useDarkMode composable
    // Just ensure the UI is updated
    $q.dark.set(isDark);
  });
});
</script>

<style lang="scss" scoped>
.settings-container {
  max-width: 1200px;
  margin: 0 auto;
}

.settings-card {
  height: 100%;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-2px);
  }
}

.export-card {
  cursor: pointer;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
  }
}

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

  .q-item {
    color: white;
  }
}

// Mobile optimizations
@media (max-width: 599px) {
  .settings-container {
    padding-bottom: 60px;
  }
}
</style>
