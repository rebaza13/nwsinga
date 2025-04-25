<template>
  <q-layout view="lHh lpR fFf">
    <q-header elevated :class="isDark ? 'bg-dark' : 'bg-primary'" class="safe-area-top">
      <q-toolbar>
        <q-toolbar-title class="text-weight-bold">
          {{ $t('app.title') }}
        </q-toolbar-title>
        <q-btn flat round :icon="isDark ? 'dark_mode' : 'light_mode'" @click="toggleDarkMode" class="animate-pop" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </transition>
      </router-view>
    </q-page-container>

    <q-footer :class="[
        'safe-area-bottom',
        isDark ? 'footer-dark' : 'footer-light'
      ]">
      <q-tabs v-model="currentTab" active-color="primary" indicator-color="primary"
        :class="isDark ? 'tabs-dark' : 'tabs-light'" align="justify" narrow-indicator>
        <q-route-tab name="home" to="/" class="tab-item">
          <div class="column items-center">
            <q-icon name="home" size="24px" class="animate-pop" />
            <div class="text-caption q-mt-sm">{{ $t('nav.home') }}</div>
          </div>
        </q-route-tab>

        <q-route-tab name="contracts" to="/contracts" class="tab-item">
          <div class="column items-center">
            <q-icon name="description" size="24px" class="animate-pop" />
            <div class="text-caption q-mt-sm">{{ $t('nav.contracts') }}</div>
          </div>
        </q-route-tab>

        <q-route-tab name="rent" to="/rent" class="tab-item">
          <div class="column items-center">
            <q-icon name="payments" size="24px" class="animate-pop" />
            <div class="text-caption q-mt-sm">{{ $t('nav.rent') }}</div>
          </div>
        </q-route-tab>

        <q-route-tab name="properties" to="/properties" class="tab-item">
          <div class="column items-center">
            <q-icon name="home_work" size="24px" class="animate-pop" />
            <div class="text-caption q-mt-sm">{{ $t('nav.properties') }}</div>
          </div>
        </q-route-tab>

        <q-route-tab name="settings" to="/settings" class="tab-item">
          <div class="column items-center">
            <q-icon name="tune" size="24px" class="animate-pop" />
            <div class="text-caption q-mt-sm">{{ $t('nav.settings') }}</div>
          </div>
        </q-route-tab>
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useDarkMode } from 'src/composables/useDarkMode';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';

const $q = useQuasar();
useI18n(); // Initialize i18n
const currentTab = ref('home');
const { isDark, toggleDarkMode } = useDarkMode();

// Initialize RTL setting based on current language
onMounted(() => {
  const currentLang = localStorage.getItem('language') || 'en-US';
  document.dir = currentLang === 'ckb' ? 'rtl' : 'ltr';
  $q.lang.rtl = currentLang === 'ckb';
});
</script>

<style lang="scss">
.footer-light {
  background-color: white;
  color: #333;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.footer-dark {
  background-color: #1d1d1d;
  color: white;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.q-footer {
  .q-tabs {
    height: 100%;

    .q-tab {
      min-height: 56px;
      padding: 0;
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.95);
      }

      &--active {
        .q-icon {
          transform: translateY(-2px);
        }
      }
    }

    .tab-item {
      height: 100%;
      padding: 6px 0;
    }

    .q-tab__ripple {
      border-radius: 50%;
      height: 100% !important;
      width: 100% !important;
    }

    .q-tab__icon {
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
  }
}

// Add tab indicator animation
.q-tabs__indicator {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}

.body--dark {
  .q-tab {
    &--active {
      color: $primary;
    }
  }
}

.tabs-dark {
  background-color: #1d1d1d !important;
  color: #bdbdbd;

  .q-tab {
    color: #bdbdbd;

    &--active {
      color: $primary;
    }

    &__icon, &__label {
      color: inherit;
    }
  }
}

.tabs-light {
  background-color: white;
  color: #616161;

  .q-tab {
    &--active {
      color: $primary;
    }

    &__icon, &__label {
      color: inherit;
    }
  }
}

// Page transition animations
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.text-caption {
  font-size: 12px;
  line-height: 1;
}

// Add a subtle pulse animation to the active tab icon
@keyframes subtle-pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }

  100% {
    transform: scale(1);
  }
}

.q-tab--active .q-icon {
  animation: subtle-pulse 2s infinite ease-in-out;
}
</style>
