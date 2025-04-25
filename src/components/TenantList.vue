<template>
  <div class="tenant-list-container">
    <div class="row items-center justify-between q-mb-md q-px-md">
      <q-input v-model="search" dense outlined placeholder="Search tenants" class="search-input">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

      <!-- Desktop view: Table -->
      <q-table v-if="$q.screen.gt.xs" :rows="filteredTenants" :columns="columns" row-key="id"
        :loading="propertyStore.loading" :pagination="pagination" :filter="search" flat bordered>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round dense color="primary" icon="payments" @click="recordPayment(props.row)">
              <q-tooltip>Record Payment</q-tooltip>
            </q-btn>
            <q-btn flat round dense color="secondary" icon="history" @click="viewPaymentHistory(props.row)">
              <q-tooltip>Payment History</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>

      <!-- Mobile view: Cards -->
      <div v-else class="q-gutter-md">
        <q-card v-for="tenant in filteredTenants" :key="tenant.id" flat bordered class="tenant-card q-mb-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold">{{ tenant.name }}</div>
            <div class="text-caption">{{ tenant.email }}</div>
            <div class="text-caption">{{ tenant.phone }}</div>

            <q-separator class="q-my-sm" />

            <div class="row q-mt-sm">
              <div class="col-12">
                <div class="text-caption text-grey">Property</div>
                <div class="text-body2">{{ getPropertyName(tenant.propertyId) }}</div>
              </div>
            </div>
            <div class="row q-mt-sm">
              <div class="col-6">
                <div class="text-caption text-grey">Lease Start</div>
                <div class="text-body2">{{ formatDate(tenant.leaseStart) }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey">Lease End</div>
                <div class="text-body2">{{ formatDate(tenant.leaseEnd) }}</div>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat color="primary" icon="payments" label="Record Payment" @click="recordPayment(tenant)" />
            <q-btn flat color="secondary" icon="history" label="History" @click="viewPaymentHistory(tenant)" />
          </q-card-actions>
        </q-card>

        <div v-if="filteredTenants.length === 0" class="text-center q-pa-md text-grey">
          <q-icon name="search_off" size="48px" class="q-mb-md" />
          <div>No tenants found.</div>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { usePropertyStore } from 'src/stores/property-store';
import type { Tenant } from 'src/models/property';

const $q = useQuasar();
const propertyStore = usePropertyStore();
const search = ref('');

const emit = defineEmits<{
  (e: 'record-payment', tenant: Tenant): void;
  (e: 'view-payment-history', tenant: Tenant): void;
}>();

const pagination = ref({
  rowsPerPage: 10
});

const columns = [
  { name: 'name', label: 'Name', field: 'name', sortable: true, align: 'left' },
  { name: 'email', label: 'Email', field: 'email', sortable: true, align: 'left' },
  { name: 'phone', label: 'Phone', field: 'phone', sortable: true, align: 'left' },
  {
    name: 'property',
    label: 'Property',
    field: 'propertyId',
    sortable: true,
    align: 'left',
    format: (val: string) => getPropertyName(val)
  },
  {
    name: 'leaseStart',
    label: 'Lease Start',
    field: 'leaseStart',
    sortable: true,
    align: 'left',
    format: (val: Date | string) => formatDate(val)
  },
  {
    name: 'leaseEnd',
    label: 'Lease End',
    field: 'leaseEnd',
    sortable: true,
    align: 'left',
    format: (val: Date | string) => formatDate(val)
  },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
];

const props = defineProps<{
  buildingId?: string | null;
}>();

const filteredTenants = computed(() => {
  // Start with all tenants
  let tenants = propertyStore.tenants;

  // Filter by building if a building is selected
  if (props.buildingId) {
    tenants = tenants.filter(tenant => {
      // Get the property for this tenant
      const property = propertyStore.properties.find(p => p.id === tenant.propertyId);
      // Check if the property belongs to the selected building
      return property?.buildingId === props.buildingId;
    });
  }

  // Then apply search filter
  if (!search.value) return tenants;

  const searchLower = search.value.toLowerCase();
  return tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchLower) ||
    tenant.email.toLowerCase().includes(searchLower) ||
    tenant.phone.toLowerCase().includes(searchLower) ||
    getPropertyName(tenant.propertyId).toLowerCase().includes(searchLower)
  );
});

onMounted(async () => {
  if (propertyStore.properties.length === 0) {
    await propertyStore.fetchProperties();
  }

  if (propertyStore.tenants.length === 0) {
    await propertyStore.fetchTenants();
  }
});

function getPropertyName(propertyId?: string): string {
  if (!propertyId) return 'Not Assigned';

  const property = propertyStore.properties.find(p => p.id === propertyId);
  return property ? property.name : 'Unknown Property';
}

function formatDate(date: Date | string): string {
  if (!date) return '';

  if (typeof date === 'string') {
    try {
      // Try to parse as a date string
      return new Date(date).toLocaleDateString();
    } catch {
      // If parsing fails, return empty string
      return '';
    }
  }

  // Handle Firestore timestamp object
  if (date && typeof date === 'object' && 'seconds' in date) {
    return new Date((date as { seconds: number }).seconds * 1000).toLocaleDateString();
  }

  return date.toLocaleDateString();
}

function recordPayment(tenant: Tenant) {
  emit('record-payment', tenant);
}

function viewPaymentHistory(tenant: Tenant) {
  emit('view-payment-history', tenant);
}
</script>

<style lang="scss" scoped>
.tenant-list-container {
  width: 100%;
}

.search-input {
  width: 250px;
}

.tenant-card {
  transition: transform 0.3s, box-shadow 0.3s;
  border-radius: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
}

@media (max-width: 599px) {
  .search-input {
    width: 100%;
    margin-top: 8px;
  }
}

:deep(.q-table) {
  background: transparent;

  th {
    background-color: rgba(0, 0, 0, 0.03);
  }
}

.body--dark {
  :deep(.q-table) {
    th {
      background-color: rgba(255, 255, 255, 0.03);
    }
  }
}
</style>
