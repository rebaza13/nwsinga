<template>
  <div class="tenant-form">
    <q-form @submit="submitTenant" class="q-gutter-md">
      <!-- Tenant Information -->
      <div class="form-section">
        <div class="form-section__title">Tenant Information</div>
        <div class="form-grid">
          <!-- Name -->
          <q-input v-model="form.name" label="Tenant Name *" outlined dense
            :rules="[val => !!val || 'Name is required']" />

          <!-- Email -->
          <q-input v-model="form.email" label="Email *" type="email" outlined dense :rules="[
            val => !!val || 'Email is required',
            val => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(val) || 'Please enter a valid email'
          ]" />

          <!-- Phone -->
          <q-input v-model="form.phone" label="Phone *" outlined dense :rules="[val => !!val || 'Phone is required']" />
        </div>
      </div>

      <!-- Property Information -->
      <div class="form-section">
        <div class="form-section__title">Property Information</div>
        <div class="form-grid">
          <!-- Building -->
          <q-select v-model="form.buildingId" :options="buildingOptions" label="Building *" option-label="label"
            option-value="value" map-options emit-value outlined dense
            :rules="[val => !!val || 'Building is required']">
            <template v-slot:option="{ itemProps, opt }">
              <q-item v-bind="itemProps">
                <q-item-section>
                  <q-item-label>{{ opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>




        </div>
      </div>

      <!-- Lease Information -->
      <div class="form-section">
        <div class="form-section__title">Lease Information</div>
        <div class="form-grid">
          <!-- Lease Start -->
          <q-input v-model="form.leaseStart" label="Lease Start Date *" outlined dense
            :rules="[val => !!val || 'Lease start date is required']">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.leaseStart" mask="YYYY-MM-DD" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <!-- Lease End -->
          <q-input v-model="form.leaseEnd" label="Lease End Date *" outlined dense :rules="[
            val => !!val || 'Lease end date is required',
            val => new Date(val) > new Date(form.leaseStart!!) || 'End date must be after start date'
          ]">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.leaseEnd" mask="YYYY-MM-DD" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <!-- Monthly Rent -->
          <q-input v-model.number="form.monthlyRent" label="Monthly Rent *" type="number" outlined dense
            :rules="[val => !!val || 'Monthly rent is required']" prefix="$" />
        </div>
      </div>

      <!-- Additional Information -->
      <div class="form-section">
        <div class="form-section__title">Additional Information</div>
        <div class="form-grid">
          <!-- Notes -->
          <q-input v-model="form.notes" label="Notes" type="textarea" outlined dense autogrow class="col-span-full" />
        </div>
      </div>

      <!-- Submit Button -->
      <div class="form-footer row justify-end q-mt-md">
        <q-btn label="Cancel" flat color="negative" class="q-mr-sm" @click="$emit('cancel')" :disable="loading" />
        <q-btn label="Add Tenant" type="submit" color="primary" :loading="loading" />
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useBuildingStore } from 'src/stores/building-store';
import type { Tenant } from 'src/models/property';

const props = defineProps({
  buildingId: {
    type: String,
    default: null
  }
});

const emit = defineEmits<{
  (e: 'tenant-added'): void;
  (e: 'cancel'): void;
}>();

const $q = useQuasar();
const buildingStore = useBuildingStore();
const loading = ref(false);

// Form data
const form = ref({
  name: '',
  email: '',
  phone: '',
  buildingId: props.buildingId || '',
  leaseStart: new Date().toISOString().split('T')[0],
  leaseEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
  monthlyRent: 1000,
  notes: ''
});

// Building options for select
const buildingOptions = computed(() => {
  return buildingStore.buildings.map(building => ({
    label: building.name,
    value: building.id
  }));
});

// Load buildings
onMounted(async () => {
  if (buildingStore.buildings.length === 0) {
    await buildingStore.fetchBuildings();
  }

  // If buildingId is provided, set it in the form
  if (props.buildingId) {
    form.value.buildingId = props.buildingId;
  }
});

async function submitTenant() {
  loading.value = true;

  try {
    const newTenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'> = {
      name: form.value.name,
      email: form.value.email,
      phone: form.value.phone,
      buildingId: form.value.buildingId,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      leaseStart: form.value.leaseStart,
      leaseEnd: form.value.leaseEnd as string | Date,
      monthlyRent: form.value.monthlyRent,
      notes: form.value.notes
    };

    // Add tenant to Firestore
    console.log('Submitting tenant:', newTenant);
    await buildingStore.addTenant(newTenant);

    $q.notify({
      color: 'positive',
      message: 'Tenant added successfully',
      icon: 'check_circle'
    });

    // Reset form
    form.value = {
      name: '',
      email: '',
      phone: '',
      buildingId: props.buildingId || '',
      leaseStart: new Date().toISOString().split('T')[0],
      leaseEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      monthlyRent: 1000,
      notes: ''
    };

    // Emit event to parent component
    emit('tenant-added');
  } catch (error) {
    console.error('Error adding tenant:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to add tenant',
      icon: 'error'
    });
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.tenant-form {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 60px; // Space for the sticky footer
}

.col-span-full {
  grid-column: 1 / -1;
}

// Mobile optimizations
@media (max-width: 599px) {
  .tenant-form {
    padding: 0;
  }

  .form-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px 16px;
    background: white;
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
    z-index: 100;
  }

  .body--dark .form-footer {
    background: #1d1d1d;
  }
}
</style>
