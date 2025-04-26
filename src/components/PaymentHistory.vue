<template>
  <div class="payment-history">
    <!-- Tenant Information Header -->
    <div class="row q-mb-lg">
      <div class="col-12 col-md-6">
        <div class="text-h6">{{ tenant.name }}</div>
        <div class="text-subtitle2">{{ propertyName }}</div>
        <div class="text-caption text-grey-8">
          Lease Period: {{ formatDate(tenant.leaseStart) }} - {{ formatDate(tenant.leaseEnd) }}
        </div>
      </div>
      <div class="col-12 col-md-6 text-right">
        <div class="text-subtitle1">
          Total Payments
          <q-btn round dense flat size="sm" icon="refresh" color="primary" @click="forceRefresh" :loading="loading">
            <q-tooltip>Force Refresh</q-tooltip>
          </q-btn>
        </div>
        <div class="text-h5 text-primary">{{ formatCurrency(totalPayments) }}</div>
      </div>
    </div>

    <!-- Year Selector and Refresh Button -->
    <div class="row q-mb-md items-center">
      <div class="col-auto">
        <q-select v-model="selectedYear" :options="availableYears" label="Year" outlined dense class="year-selector" />
      </div>
      <div class="col-auto q-ml-md">
        <q-btn icon="refresh" color="primary" flat round @click="refreshPayments" :loading="loading">
          <q-tooltip>Refresh Payments</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Payment Calendar -->
    <div class="payment-calendar q-mb-lg">
      <div class="row q-col-gutter-md">
        <div v-for="month in months" :key="month.value" class="col-12 col-sm-6 col-md-4 col-lg-3">
          <q-card :class="getMonthCardClass(month.value)" class="month-card">
            <q-card-section>
              <div class="text-subtitle1 text-weight-medium">{{ month.label }}</div>

              <div v-if="hasPaymentForMonth(month.value)" class="payment-info">
                <div class="text-h6 text-positive">{{ formatCurrency(getPaymentAmountForMonth(month.value)) }}</div>
                <div class="text-caption">
                  Paid on {{ formatDate(getPaymentForMonth(month.value)?.paymentDate) }}
                </div>
                <div class="text-caption">
                  Method: {{ capitalizeFirst(getPaymentForMonth(month.value)?.paymentMethod) }}
                </div>
                <q-btn flat dense color="primary" icon="visibility"
                  @click="viewPaymentDetails(getPaymentForMonth(month.value))">
                  <q-tooltip>View Details</q-tooltip>
                </q-btn>
              </div>

              <div v-else class="payment-info unpaid">
                <div class="text-subtitle1 text-grey">Not Paid</div>
                <q-btn flat dense color="primary" icon="add_circle" @click="recordPayment(month.value)"
                  v-if="canRecordPayment(month.value)">
                  <q-tooltip>Record Payment</q-tooltip>
                </q-btn>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Payment Details Dialog -->
    <q-dialog v-model="showPaymentDetails" persistent>
      <q-card style="min-width: 350px; max-width: 600px" class="payment-details-card">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">Payment Details</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="white" />
        </q-card-section>

        <q-card-section v-if="selectedPayment" class="q-pt-lg">
          <div class="row q-col-gutter-md">
            <!-- Header with month and amount -->
            <div class="col-12 q-mb-md">
              <div class="row items-center justify-between">
                <div class="text-h6">{{ formatMonthYear(selectedPayment.paymentMonth) }}</div>
                <div class="text-h6 text-positive">{{ formatCurrency(selectedPayment.amount) }}</div>
              </div>
            </div>

            <q-separator class="col-12" />

            <!-- Payment details -->
            <div class="col-12 q-mt-md">
              <div class="text-subtitle2 text-weight-medium">Payment Information</div>
            </div>

            <div class="col-12 col-sm-6">
              <q-item dense>
                <q-item-section avatar>
                  <q-icon name="event" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Payment Date</q-item-label>
                  <q-item-label>{{ formatDate(selectedPayment.paymentDate) }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <div class="col-12 col-sm-6">
              <q-item dense>
                <q-item-section avatar>
                  <q-icon name="payments" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Payment Method</q-item-label>
                  <q-item-label>{{ capitalizeFirst(selectedPayment.paymentMethod) }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <div class="col-12 col-sm-6" v-if="selectedPayment.receiptNumber">
              <q-item dense>
                <q-item-section avatar>
                  <q-icon name="receipt" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Receipt Number</q-item-label>
                  <q-item-label>{{ selectedPayment.receiptNumber }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <div class="col-12 col-sm-6">
              <q-item dense>
                <q-item-section avatar>
                  <q-icon name="person" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Recorded By</q-item-label>
                  <q-item-label>{{ selectedPayment.createdBy }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <div class="col-12" v-if="selectedPayment.notes">
              <q-item dense>
                <q-item-section avatar>
                  <q-icon name="notes" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Notes</q-item-label>
                  <q-item-label>{{ selectedPayment.notes }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Delete" color="negative" @click="confirmDeletePayment" v-if="selectedPayment" />
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteConfirmation" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">Are you sure you want to delete this payment record?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="deletePayment" :loading="loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useQuasar } from 'quasar';
import { useRentPaymentStore } from 'src/stores/rent-payment-store';
import type { Tenant, RentPayment } from 'src/models/property';
import { formatCurrency, formatDate, formatMonthYear, capitalizeFirst } from 'src/utils/format-utils';

const props = defineProps<{
  tenant: Tenant;
}>();

const emit = defineEmits<{
  (e: 'record-payment', month: string): void;
  (e: 'refresh'): void;
}>();

const $q = useQuasar();
const rentPaymentStore = useRentPaymentStore();
// propertyStore is not used in this component
const payments = ref<RentPayment[]>([]);
const loading = ref(false);
const selectedYear = ref(new Date().getFullYear().toString());
const showPaymentDetails = ref(false);
const showDeleteConfirmation = ref(false);
const selectedPayment = ref<RentPayment | null>(null);

// Computed properties
const propertyName = computed(() => {
  // Since tenant doesn't have a direct property reference, we'll use a generic description
  return `Building ${props.tenant.buildingId || 'Unknown'}`;
});

const totalPayments = computed(() => {
  return payments.value.reduce((total, payment) => total + payment.amount, 0);
});

const availableYears = computed(() => {
  const years = new Set<string>();
  const currentYear = new Date().getFullYear();

  // Add current year and previous year by default
  years.add(currentYear.toString());
  years.add((currentYear - 1).toString());

  // Add years from existing payments
  payments.value.forEach(payment => {
    if (payment.paymentMonth) {
      const year = payment.paymentMonth.split('-')[0];
      if (year) {
        years.add(year);
      }
    }
  });

  return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
});

const months = computed(() => {
  const result = [];
  for (let i = 0; i < 12; i++) {
    const month = i + 1;
    const monthValue = `${selectedYear.value}-${month.toString().padStart(2, '0')}`;
    const date = new Date(parseInt(selectedYear.value), i, 1);

    result.push({
      value: monthValue,
      label: date.toLocaleDateString(undefined, { month: 'long' })
    });
  }
  return result;
});

// Load payments when tenant changes
watch(() => props.tenant, async () => {
  await loadPayments();
}, { immediate: true });

// Load payments when year changes
watch(selectedYear, async () => {
  await loadPayments();
});

onMounted(async () => {
  await loadPayments();
});

// Function to manually refresh payments
async function refreshPayments() {
  console.log('Manually refreshing payments');
  await loadPayments();
  emit('refresh');
}

// Function to force a complete refresh of all data
async function forceRefresh() {
  console.log('Force refreshing all payment data');

  try {
    loading.value = true;

    // First refresh all payments in the store
    await rentPaymentStore.fetchRentPayments();

    // Then refresh this tenant's payments specifically
    await rentPaymentStore.fetchRentPaymentsByTenant(props.tenant.id as string);

    // Finally reload the payments into this component
    await loadPayments();

    // Notify the parent
    emit('refresh');

    $q.notify({
      color: 'positive',
      message: 'Payment data refreshed',
      icon: 'refresh',
      position: 'top'
    });
  } catch (error) {
    console.error('Error during force refresh:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to refresh payment data',
      icon: 'error',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
}

async function loadPayments() {
  loading.value = true;
  try {
    console.log('Loading payments for tenant:', props.tenant.id);

    // Clear existing payments first
    payments.value = [];

    // Force a refresh of all payments first
    await rentPaymentStore.fetchRentPayments();

    // Fetch fresh payments for this tenant
    const fetchedPayments = await rentPaymentStore.fetchRentPaymentsByTenant(props.tenant.id as string);

    console.log('Raw fetched payments:', fetchedPayments);

    // Make sure we have valid data
    if (fetchedPayments && fetchedPayments.length > 0) {
      payments.value = [...fetchedPayments]; // Create a new array to trigger reactivity

      // Log payments for debugging
      console.log('Loaded payments:', payments.value);
      console.log('Payment months:', payments.value.map(p => p.paymentMonth));
    } else {
      console.log('No payments found for tenant:', props.tenant.id);

      // Double-check if there are any payments in the store for this tenant
      const allPayments = rentPaymentStore.rentPayments;
      const tenantPayments = allPayments.filter(p => p.tenantId === props.tenant.id);
      console.log('Payments in store for this tenant:', tenantPayments);
    }

    // Force a refresh of the UI
    await nextTick();

    // Calculate total payments
    const total = payments.value.reduce((sum, payment) => sum + payment.amount, 0);
    console.log('Total payments:', total);
  } catch (error) {
    console.error('Error loading payments:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to load payment history',
      icon: 'error'
    });
  } finally {
    loading.value = false;
  }
}

function hasPaymentForMonth(month: string): boolean {
  // Make sure we have payments loaded
  if (!payments.value || payments.value.length === 0) {
    return false;
  }

  // Check if any payment exists for this month
  const result = payments.value.some(payment => payment.paymentMonth === month);

  // Log for debugging
  if (result) {
    console.log(`Found payment for month ${month}`);
  }

  return result;
}

function getPaymentForMonth(month: string): RentPayment | undefined {
  return payments.value.find(payment => payment.paymentMonth === month);
}

function getPaymentAmountForMonth(month: string): number {
  const payment = getPaymentForMonth(month);
  return payment ? payment.amount : 0;
}

function getMonthCardClass(month: string): string {
  // Force re-evaluation by creating a new computation each time
  const isPaid = hasPaymentForMonth(month);
  const isCurrentMonth = month === getCurrentMonth();

  console.log(`Month ${month} - isPaid: ${isPaid}, isCurrentMonth: ${isCurrentMonth}`);

  if (isPaid) {
    return 'bg-green-1 paid-month';
  } else if (isCurrentMonth) {
    return 'bg-blue-1';
  } else if (isMonthInPast(month)) {
    return 'bg-red-1';
  }

  return '';
}

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}

function isMonthInPast(month: string): boolean {
  const parts = month.split('-');
  if (parts.length !== 2) return false;

  const year = parts[0];
  const monthStr = parts[1];

  if (!year || !monthStr) return false;

  try {
    const monthDate = new Date(parseInt(year), parseInt(monthStr) - 1, 1);
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return monthDate < currentMonth;
  } catch {
    return false;
  }
}

function canRecordPayment(month: string): boolean {
  // Can record payment if it's not already paid and it's not in the future
  const isPaid = hasPaymentForMonth(month);
  if (isPaid) return false;

  const parts = month.split('-');
  if (parts.length !== 2) return false;

  const year = parts[0];
  const monthStr = parts[1];

  if (!year || !monthStr) return false;

  try {
    const monthDate = new Date(parseInt(year), parseInt(monthStr) - 1, 1);
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return monthDate < nextMonth;
  } catch {
    return false;
  }
}

// formatDate is now imported from src/utils/format-utils

// formatCurrency is now imported from src/utils/format-utils

// formatMonthYear and capitalizeFirst are now imported from src/utils/format-utils

function viewPaymentDetails(payment: RentPayment | undefined) {
  if (!payment) return;

  selectedPayment.value = payment;
  showPaymentDetails.value = true;
}

function recordPayment(month: string) {
  emit('record-payment', month);
}

function confirmDeletePayment() {
  showDeleteConfirmation.value = true;
}

async function deletePayment() {
  if (!selectedPayment.value) return;

  loading.value = true;
  try {
    await rentPaymentStore.deleteRentPayment(selectedPayment.value.id as string);

    $q.notify({
      color: 'positive',
      message: 'Payment record deleted successfully',
      icon: 'check_circle'
    });

    showDeleteConfirmation.value = false;
    showPaymentDetails.value = false;

    // Reload payments
    await loadPayments();
    emit('refresh');
  } catch (error) {
    console.error('Error deleting payment:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to delete payment record',
      icon: 'error'
    });
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.payment-history {
  max-width: 1200px;
  margin: 0 auto;
}

.year-selector {
  max-width: 200px;
}

.month-card {
  transition: transform 0.2s, box-shadow 0.2s;
  height: 150px;
  border-radius: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .payment-info {
    margin-top: 1rem;

    &.unpaid {
      opacity: 0.7;
    }
  }
}

.paid-month {
  border-left: 4px solid #21BA45; // Green border for paid months

  .text-subtitle1 {
    font-weight: bold;
    color: #21BA45;
  }
}

.payment-details-card {
  border-radius: 8px;

  .q-item {
    padding: 8px 0;
  }
}
</style>
