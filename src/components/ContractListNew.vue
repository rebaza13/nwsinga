<template>
  <q-card class="contract-list-card">
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <q-input v-model="search" dense outlined placeholder="Search contracts" class="search-input">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn flat round color="primary" icon="refresh" @click="refreshData" :loading="isRefreshing">
          <q-tooltip>Refresh contracts</q-tooltip>
        </q-btn>
      </div>

      <!-- Desktop view: Table -->
      <q-table v-if="$q.screen.gt.xs" :rows="filteredContracts" :columns="columns" row-key="id"
        :loading="contractStore.loading" :pagination="pagination" :filter="search" flat bordered>
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="props.row.isActive ? 'positive' : 'negative'">
              {{ props.row.isActive ? 'Active' : 'Inactive' }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-contractType="props">
          <q-td :props="props">
            <q-badge :color="getContractTypeColor(props.row.contractType)">
              {{ getContractTypeLabel(props.row.contractType) }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round dense color="primary" icon="visibility" @click="viewContract(props.row)">
              <q-tooltip>View Contract</q-tooltip>
            </q-btn>
            <q-btn flat round dense color="secondary" icon="edit" @click="editContract(props.row)">
              <q-tooltip>Edit Contract</q-tooltip>
            </q-btn>
            <q-btn flat round dense color="negative" icon="delete" @click="confirmDeleteContract(props.row)">
              <q-tooltip>Delete Contract</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>

      <!-- Mobile view: Cards -->
      <div v-else class="q-gutter-md">
        <q-card v-for="(contract, index) in filteredContracts" :key="contract.id || index" flat bordered
          class="contract-card q-mb-md">
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="text-subtitle1 text-weight-bold">{{ contract.title }}</div>
              <q-badge :color="contract.isActive ? 'positive' : 'negative'">
                {{ contract.isActive ? 'Active' : 'Inactive' }}
              </q-badge>
            </div>
            <div class="text-caption">
              <q-badge :color="getContractTypeColor(contract.contractType)">
                {{ getContractTypeLabel(contract.contractType) }}
              </q-badge>
            </div>
            <q-separator class="q-my-sm" />
            <div class="row q-mt-sm">
              <div class="col-6">
                <div class="text-caption text-grey">Start Date</div>
                <div class="text-body2">{{ formatDate(contract.startDate) }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey">End Date</div>
                <div class="text-body2">{{ formatDate(contract.endDate) }}</div>
              </div>
            </div>
            <div class="row q-mt-sm">
              <div class="col-6">
                <div class="text-caption text-grey">Amount</div>
                <div class="text-body2 text-weight-medium text-primary">{{ formatCurrency(contract.amount) }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey">Deposit</div>
                <div class="text-body2">{{ formatCurrency(contract.depositAmount) }}</div>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat color="primary" icon="visibility" label="View" @click="viewContract(contract)" />
            <q-btn flat color="secondary" icon="edit" label="Edit" @click="editContract(contract)" />
            <q-btn flat color="negative" icon="delete" label="Delete" @click="confirmDeleteContract(contract)" />
          </q-card-actions>
        </q-card>

        <div v-if="filteredContracts.length === 0" class="text-center q-pa-md text-grey">
          <q-icon name="search_off" size="48px" class="q-mb-md" />
          <div>No contracts found.</div>
        </div>
      </div>
    </q-card-section>
  </q-card>

  <!-- Contract Details Dialog -->
  <q-dialog v-model="showContractDetails" persistent>
    <q-card style="min-width: 350px; max-width: 600px" class="contract-details-card">
      <q-card-section class="row items-center bg-primary text-white">
        <div class="text-h6">Contract Details</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup color="white" />
      </q-card-section>

      <q-card-section v-if="selectedContract" class="q-pt-lg">
        <div class="row q-col-gutter-md">
          <!-- Header with title and status -->
          <div class="col-12 q-mb-md">
            <div class="row items-center justify-between">
              <div class="text-h6">{{ selectedContract.title }}</div>
              <q-badge :color="selectedContract.isActive ? 'positive' : 'negative'" class="q-pa-sm">
                {{ selectedContract.isActive ? 'Active' : 'Inactive' }}
              </q-badge>
            </div>
            <div class="text-subtitle2 text-grey-8">
              <q-badge :color="getContractTypeColor(selectedContract.contractType)">
                {{ getContractTypeLabel(selectedContract.contractType) }}
              </q-badge>
            </div>
          </div>

          <q-separator class="col-12" />

          <!-- Contract dates -->
          <div class="col-12 q-mt-md">
            <div class="text-subtitle2 text-weight-medium">Contract Period</div>
          </div>
          <div class="col-12 col-sm-6">
            <q-item dense>
              <q-item-section avatar>
                <q-icon name="event" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Start Date</q-item-label>
                <q-item-label>{{ formatDate(selectedContract.startDate) }}</q-item-label>
              </q-item-section>
            </q-item>
          </div>
          <div class="col-12 col-sm-6">
            <q-item dense>
              <q-item-section avatar>
                <q-icon name="event" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>End Date</q-item-label>
                <q-item-label>{{ formatDate(selectedContract.endDate) }}</q-item-label>
              </q-item-section>
            </q-item>
          </div>

          <!-- Financial details -->
          <div class="col-12 q-mt-md">
            <div class="text-subtitle2 text-weight-medium">Financial Details</div>
          </div>
          <div class="col-12 col-sm-6">
            <q-item dense>
              <q-item-section avatar>
                <q-icon name="payments" color="positive" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Amount</q-item-label>
                <q-item-label class="text-weight-medium text-positive">
                  {{ formatCurrency(selectedContract.amount) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </div>
          <div class="col-12 col-sm-6">
            <q-item dense>
              <q-item-section avatar>
                <q-icon name="account_balance_wallet" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Deposit Amount</q-item-label>
                <q-item-label>{{ formatCurrency(selectedContract.depositAmount) }}</q-item-label>
              </q-item-section>
            </q-item>
          </div>

          <!-- Additional information -->
          <div class="col-12 q-mt-md">
            <div class="text-subtitle2 text-weight-medium">Additional Information</div>
          </div>
          <div class="col-12 col-sm-6">
            <q-item dense>
              <q-item-section avatar>
                <q-icon name="person" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Created By</q-item-label>
                <q-item-label>{{ selectedContract.createdBy }}</q-item-label>
              </q-item-section>
            </q-item>
          </div>
          <div class="col-12 col-sm-6">
            <q-item dense>
              <q-item-section avatar>
                <q-icon name="schedule" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Created At</q-item-label>
                <q-item-label>{{ formatDate(selectedContract.createdAt) }}</q-item-label>
              </q-item-section>
            </q-item>
          </div>

          <!-- Notes -->
          <div class="col-12 q-mt-md" v-if="selectedContract.notes">
            <q-item dense>
              <q-item-section avatar>
                <q-icon name="notes" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Notes</q-item-label>
                <q-item-label>{{ selectedContract.notes }}</q-item-label>
              </q-item-section>
            </q-item>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Close" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useContractStore } from 'src/stores/contract-store';
import { useQuasar } from 'quasar';
import type { Contract } from 'src/models/property';

const $q = useQuasar();
const contractStore = useContractStore();
const search = ref('');
const showContractDetails = ref(false);
const showEditDialog = ref(false);
const selectedContract = ref<Contract | null>(null);
const isRefreshing = ref(false);

const emit = defineEmits<{
  (e: 'edit-contract', contract: Contract): void;
}>();

const pagination = ref({
  rowsPerPage: 10
});

const columns = [
  { name: 'title', label: 'Contract Title', field: 'title', sortable: true, align: 'left' as const },
  { name: 'contractType', label: 'Type', field: 'contractType', sortable: true, align: 'center' as const },
  {
    name: 'startDate',
    label: 'Start Date',
    field: 'startDate',
    sortable: true,
    align: 'left' as const,
    format: (val: Date | string | { seconds: number }) => formatDate(val)
  },
  {
    name: 'endDate',
    label: 'End Date',
    field: 'endDate',
    sortable: true,
    align: 'left' as const,
    format: (val: Date | string | { seconds: number }) => formatDate(val)
  },
  {
    name: 'amount',
    label: 'Amount',
    field: 'amount',
    sortable: true,
    align: 'right' as const,
    format: (val: number) => formatCurrency(val)
  },
  { name: 'status', label: 'Status', field: 'isActive', sortable: true, align: 'center' as const },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' as const }
];

const filteredContracts = computed(() => {
  if (!search.value) return contractStore.contracts;

  const searchLower = search.value.toLowerCase();
  return contractStore.contracts.filter(contract =>
    contract.title?.toLowerCase().includes(searchLower) ||
    getContractTypeLabel(contract.contractType).toLowerCase().includes(searchLower) ||
    formatDate(contract.startDate).includes(searchLower) ||
    formatDate(contract.endDate).includes(searchLower) ||
    contract.amount.toString().includes(searchLower)
  );
});

onMounted(async () => {
  await refreshData();
});

async function refreshData() {
  isRefreshing.value = true;
  try {
    await contractStore.initializeWithSampleData();
    await contractStore.fetchContracts();
  } catch (error) {
    console.error('Error refreshing contracts:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to refresh contracts',
      icon: 'error'
    });
  } finally {
    isRefreshing.value = false;
  }
}

function formatDate(date: Date | string | { seconds: number }): string {
  if (!date) return '';

  // Handle Firestore timestamp object
  if (date && typeof date === 'object' && 'seconds' in date) {
    return new Date(date.seconds * 1000).toLocaleDateString();
  }

  // Handle string date
  if (typeof date === 'string') {
    return new Date(date).toLocaleDateString();
  }

  // Handle Date object
  return date.toLocaleDateString();
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function getContractTypeLabel(type: string): string {
  switch (type) {
    case 'sale': return 'Sale Contract';
    case 'lease': return 'Lease Agreement';
    case 'other': return 'Other Contract';
    default: return type;
  }
}

function getContractTypeColor(type: string): string {
  switch (type) {
    case 'sale': return 'blue';
    case 'lease': return 'orange';
    case 'other': return 'grey';
    default: return 'grey';
  }
}

function viewContract(contract: Contract) {
  selectedContract.value = contract;
  showContractDetails.value = true;
}

function editContract(contract: Contract) {
  selectedContract.value = contract;
  showEditDialog.value = true;
  // Emit an event to the parent component to show the edit dialog
  emit('edit-contract', contract);
}

function confirmDeleteContract(contract: Contract) {
  selectedContract.value = contract;

  $q.dialog({
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete the contract "${contract.title}"?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    // Use void to explicitly ignore the promise
    void deleteContract(contract.id as string).catch(error => {
      console.error('Error deleting contract:', error);
    });
  });
}

async function deleteContract(id: string) {
  try {
    await contractStore.deleteContract(id);

    $q.notify({
      color: 'positive',
      message: 'Contract deleted successfully',
      icon: 'check_circle'
    });
  } catch (error) {
    console.error('Error deleting contract:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to delete contract',
      icon: 'error'
    });
    throw error;
  }
}
</script>

<style lang="scss" scoped>
.contract-list-card {
  border-radius: 12px;
}

.search-input {
  width: 250px;
}

.contract-card {
  transition: transform 0.3s, box-shadow 0.3s;
  border-radius: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
}

.contract-details-card {
  border-radius: 8px;
}

@media (max-width: 599px) {
  .search-input {
    width: 100%;
    margin-top: 8px;
  }
}
</style>
