<template>
  <div class="contract-form-container">
    <div class="q-pa-md">
      <q-form @submit="submitContract" class="q-gutter-md">
        <!-- Contract Title -->
        <q-input 
          v-model="form.title" 
          label="Contract Title *" 
          outlined
          :rules="[val => !!val || 'Contract title is required']"
        />

        <!-- Contract Type -->
        <q-select 
          v-model="form.contractType" 
          :options="contractTypes" 
          option-label="label"
          option-value="value"
          label="Contract Type *" 
          outlined 
          emit-value 
          map-options
          :rules="[val => !!val || 'Contract type is required']"
        >
          <template v-slot:option="{ itemProps, opt }">
            <q-item v-bind="itemProps">
              <q-item-section>
                <q-item-label>{{ opt.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <!-- Start Date -->
        <q-input 
          v-model="form.startDate" 
          label="Start Date *" 
          outlined
          :rules="[val => !!val || 'Start date is required']"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="form.startDate" mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <!-- End Date -->
        <q-input 
          v-model="form.endDate" 
          label="End Date *" 
          outlined 
          :rules="[
            val => !!val || 'End date is required',
            val => new Date(val) > new Date(form.startDate) || 'End date must be after start date'
          ]"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="form.endDate" mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <!-- Amount -->
        <q-input 
          v-model.number="form.amount" 
          label="Contract Amount *" 
          type="number" 
          outlined 
          prefix="$" 
          :rules="[
            val => !!val || 'Amount is required',
            val => val > 0 || 'Amount must be greater than 0'
          ]" 
        />

        <!-- Deposit Amount -->
        <q-input 
          v-model.number="form.depositAmount" 
          label="Deposit Amount *" 
          type="number" 
          outlined 
          prefix="$" 
          :rules="[
            val => !!val || 'Deposit amount is required',
            val => val > 0 || 'Deposit amount must be greater than 0'
          ]" 
        />

        <!-- Created By -->
        <q-input 
          v-model="form.createdBy" 
          label="Created By *" 
          outlined
          :rules="[val => !!val || 'Creator name is required']" 
        />

        <!-- Notes -->
        <q-input 
          v-model="form.notes" 
          label="Notes" 
          type="textarea" 
          outlined 
          autogrow 
        />

        <!-- Submit Button -->
        <div class="row justify-end q-mt-md">
          <q-btn 
            label="Create Contract" 
            type="submit" 
            color="primary" 
            :loading="contractStore.loading" 
          />
        </div>
      </q-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useContractStore } from 'src/stores/contract-store';
import { useQuasar } from 'quasar';
import type { Contract } from 'src/models/property';

const $q = useQuasar();
const contractStore = useContractStore();

const emit = defineEmits<{
  (e: 'contract-added'): void
}>();

const contractTypes = [
  { label: 'Sale Contract', value: 'sale' },
  { label: 'Lease Agreement', value: 'lease' },
  { label: 'Other Contract', value: 'other' }
];

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

async function submitContract() {
  try {
    const newContract: Omit<Contract, 'id' | 'createdAt'> = {
      title: form.value.title,
      contractType: form.value.contractType,
      startDate: form.value.startDate,
      endDate: form.value.endDate,
      amount: form.value.amount,
      depositAmount: form.value.depositAmount,
      isActive: form.value.isActive,
      createdBy: form.value.createdBy,
      notes: form.value.notes
    };

    await contractStore.addContract(newContract);

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

    // Emit event to parent component
    emit('contract-added');

  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Failed to create contract',
      icon: 'error'
    });
    console.error('Error creating contract:', error);
  }
}
</script>

<style lang="scss" scoped>
.contract-form-container {
  max-width: 800px;
  margin: 0 auto;
}
</style>
