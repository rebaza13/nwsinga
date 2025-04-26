<template>
  <div class="contract-form-container">
    <div class="q-pa-md">
      <q-form @submit="submitContract" class="q-gutter-md">
        <!-- Contract Title -->
        <q-input v-model="form.title" label="Contract Title *" outlined
          :rules="[val => !!val || 'Contract title is required']" />

        <!-- Contract Type -->
        <q-select v-model="form.contractType" :options="contractTypes" option-label="label" option-value="value"
          label="Contract Type *" outlined emit-value map-options :rules="[val => !!val || 'Contract type is required']"
          @update:model-value="onContractTypeChange">
          <template v-slot:option="{ itemProps, opt }">
            <q-item v-bind="itemProps">
              <q-item-section>
                <q-item-label>{{ opt.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <!-- Start Date -->
        <q-input v-model="form.startDate" label="Start Date *" outlined
          :rules="[val => !!val || 'Start date is required']">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="form.startDate" mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <!-- End Date -->
        <q-input v-model="form.endDate" label="End Date *" outlined :rules="[
          val => !!val || 'End date is required',
          val => new Date(val) > new Date(form.startDate!!) || 'End date must be after start date'
        ]">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="form.endDate" mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <!-- Amount -->
        <q-input v-model.number="form.amount" :label="amountLabel" type="number" outlined prefix="$" :rules="[
          val => !!val || 'Amount is required',
          val => val > 0 || 'Amount must be greater than 0'
        ]" />

        <!-- Deposit Amount -->
        <q-input v-model.number="form.depositAmount" label="Deposit Amount *" type="number" outlined prefix="$" :rules="[
          val => !!val || 'Deposit amount is required',
          val => val > 0 || 'Deposit amount must be greater than 0',
          val => form.contractType !== 'lease' || val <= form.amount * 2 || 'Deposit should not exceed 2 months of rent'
        ]" />

        <!-- Created By -->
        <q-input v-model="form.createdBy" label="Created By *" outlined
          :rules="[val => !!val || 'Creator name is required']" />

        <!-- Notes -->
        <q-input v-model="form.notes" label="Notes" type="textarea" outlined autogrow />

        <!-- Submit Buttons -->
        <div class="row justify-end q-mt-md q-gutter-sm">
          <q-btn label="Cancel" flat color="grey" @click="$emit('cancel')" />
          <q-btn :label="isEditing ? 'Update Contract' : 'Create Contract'" type="submit" color="primary"
            :loading="contractStore.loading" />
        </div>
      </q-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useContractStore } from 'src/stores/contract-store';
import { useQuasar } from 'quasar';
import type { Contract } from 'src/models/property';

const $q = useQuasar();
const contractStore = useContractStore();

const props = defineProps<{
  contract?: Contract;
  isEditing?: boolean;
}>();

const emit = defineEmits<{
  (e: 'contract-added'): void;
  (e: 'contract-updated'): void;
  (e: 'cancel'): void;
}>();

const contractTypes = [
  { label: 'Sale Contract', value: 'sale' },
  { label: 'Lease Agreement', value: 'lease' },
  { label: 'Other Contract', value: 'other' }
];

const isEditing = ref(props.isEditing || false);

const form = ref({
  title: '',
  contractType: 'lease' as 'sale' | 'lease' | 'other',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
  amount: 0,
  depositAmount: 0,
  isActive: true,
  createdBy: '',
  notes: ''
});

// Computed property for amount label based on contract type
const amountLabel = computed(() => {
  if (form.value.contractType === 'lease') {
    return 'Monthly Rent *';
  } else if (form.value.contractType === 'sale') {
    return 'Sale Price *';
  } else {
    return 'Contract Amount *';
  }
});

// Initialize form with contract data if editing
onMounted(() => {
  if (props.contract) {
    form.value = {
      title: props.contract.title || '',
      contractType: props.contract.contractType || 'lease',
      startDate: typeof props.contract.startDate === 'string'
        ? props.contract.startDate
        : new Date(props.contract.startDate).toISOString().split('T')[0],
      endDate: typeof props.contract.endDate === 'string'
        ? props.contract.endDate
        : new Date(props.contract.endDate).toISOString().split('T')[0],
      amount: props.contract.amount || 0,
      depositAmount: props.contract.depositAmount || 0,
      isActive: props.contract.isActive,
      createdBy: props.contract.createdBy || '',
      notes: props.contract.notes || ''
    };
  }
});

// Handle contract type change
function onContractTypeChange(value: 'sale' | 'lease' | 'other') {
  // Adjust deposit amount based on contract type
  if (value === 'lease' && form.value.depositAmount === 0) {
    // Default deposit to one month's rent for lease contracts
    form.value.depositAmount = form.value.amount;
  }
}

async function submitContract() {
  try {
    const contractData: Omit<Contract, 'id' | 'createdAt'> = {
      title: form.value.title || '',
      contractType: form.value.contractType,
      startDate: form.value.startDate || new Date().toISOString().split('T')[0],
      endDate: form.value.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      amount: form.value.amount,
      depositAmount: form.value.depositAmount,
      isActive: form.value.isActive,
      createdBy: form.value.createdBy || '',
      notes: form.value.notes || ''
    };

    if (isEditing.value && props.contract?.id) {
      // Update existing contract
      await contractStore.updateContract(props.contract.id, contractData);
      emit('contract-updated');
    } else {
      // Add new contract
      await contractStore.addContract(contractData);

      // Reset form
      form.value = {
        title: '',
        contractType: 'lease',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        amount: 0,
        depositAmount: 0,
        isActive: true,
        createdBy: '',
        notes: ''
      };

      emit('contract-added');
    }

  } catch (error) {
    $q.notify({
      color: 'negative',
      message: isEditing.value ? 'Failed to update contract' : 'Failed to create contract',
      icon: 'error'
    });
    console.error('Error with contract:', error);
  }
}
</script>

<style lang="scss" scoped>
.contract-form-container {
  max-width: 800px;
  margin: 0 auto;
}
</style>