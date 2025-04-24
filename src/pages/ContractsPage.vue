<template>
  <q-page class="q-pa-md">
    <!-- Header Section -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h4 class="q-my-none text-weight-bold">Contracts</h4>
        <p class="text-grey-8 q-mt-sm">Manage your rental contracts</p>
      </div>
      <div class="col-auto">
        <q-btn color="primary" icon-right="refresh" label="Refresh" flat @click="refreshData" :loading="isLoading" />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-4">
        <q-card class="bg-primary text-white stat-card">
          <q-card-section>
            <div class="text-h6">Active Contracts</div>
            <div class="text-h3 q-mt-sm q-mb-xs">{{ contractStore.activeContracts.length }}</div>
            <div class="text-caption text-white-8">
              <q-icon name="description" size="16px" class="q-mr-xs" />
              <span>Total contracts: {{ contractStore.contracts.length }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-4">
        <q-card class="bg-warning text-white stat-card">
          <q-card-section>
            <div class="text-h6">Expiring Soon</div>
            <div class="text-h3 q-mt-sm q-mb-xs">{{ contractStore.expiringSoonContracts.length }}</div>
            <div class="text-caption text-white-8">
              <q-icon name="schedule" size="16px" class="q-mr-xs" />
              <span>Contracts expiring in 30 days</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-4">
        <q-card class="bg-positive text-white stat-card">
          <q-card-section>
            <div class="text-h6">Lease Income</div>
            <div class="text-h3 q-mt-sm q-mb-xs">{{ formatCurrency(contractStore.totalMonthlyIncome) }}</div>
            <div class="text-caption text-white-8">
              <q-icon name="payments" size="16px" class="q-mr-xs" />
              <span>From active lease contracts</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Contract List with Add Button -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">Contract List</div>
      <q-btn color="primary" icon="add_circle" label="New Contract" @click="showAddContractDialog = true" />
    </div>

    <contract-list />

    <!-- Add Contract Dialog -->
    <q-dialog v-model="showAddContractDialog" persistent maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Create New Contract</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <contract-form @contract-added="onContractAdded" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import ContractList from 'src/components/ContractListNew.vue';
import ContractForm from 'src/components/ContractFormNew.vue';
import { useContractStore } from 'src/stores/contract-store';
const $q = useQuasar();

const contractStore = useContractStore();
const showAddContractDialog = ref(false);
const isLoading = ref(false);

onMounted(async () => {
  await refreshData();
});

async function refreshData() {
  isLoading.value = true;
  try {
    await contractStore.fetchContracts();
  } catch (error) {
    console.error('Error refreshing data:', error);
  } finally {
    isLoading.value = false;
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

async function onContractAdded() {
  showAddContractDialog.value = false;
  await refreshData();

  // Show success notification
  $q.notify({
    color: 'positive',
    message: 'Contract created successfully',
    icon: 'check_circle',
    position: 'top'
  });
}
</script>

<style lang="scss" scoped>
.stat-card {
  border-radius: 12px;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
  }
}

.body--dark {
  .text-grey-8 {
    color: #bdbdbd !important;
  }
}
</style>
