<template>
  <div class="tenant-form">
    <q-form @submit="submitTenant" class="q-gutter-md">
      <!-- Tenant Information -->
      <div class="row q-mb-md">
        <div class="col-12">
          <div class="text-subtitle1 text-weight-medium">Tenant Information</div>
        </div>

        <!-- Name -->
        <div class="col-12 col-md-6 q-pr-md-md q-mb-md">
          <q-input v-model="form.name" label="Tenant Name *" outlined dense
            :rules="[val => !!val || 'Name is required']" />
        </div>

        <!-- Email -->
        <div class="col-12 col-md-6 q-mb-md">
          <q-input v-model="form.email" label="Email *" type="email" outlined dense :rules="[
            val => !!val || 'Email is required',
            val => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(val) || 'Please enter a valid email'
          ]" />
        </div>

        <!-- Phone -->
        <div class="col-12 col-md-6 q-pr-md-md q-mb-md">
          <q-input v-model="form.phone" label="Phone *" outlined dense :rules="[val => !!val || 'Phone is required']" />
        </div>

        <!-- Property Type -->
        <div class="col-12 col-md-6 q-mb-md">
          <q-select v-model="form.propertyType" :options="['House', 'Apartment', 'Shop']" label="Property Type *"
            outlined dense :rules="[val => !!val || 'Property type is required']">
            <template v-slot:option="{ itemProps, opt }">
              <q-item v-bind="itemProps">
                <q-item-section>
                  <q-item-label>{{ opt }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>


      </div>

      <!-- Lease Information -->
      <div class="row q-mb-md">
        <div class="col-12">
          <div class="text-subtitle1 text-weight-medium">Lease Information</div>
        </div>

        <!-- Lease Start -->
        <div class="col-12 col-md-6 q-pr-md-md q-mb-md">
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
        </div>

        <!-- Lease End -->
        <div class="col-12 col-md-6 q-mb-md">
          <q-input v-model="form.leaseEnd" label="Lease End Date *" outlined dense :rules="[
            val => !!val || 'Lease end date is required',
            val => new Date(val) > new Date(form.leaseStart) || 'End date must be after start date'
          ]">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.leaseEnd" mask="YYYY-MM-DD" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      </div>

      <!-- Additional Information -->
      <div class="row q-mb-md">
        <div class="col-12">
          <div class="text-subtitle1 text-weight-medium">Additional Information</div>
        </div>

        <!-- Notes -->
        <div class="col-12 q-mb-md">
          <q-input v-model="form.notes" label="Notes" type="textarea" outlined dense autogrow />
        </div>
      </div>

      <!-- Submit Button -->
      <div class="row justify-end q-mt-md">
        <q-btn label="Cancel" flat color="negative" class="q-mr-sm" @click="$emit('cancel')" :disable="loading" />
        <q-btn label="Add Tenant" type="submit" color="primary" :loading="loading" />
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { usePropertyStore } from 'src/stores/property-store';
import type { Tenant } from 'src/models/property';

const emit = defineEmits<{
  (e: 'tenant-added'): void;
  (e: 'cancel'): void;
}>();

const $q = useQuasar();
const propertyStore = usePropertyStore();
const loading = ref(false);

// Form data
const form = ref({
  name: '',
  email: '',
  phone: '',
  propertyType: 'Apartment', // One of: 'House', 'Apartment', 'Shop'
  leaseStart: new Date().toISOString().split('T')[0],
  leaseEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
  notes: ''
});

// No need to load properties anymore
onMounted(async () => {
  // Nothing to initialize
});

async function submitTenant() {
  loading.value = true;

  try {
    const newTenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'> = {
      name: form.value.name,
      email: form.value.email,
      phone: form.value.phone,
      propertyType: form.value.propertyType, // Include the property type
      leaseStart: form.value.leaseStart,
      leaseEnd: form.value.leaseEnd
    };

    // Add tenant to Firestore
    await propertyStore.addTenant(newTenant);

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
      propertyType: 'Apartment', // One of: 'House', 'Apartment', 'Shop'
      leaseStart: new Date().toISOString().split('T')[0],
      leaseEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
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
}
</style>
