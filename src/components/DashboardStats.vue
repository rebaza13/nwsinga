<template>
  <div class="row q-col-gutter-md">
    <div class="col-12 col-sm-4">
      <stat-card title="Total Rental Income" :value="formatCurrency(propertyStore.dashboardStats.totalRentalIncome)"
        :subtitle="`Last month: ${formatCurrency(propertyStore.dashboardStats.lastMonthIncome)}`" color="bg-primary"
        icon="trending_up" />
    </div>
    <div class="col-12 col-sm-4">
      <stat-card title="Total Properties" :value="propertyStore.dashboardStats.totalProperties"
        :subtitle="`${propertyStore.dashboardStats.newProperties} new this month`" color="bg-secondary"
        icon="apartment" />
    </div>
    <div class="col-12 col-sm-4">
      <stat-card title="Active Contracts" :value="propertyStore.dashboardStats.activeContracts"
        :subtitle="`${propertyStore.dashboardStats.pendingRenewals} renewals pending`" color="bg-accent"
        icon="description" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import StatCard from './StatCard.vue';
import { usePropertyStore } from 'src/stores/property-store';

const propertyStore = usePropertyStore();

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
