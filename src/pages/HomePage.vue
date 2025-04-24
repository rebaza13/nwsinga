<template>
  <q-page class="q-pa-md">
    <!-- Welcome Section -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h4 class="q-my-none text-weight-bold">Welcome back!</h4>
        <p class="text-grey-8 q-mt-sm">Here's an overview of your rental properties</p>
      </div>
      <div class="col-auto">
        <q-btn color="primary" icon-right="refresh" label="Refresh" flat />
      </div>
    </div>

    <!-- Stats Cards -->
    <dashboard-stats class="q-mb-lg" />

    <!-- Quick Actions -->
    <div class="row q-mb-md">
      <div class="col-12">
        <div class="text-h6 q-mb-sm">Quick Actions</div>
      </div>
    </div>
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-6 col-sm-3">
        <quick-action-card title="Properties" icon="home_work" bg-color="bg-blue-8"
          @click="navigateTo('/properties')" />
      </div>
      <div class="col-6 col-sm-3">
        <quick-action-card title="Tenants" icon="people" bg-color="bg-teal-8" @click="navigateTo('/rent')" />
      </div>
      <div class="col-6 col-sm-3">
        <quick-action-card title="Rent Payments" icon="payments" bg-color="bg-deep-purple-8"
          @click="navigateTo('/rent')" />
      </div>
      <div class="col-6 col-sm-3">
        <quick-action-card title="Contracts" icon="description" bg-color="bg-amber-8"
          @click="navigateTo('/contracts')" />
      </div>
    </div>

    <!-- Todo List and Recent Activities -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <div class="text-h6 q-mb-sm">My Tasks</div>
        <todo-list />
      </div>
      <div class="col-12 col-md-6">
        <div class="text-h6 q-mb-sm">Recent Activities</div>
        <recent-activities />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import DashboardStats from 'src/components/DashboardStats.vue';
import TodoList from 'src/components/TodoList.vue';
import QuickActionCard from 'src/components/QuickActionCard.vue';
import RecentActivities from 'src/components/RecentActivities.vue';

const router = useRouter();

function navigateTo(path: string) {
  router.push(path);
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