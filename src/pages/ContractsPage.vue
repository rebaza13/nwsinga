<template>
  <q-page class="q-pa-md">
    <!-- Header Section -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h4 class="q-my-none text-weight-bold">{{ $t('contracts.title') }}</h4>
        <p class="text-grey-8 q-mt-sm">{{ $t('contracts.manage') }}</p>
      </div>
      <div class="col-auto">
        <q-btn color="primary" icon-right="refresh" :label="$t('app.refresh')" flat @click="refreshData"
          :loading="isLoading" />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-4">
        <q-card class="bg-primary text-white stat-card">
          <q-card-section>
            <div class="text-h6">{{ $t('contracts.activeContracts') }}</div>
            <div class="text-h3 q-mt-sm q-mb-xs">{{ contractStore.activeContracts.length }}</div>
            <div class="text-caption text-white-8">
              <q-icon name="description" size="16px" class="q-mr-xs" />
              <span>{{ $t('app.total') }}: {{ contractStore.contracts.length }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-4">
        <q-card class="bg-warning text-white stat-card">
          <q-card-section>
            <div class="text-h6">{{ $t('contracts.expiringSoon') }}</div>
            <div class="text-h3 q-mt-sm q-mb-xs">{{ contractStore.expiringSoonContracts.length }}</div>
            <div class="text-caption text-white-8">
              <q-icon name="schedule" size="16px" class="q-mr-xs" />
              <span>{{ $t('contracts.expiringIn30Days') }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-4">
        <q-card class="bg-positive text-white stat-card">
          <q-card-section>
            <div class="text-h6">{{ $t('contracts.leaseIncome') }}</div>
            <div class="text-h3 q-mt-sm q-mb-xs">{{ formatCurrency(contractStore.totalMonthlyIncome) }}</div>
            <div class="text-caption text-white-8">
              <q-icon name="payments" size="16px" class="q-mr-xs" />
              <span>{{ $t('contracts.fromActiveLeases') }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Contract List with Add Button -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">{{ $t('contracts.contractList') }}</div>
      <q-btn color="primary" icon="add_circle" :label="$t('contracts.add')" @click="showAddContractDialog = true" />
    </div>

    <contract-list @edit-contract="onEditContract" />

    <!-- Add Contract Dialog -->
    <q-dialog v-model="showAddContractDialog" persistent maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ isEditing ? $t('contracts.edit') : $t('contracts.add') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="resetForm" />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <contract-form :contract="editingContract" :isEditing="isEditing" @contract-added="onContractAdded"
            @contract-updated="onContractUpdated" @cancel="cancelForm" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import ContractList from 'src/components/ContractListNew.vue';
import ContractForm from 'src/components/ContractFormNew.vue';
import { useContractStore } from 'src/stores/contract-store';
import type { Contract } from 'src/models/property';

useI18n(); // Initialize i18n
const $q = useQuasar();

const contractStore = useContractStore();
const showAddContractDialog = ref(false);
const isLoading = ref(false);
const editingContract = ref<Contract | null>(null);
const isEditing = ref(false);

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
  resetForm();
  await refreshData();

  // Show success notification
  $q.notify({
    color: 'positive',
    message: $t('contracts.addSuccess'),
    icon: 'check_circle',
    position: 'top'
  });
}

async function onContractUpdated() {
  showAddContractDialog.value = false;
  resetForm();
  await refreshData();

  // Show success notification
  $q.notify({
    color: 'positive',
    message: $t('contracts.updateSuccess'),
    icon: 'check_circle',
    position: 'top'
  });
}

function onEditContract(contract: Contract) {
  editingContract.value = contract;
  isEditing.value = true;
  showAddContractDialog.value = true;
}

function resetForm() {
  editingContract.value = null;
  isEditing.value = false;
}

function cancelForm() {
  showAddContractDialog.value = false;
  resetForm();
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
