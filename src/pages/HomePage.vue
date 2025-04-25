<template>
  <q-page class="q-pa-md">
    <!-- Welcome Section -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h4 class="q-my-none text-weight-bold">{{ $t('dashboard.welcome') }}</h4>
        <p class="text-grey-8 q-mt-sm">{{ $t('dashboard.overview') }}</p>
      </div>
      <div class="col-auto">
        <q-btn color="primary" icon-right="refresh" :label="$t('app.refresh')" flat />
      </div>
    </div>

    <!-- Stats Cards -->
    <dashboard-stats class="q-mb-lg" />

    <!-- Quick Actions -->
    <div class="row q-mb-md">
      <div class="col-12">
        <div class="text-h6 q-mb-sm">{{ $t('dashboard.quickActions') }}</div>
      </div>
    </div>
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-6 col-sm-3">
        <quick-action-card :title="$t('nav.properties')" icon="home_work" bg-color="bg-blue-8"
          @click="navigateTo('/properties')" />
      </div>
      <div class="col-6 col-sm-3">
        <quick-action-card :title="$t('nav.tenants')" icon="people" bg-color="bg-teal-8" @click="navigateTo('/rent')" />
      </div>
      <div class="col-6 col-sm-3">
        <quick-action-card :title="$t('rent.title')" icon="payments" bg-color="bg-deep-purple-8"
          @click="navigateTo('/rent')" />
      </div>
      <div class="col-6 col-sm-3">
        <quick-action-card :title="$t('nav.contracts')" icon="description" bg-color="bg-amber-8"
          @click="navigateTo('/contracts')" />
      </div>
    </div>

    <!-- Todo List and Recent Activities -->
    <div class="row q-col-gutter-md">
      <div :class="hideTimeline ? 'col-12' : 'col-12 col-md-6'">
        <div class="text-h6 q-mb-sm">{{ $t('dashboard.tasks') }}</div>
        <todo-list />
      </div>
      <div v-if="!hideTimeline" class="col-12 col-md-6">
        <div class="text-h6 q-mb-sm">{{ $t('dashboard.recentActivities') }}</div>
        <recent-activities />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ref, onMounted } from 'vue';
import DashboardStats from 'src/components/DashboardStats.vue';
import TodoList from 'src/components/TodoList.vue';
import QuickActionCard from 'src/components/QuickActionCard.vue';
import RecentActivities from 'src/components/RecentActivities.vue';

const router = useRouter();
useI18n(); // Initialize i18n without extracting t

// Timeline visibility setting
const hideTimeline = ref(localStorage.getItem('hideTimeline') === 'true');

// Update hideTimeline when localStorage changes
onMounted(() => {
  window.addEventListener('storage', (event) => {
    if (event.key === 'hideTimeline') {
      hideTimeline.value = event.newValue === 'true';
    }
  });
});

function navigateTo(path: string): void {
  void router.push(path); // Use void operator to explicitly ignore the promise
}
</script>

<style lang="scss" scoped>
/* Quick action styles moved to QuickActionCard.vue component */

.body--dark {
  .text-grey-8 {
    color: #bdbdbd !important;
  }
}
</style>