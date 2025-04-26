<template>
  <div class="rent-payment-form">
    <q-form @submit="submitPayment" class="q-gutter-md">
      <!-- Tenant Information (Read-only) -->
      <div class="row q-mb-md">
        <div class="col-12">
          <div class="text-subtitle1 text-weight-medium">Tenant Information</div>
        </div>
        <div class="col-12 col-md-6 q-pr-md">
          <q-input v-model="tenantName" label="Tenant Name" outlined readonly dense />
        </div>
        <div class="col-12 col-md-6">
          <q-input v-model="propertyName" label="Property" outlined readonly dense />
        </div>
      </div>

      <!-- Payment Details -->
      <div class="row q-mb-md">
        <div class="col-12">
          <div class="text-subtitle1 text-weight-medium">Payment Details</div>
        </div>

        <!-- Payment Month -->
        <div class="col-12 col-md-6 q-pr-md q-mb-md">
          <q-select v-model="form.paymentMonth" :options="availableMonths" label="Payment Month *" outlined dense
            map-options emit-value :rules="[val => !!val || 'Payment month is required']">
            <template v-slot:option="{ itemProps, opt }">
              <q-item v-bind="itemProps">
                <q-item-section>
                  <q-item-label>{{ formatMonthYear(opt) }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:selected>
              {{ formatMonthYear(form.paymentMonth) }}
            </template>
          </q-select>
        </div>

        <!-- Payment Date -->
        <div class="col-12 col-md-6 q-mb-md">
          <q-input v-model="form.paymentDate" label="Payment Date *" outlined dense
            :rules="[val => !!val || 'Payment date is required']">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.paymentDate" mask="YYYY-MM-DD" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <!-- Amount -->
        <div class="col-12 col-md-6 q-pr-md q-mb-md">
          <q-input v-model.number="form.amount" label="Amount (IQD) *" type="number" outlined dense suffix="IQD" :rules="[
            val => !!val || 'Amount is required',
            val => val > 0 || 'Amount must be greater than 0'
          ]" />
        </div>

        <!-- Payment Method -->
        <div class="col-12 col-md-6 q-mb-md">
          <q-select v-model="form.paymentMethod" :options="paymentMethods" label="Payment Method *" outlined dense
            :rules="[val => !!val || 'Payment method is required']" />
        </div>

        <!-- Receipt Number -->
        <div class="col-12 col-md-6 q-pr-md q-mb-md">
          <q-input v-model="form.receiptNumber" label="Receipt Number" outlined dense />
        </div>

        <!-- Created By -->
        <div class="col-12 col-md-6 q-mb-md">
          <q-input v-model="form.createdBy" label="Recorded By *" outlined dense
            :rules="[val => !!val || 'Recorder name is required']" />
        </div>

        <!-- Notes -->
        <div class="col-12 q-mb-md">
          <q-input v-model="form.notes" label="Notes" type="textarea" outlined dense autogrow />
        </div>
      </div>

      <!-- Submit Button -->
      <div class="row justify-end q-mt-md">
        <q-btn label="Cancel" flat color="negative" class="q-mr-sm" @click="$emit('cancel')" :disable="loading" />
        <q-btn label="Record Payment" type="submit" color="primary" :loading="loading" />
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRentPaymentStore } from 'src/stores/rent-payment-store';
import type { Tenant, RentPayment } from 'src/models/property';
import { formatMonthYear } from 'src/utils/format-utils';

const props = defineProps<{
  tenant: Tenant;
}>();

const emit = defineEmits<{
  (e: 'payment-added'): void;
  (e: 'cancel'): void;
}>();

const $q = useQuasar();
const rentPaymentStore = useRentPaymentStore();
// propertyStore is not used in this component
const loading = ref(false);

// Computed properties
const tenantName = computed(() => props.tenant.name);
const propertyName = computed(() => {
  return `Building ${props.tenant.buildingId || 'Unknown'}`;
});

// No contract check needed

const paymentMethods = [
  'cash',
  'bank transfer',
  'check',
  'credit card',
  'other'
];

const availableMonths = computed(() => {
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  // Get months for current year and last year
  const currentYearMonths = rentPaymentStore.getPaymentMonthsForYear(currentYear);
  const lastYearMonths = rentPaymentStore.getPaymentMonthsForYear(lastYear);

  // Combine and return all months
  return [...currentYearMonths, ...lastYearMonths];
});

// Form data
const form = ref({
  paymentMonth: getCurrentMonth(),
  paymentDate: new Date().toISOString().split('T')[0],
  amount: 0,
  paymentMethod: 'cash',
  receiptNumber: generateReceiptNumber(),
  createdBy: '',
  notes: `Rent payment for ${formatMonthYear(getCurrentMonth())}`
});

onMounted(async () => {
  // Nothing to initialize
});

function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}

// formatMonthYear is now imported from src/utils/format-utils

function generateReceiptNumber() {
  return `REC-${Math.floor(1000 + Math.random() * 9000)}`;
}

async function submitPayment() {
  loading.value = true;

  try {
    console.log('Recording payment for tenant:', props.tenant.id, 'month:', form.value.paymentMonth);

    // First check if a payment already exists for this month
    const existingPayments = await rentPaymentStore.fetchRentPaymentsByTenant(props.tenant.id as string);
    console.log('Existing payments:', existingPayments);

    const paymentExists = existingPayments.some(p => p.paymentMonth === form.value.paymentMonth);

    if (paymentExists) {
      $q.notify({
        color: 'negative',
        message: `Payment for ${formatMonthYear(form.value.paymentMonth)} already exists`,
        icon: 'error'
      });
      loading.value = false;
      return;
    }

    const newPayment: Omit<RentPayment, 'id' | 'createdAt' | 'propertyName' | 'tenantName'> = {
      tenantId: props.tenant.id as string,
      amount: form.value.amount,
      paymentDate: form.value.paymentDate,
      paymentMonth: form.value.paymentMonth,
      paymentMethod: form.value.paymentMethod as 'cash' | 'bank transfer' | 'check' | 'credit card' | 'other',
      receiptNumber: form.value.receiptNumber,
      notes: form.value.notes,
      createdBy: form.value.createdBy
    };

    console.log('Adding new payment for tenant:', props.tenant.id);

    try {
      // Add the payment to the database
      const paymentId = await rentPaymentStore.addRentPayment(newPayment);
      console.log('Payment added with ID:', paymentId);

      // Refresh all data to ensure UI is updated
      await rentPaymentStore.fetchRentPayments();

      // Force a refresh of this tenant's payments
      const updatedPayments = await rentPaymentStore.fetchRentPaymentsByTenant(props.tenant.id as string);
      console.log('Updated payments for tenant:', updatedPayments);
      console.log('Payment months:', updatedPayments.map(p => p.paymentMonth));
    } catch (error) {
      console.error('Error in payment process:', error);
      throw error; // Re-throw to be caught by the outer try/catch
    }

    $q.notify({
      color: 'positive',
      message: 'Payment recorded successfully',
      icon: 'check_circle'
    });

    // Emit event to notify parent component
    emit('payment-added');
  } catch (error) {
    console.error('Error recording payment:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to record payment',
      icon: 'error'
    });
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.rent-payment-form {
  max-width: 800px;
  margin: 0 auto;
}
</style>
