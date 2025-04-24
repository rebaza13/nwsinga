<template>
  <div class="property-form">
    <q-form @submit="submitProperty" class="q-gutter-md">
      <!-- Property Information -->
      <div class="row q-mb-md">
        <div class="col-12">
          <div class="text-subtitle1 text-weight-medium">Property Information</div>
        </div>

        <!-- Name -->
        <div class="col-12 col-md-6 q-pr-md-md q-mb-md">
          <q-input v-model="form.name" label="Property Name *" outlined dense
            :rules="[val => !!val || 'Name is required']" />
        </div>

        <!-- Type -->
        <div class="col-12 col-md-6 q-mb-md">
          <q-select v-model="form.type" :options="['House', 'Apartment', 'Shop'] as PropertyType[]"
            label="Property Type *" outlined dense :rules="[val => !!val || 'Property type is required']">
            <template v-slot:option="{ itemProps, opt }">
              <q-item v-bind="itemProps">
                <q-item-section>
                  <q-item-label>{{ opt }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!-- Address -->
        <div class="col-12 q-mb-md">
          <q-input v-model="form.address" label="Address *" outlined dense
            :rules="[val => !!val || 'Address is required']" />
        </div>
      </div>

      <!-- Financial Information -->
      <div class="row q-mb-md">
        <div class="col-12">
          <div class="text-subtitle1 text-weight-medium">Financial Information</div>
        </div>

        <!-- Price -->
        <div class="col-12 col-md-6 q-pr-md-md q-mb-md">
          <q-input v-model.number="form.price" label="Price *" type="number" outlined dense prefix="$" :rules="[
            val => !!val || 'Price is required',
            val => val > 0 || 'Price must be greater than 0'
          ]" />
        </div>

        <!-- Status -->
        <div class="col-12 col-md-6 q-mb-md">
          <q-select v-model="form.status" :options="statusOptions" label="Status *" outlined dense
            :rules="[val => !!val || 'Status is required']">
            <template v-slot:option="{ itemProps, opt }">
              <q-item v-bind="itemProps">
                <q-item-section>
                  <q-item-label>
                    <q-badge :color="getStatusColor(opt)" text-color="white" class="q-mr-sm">
                      {{ opt }}
                    </q-badge>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:selected>
              <q-badge :color="getStatusColor(form.status)" text-color="white" class="q-mr-sm">
                {{ form.status }}
              </q-badge>
            </template>
          </q-select>
        </div>
      </div>

      <!-- Additional Information -->
      <div class="row q-mb-md">
        <div class="col-12">
          <div class="text-subtitle1 text-weight-medium">Additional Information</div>
        </div>

        <!-- Square Meters -->
        <div class="col-12 col-md-6 q-pr-md-md q-mb-md">
          <q-input v-model.number="form.squareMeters" label="Square Meters" type="number" outlined dense suffix="m²" />
        </div>

        <!-- Contact Phone -->
        <div class="col-12 col-md-6 q-mb-md">
          <q-input v-model="form.contactPhone" label="Contact Phone" outlined dense>
            <template v-slot:prepend>
              <q-icon name="phone" />
            </template>
          </q-input>
        </div>

        <!-- Description -->
        <div class="col-12 q-mb-md">
          <q-input v-model="form.description" label="Description" type="textarea" outlined dense autogrow />
        </div>

        <!-- Image URL -->
        <div class="col-12 q-mb-md">
          <q-input v-model="form.imageUrl" label="Image URL" outlined dense>
            <template v-slot:prepend>
              <q-icon name="image" />
            </template>
            <template v-slot:append>
              <q-icon name="home" v-if="!form.imageUrl" class="cursor-pointer"
                @click="form.imageUrl = 'https://placehold.co/600x400?text=Property'">
                <q-tooltip>Use default house icon</q-tooltip>
              </q-icon>
            </template>
          </q-input>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="row justify-end q-mt-md">
        <q-btn label="Cancel" flat color="negative" class="q-mr-sm" @click="$emit('cancel')" :disable="loading" />
        <q-btn :label="props.property ? 'Update Property' : 'Add Property'" type="submit" color="primary"
          :loading="loading" />
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { usePropertyStore } from 'src/stores/property-store';
import type { Property } from 'src/models/property';

// Static property types from the Property interface
type PropertyType = Property['type'];

const props = defineProps<{
  property?: Property | null;
}>();

const emit = defineEmits<{
  (e: 'property-added'): void;
  (e: 'property-updated'): void;
  (e: 'cancel'): void;
}>();

const $q = useQuasar();
const propertyStore = usePropertyStore();
const loading = ref(false);

const statusOptions = [
  'available',
  'sold',
  'rented'
];

// Form data
const form = ref({
  name: '',
  type: 'Apartment' as PropertyType,
  address: '',
  price: 0,
  status: 'available' as 'available' | 'sold' | 'rented',
  squareMeters: 100,
  contactPhone: '',
  description: '',
  imageUrl: 'https://placehold.co/600x400'
});

function getStatusColor(status: string): string {
  switch (status) {
    case 'available':
      return 'green';
    case 'sold':
      return 'blue';
    case 'rented':
      return 'orange';
    default:
      return 'grey';
  }
}

onMounted(() => {
  // Initialize form with property data if editing
  if (props.property) {
    form.value = {
      name: props.property.name,
      type: props.property.type,
      address: props.property.address,
      price: props.property.price || 0,
      status: props.property.status || 'available',
      squareMeters: props.property.squareMeters || 100,
      contactPhone: props.property.contactPhone || '',
      description: props.property.description || '',
      imageUrl: props.property.imageUrl || 'https://placehold.co/600x400'
    };
  }
});

async function submitProperty() {
  loading.value = true;

  try {
    const propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'> = {
      name: form.value.name,
      type: form.value.type,
      address: form.value.address,
      price: form.value.price,
      status: form.value.status,
      squareMeters: form.value.squareMeters,
      contactPhone: form.value.contactPhone,
      description: form.value.description,
      imageUrl: form.value.imageUrl
    };

    if (props.property && props.property.id) {
      // Update existing property
      await propertyStore.updateProperty(props.property.id, propertyData);

      $q.notify({
        color: 'positive',
        message: 'Property updated successfully',
        icon: 'check_circle'
      });

      emit('property-updated');
    } else {
      // Add new property
      await propertyStore.addProperty(propertyData);

      $q.notify({
        color: 'positive',
        message: 'Property added successfully',
        icon: 'check_circle'
      });

      // Reset form
      form.value = {
        name: '',
        type: 'Apartment' as PropertyType,
        address: '',
        price: 0,
        status: 'available' as 'available' | 'sold' | 'rented',
        squareMeters: 100,
        contactPhone: '',
        description: '',
        imageUrl: 'https://placehold.co/600x400'
      };

      emit('property-added');
    }
  } catch (error) {
    console.error('Error saving property:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to save property',
      icon: 'error'
    });
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.property-form {
  max-width: 800px;
  margin: 0 auto;
}
</style>
