<template>
  <q-page class="q-pa-md">
    <!-- Header Section -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h4 class="q-my-none text-weight-bold">{{ $t('rent.title') }}</h4>
        <p class="text-grey-8 q-mt-sm">{{ $t('rent.manage') }}</p>
      </div>
      <div class="col-auto">
        <q-btn color="primary" icon-right="refresh" :label="$t('app.refresh')" flat @click="refreshData" :loading="isLoading" />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-3">
        <q-card class="bg-primary text-white stat-card">
          <q-card-section>
            <div class="text-h6">{{ $t('rent.totalPayments') }}</div>
            <div class="text-h3 q-mt-sm q-mb-xs">{{ formatCurrency(rentPaymentStore.totalPayments) }}</div>
            <div class="text-caption text-white-8">
              <q-icon name="payments" size="16px" class="q-mr-xs" />
              <span>{{ $t('rent.allTime') }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-3">
        <q-card class="bg-secondary text-white stat-card">
          <q-card-section>
            <div class="text-h6">{{ $t('rent.thisMonth') }}</div>
            <div class="text-h3 q-mt-sm q-mb-xs">{{ formatCurrency(currentMonthTotal) }}</div>
            <div class="text-caption text-white-8">
              <q-icon name="event" size="16px" class="q-mr-xs" />
              <span>{{ currentMonthName }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-3">
        <q-card class="bg-accent text-white stat-card">
          <q-card-section>
            <div class="text-h6">{{ $t('tenants.title') }}</div>
            <div class="text-h3 q-mt-sm q-mb-xs">{{ propertyStore.tenants.length }}</div>
            <div class="text-caption text-white-8">
              <q-icon name="people" size="16px" class="q-mr-xs" />
              <span>{{ $t('rent.totalTenants') }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-3">
        <q-card class="bg-positive text-white stat-card">
          <q-card-section>
            <div class="text-h6">{{ $t('properties.title') }}</div>
            <div class="text-h3 q-mt-sm q-mb-xs">{{ propertyStore.properties.length }}</div>
            <div class="text-caption text-white-8">
              <q-icon name="apartment" size="16px" class="q-mr-xs" />
              <span>
                <q-btn flat dense size="sm" color="white" :label="$t('properties.add')" @click="showAddPropertyDialog = true" />
              </span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Building Selector -->
    <div class="row q-mb-md">
      <div class="col-12 col-md-6">
        <q-select v-model="selectedBuilding" :options="buildingStore.buildings" option-value="id" option-label="name"
          :label="$t('rent.filterByBuilding')" outlined dense emit-value map-options clearable :loading="buildingStore.loading"
          @update:model-value="filterByBuilding">
          <template v-slot:prepend>
            <q-icon name="apartment" />
          </template>
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                {{ $t('rent.noBuildings') }}
              </q-item-section>
            </q-item>
          </template>
          <template v-slot:after>
            <q-btn round dense flat icon="add" @click="showAddBuildingDialog = true">
              <q-tooltip>{{ $t('rent.addBuilding') }}</q-tooltip>
            </q-btn>
          </template>
        </q-select>
      </div>
    </div>

    <!-- Main Content -->
    <div class="row">
      <div class="col-12">
        <q-card v-if="activeView === 'tenants'" class="q-mb-md">
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="col">
                <div class="text-h6">
                  {{ selectedBuilding ? $t('rent.tenantsIn', { building: getBuildingName(selectedBuilding) }) : $t('rent.allTenants') }}
                </div>
              </div>
              <div class="col-auto">
                <q-btn color="primary" icon="person_add" :label="$t('tenants.add')" @click="showAddTenantDialog = true" />
              </div>
            </div>
            <tenant-list :building-id="selectedBuilding" @record-payment="openPaymentDialog"
              @view-payment-history="viewPaymentHistory" />
          </q-card-section>
        </q-card>

        <q-card v-if="activeView === 'payment-history'" class="q-mb-md">
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="col">
                <q-btn icon="arrow_back" flat color="primary" :label="$t('rent.backToTenants')" @click="activeView = 'tenants'" />
              </div>
              <div class="col-auto">
                <q-btn color="primary" icon="add_circle" :label="$t('rent.recordPayment')"
                  @click="openPaymentDialog(selectedTenant)" />
              </div>
            </div>

            <payment-history v-if="selectedTenant" :tenant="selectedTenant" @record-payment="openPaymentDialogWithMonth"
              @refresh="refreshData" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Payment Dialog -->
    <q-dialog v-model="showPaymentDialog" persistent maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('rent.recordPayment') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <rent-payment-form v-if="selectedTenant" :tenant="selectedTenant" @payment-added="onPaymentAdded"
            @cancel="showPaymentDialog = false" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Add Tenant Dialog -->
    <q-dialog v-model="showAddTenantDialog" persistent maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('tenants.add') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <tenant-form @tenant-added="onTenantAdded" @cancel="showAddTenantDialog = false" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Add Property Dialog -->
    <q-dialog v-model="showAddPropertyDialog" persistent maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('properties.add') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <property-form @property-added="onPropertyAdded" @cancel="showAddPropertyDialog = false" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Add Building Dialog -->
    <q-dialog v-model="showAddBuildingDialog" persistent maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('rent.addBuilding') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <building-form @building-added="onBuildingAdded" @cancel="showAddBuildingDialog = false" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import TenantList from 'src/components/TenantList.vue';
import RentPaymentForm from 'src/components/RentPaymentForm.vue';
import PaymentHistory from 'src/components/PaymentHistory.vue';
import TenantForm from 'src/components/TenantForm.vue';
import PropertyForm from 'src/components/PropertyForm.vue';
import BuildingForm from 'src/components/BuildingForm.vue';
import { useRentPaymentStore } from 'src/stores/rent-payment-store';
import { usePropertyStore } from 'src/stores/property-store';
import { useContractStore } from 'src/stores/contract-store';
import { useBuildingStore } from 'src/stores/building-store';
import type { Tenant } from 'src/models/property';

useI18n(); // Initialize i18n

const $q = useQuasar();
const rentPaymentStore = useRentPaymentStore();
const propertyStore = usePropertyStore();
const contractStore = useContractStore();
const buildingStore = useBuildingStore();
const isLoading = ref(false);
const showPaymentDialog = ref(false);
const showAddTenantDialog = ref(false);
const showAddPropertyDialog = ref(false);
const showAddBuildingDialog = ref(false);
const selectedTenant = ref<Tenant | null>(null);
const selectedBuilding = ref<string | null>(null);
const activeView = ref('tenants'); // 'tenants' or 'payment-history'
const selectedMonth = ref('');

// Computed properties
const currentMonthName = computed(() => {
  const now = new Date();
  return now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
});

const currentMonth = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
});

const currentMonthTotal = computed(() => {
  return rentPaymentStore.totalPaymentsByMonth[currentMonth.value] || 0;
});

onMounted(async () => {
  await refreshData();
});

async function refreshData() {
  isLoading.value = true;
  try {
    await Promise.all([
      buildingStore.initializeWithSampleData(),
      buildingStore.fetchBuildings(),
      propertyStore.fetchProperties(),
      propertyStore.fetchTenants(),
      contractStore.fetchContracts(),
      rentPaymentStore.initializeWithSampleData(),
      rentPaymentStore.fetchRentPayments()
    ]);
  } catch (error) {
    console.error('Error refreshing data:', error);
    $q.notify({
      color: 'negative',
      message: $t('app.error'),
      icon: 'error'
    });
  } finally {
    isLoading.value = false;
  }
}

function openPaymentDialog(tenant: Tenant) {
  selectedTenant.value = tenant;
  selectedMonth.value = '';
  showPaymentDialog.value = true;
}

function openPaymentDialogWithMonth(month: string) {
  selectedMonth.value = month;
  showPaymentDialog.value = true;
}

function viewPaymentHistory(tenant: Tenant) {
  selectedTenant.value = tenant;
  activeView.value = 'payment-history';
}

async function onPaymentAdded() {
  showPaymentDialog.value = false;

  console.log('Payment added, refreshing data...');

  try {
    // First refresh all data
    await refreshData();

    if (activeView.value === 'payment-history' && selectedTenant.value) {
      console.log('In payment history view, refreshing for tenant:', selectedTenant.value.id);

      // Force a complete refresh of the tenant's payment history
      const payments = await rentPaymentStore.fetchRentPaymentsByTenant(selectedTenant.value.id as string);
      console.log('Fetched payments:', payments);

      // Force a refresh of the UI by toggling the view
      activeView.value = 'tenants';
      await nextTick();
      activeView.value = 'payment-history';
    }

    $q.notify({
      color: 'positive',
      message: $t('rent.paymentSuccess'),
      icon: 'check_circle',
      position: 'top'
    });
  } catch (error) {
    console.error('Error refreshing after payment:', error);
    $q.notify({
      color: 'negative',
      message: $t('rent.paymentRecordedError'),
      icon: 'error',
      position: 'top'
    });
  }
}

function onTenantAdded(): void {
  showAddTenantDialog.value = false;
  void refreshData(); // Use void operator to explicitly ignore the promise

  $q.notify({
    color: 'positive',
    message: $t('tenants.addSuccess'),
    icon: 'check_circle',
    position: 'top'
  });
}

function onPropertyAdded(): void {
  showAddPropertyDialog.value = false;
  void refreshData(); // Use void operator to explicitly ignore the promise

  $q.notify({
    color: 'positive',
    message: $t('properties.addSuccess'),
    icon: 'check_circle',
    position: 'top'
  });
}

function onBuildingAdded(): void {
  showAddBuildingDialog.value = false;
  void refreshData(); // Use void operator to explicitly ignore the promise

  $q.notify({
    color: 'positive',
    message: $t('rent.buildingAddSuccess'),
    icon: 'check_circle',
    position: 'top'
  });
}

function getBuildingName(buildingId: string): string {
  return buildingStore.getBuildingName(buildingId);
}

function filterByBuilding(buildingId: string | null): void {
  console.log('Filtering by building:', buildingId);
  selectedBuilding.value = buildingId;

  // Reset to tenants view if we're in payment history view
  if (activeView.value === 'payment-history') {
    activeView.value = 'tenants';
  }

  // Refresh data to ensure we have the latest
  void refreshData(); // Use void operator to explicitly ignore the promise
}

function formatCurrency(value: number): string {
  const { locale } = useI18n();
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
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
