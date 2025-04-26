<template>
  <div class="row q-col-gutter-md">
    <div class="col-12 col-sm-4">
      <stat-card :title="$t('dashboard.totalRentalIncome')"
        :value="formatCurrency(propertyStore.dashboardStats.totalRentalIncome)"
        :subtitle="$t('dashboard.lastMonth', { amount: formatCurrency(propertyStore.dashboardStats.lastMonthIncome) })"
        color="bg-primary" icon="trending_up" />
    </div>
    <div class="col-12 col-sm-4">
      <stat-card :title="$t('dashboard.totalProperties')" :value="propertyStore.dashboardStats.totalProperties"
        :subtitle="$t('dashboard.newThisMonth', { count: propertyStore.dashboardStats.newProperties })"
        color="bg-secondary" icon="apartment" />
    </div>
    <div class="col-12 col-sm-4">
      <stat-card :title="$t('dashboard.activeContracts')" :value="propertyStore.dashboardStats.activeContracts"
        :subtitle="$t('dashboard.renewalsPending', { count: propertyStore.dashboardStats.pendingRenewals })"
        color="bg-accent" icon="description" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import StatCard from './StatCard.vue';
import { usePropertyStore } from 'src/stores/property-store';

const propertyStore = usePropertyStore();
const { t } = useI18n();

onMounted(async () => {
  // Initialize with sample data if empty
  await propertyStore.initializeWithSampleData();

  // Fetch properties from Firestore
  await propertyStore.fetchProperties();
});

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}
</script>
