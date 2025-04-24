<template>
  <div class="building-form">
    <q-form @submit="submitBuilding" class="q-gutter-md">
      <!-- Building Information -->
      <div class="row q-mb-md">
        <div class="col-12">
          <div class="text-subtitle1 text-weight-medium">Building Information</div>
        </div>
        
        <!-- Name -->
        <div class="col-12 col-md-6 q-pr-md-md q-mb-md">
          <q-input
            v-model="form.name"
            label="Building Name *"
            outlined
            dense
            :rules="[val => !!val || 'Name is required']"
          />
        </div>
        
        <!-- Total Units -->
        <div class="col-12 col-md-6 q-mb-md">
          <q-input
            v-model.number="form.totalUnits"
            label="Total Units *"
            type="number"
            outlined
            dense
            :rules="[
              val => !!val || 'Total units is required',
              val => val > 0 || 'Total units must be greater than 0'
            ]"
          />
        </div>
        
        <!-- Address -->
        <div class="col-12 q-mb-md">
          <q-input
            v-model="form.address"
            label="Address *"
            outlined
            dense
            :rules="[val => !!val || 'Address is required']"
          />
        </div>
      </div>
      
      <!-- Additional Information -->
      <div class="row q-mb-md">
        <div class="col-12">
          <div class="text-subtitle1 text-weight-medium">Additional Information</div>
        </div>
        
        <!-- Image URL -->
        <div class="col-12 q-mb-md">
          <q-input
            v-model="form.imageUrl"
            label="Image URL"
            outlined
            dense
          />
        </div>
      </div>
      
      <!-- Submit Button -->
      <div class="row justify-end q-mt-md">
        <q-btn
          label="Cancel"
          flat
          color="negative"
          class="q-mr-sm"
          @click="$emit('cancel')"
          :disable="loading"
        />
        <q-btn
          label="Add Building"
          type="submit"
          color="primary"
          :loading="loading"
        />
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useBuildingStore } from 'src/stores/building-store';
import type { Building } from 'src/models/property';

const emit = defineEmits<{
  (e: 'building-added'): void;
  (e: 'cancel'): void;
}>();

const $q = useQuasar();
const buildingStore = useBuildingStore();
const loading = ref(false);

// Form data
const form = ref({
  name: '',
  address: '',
  totalUnits: 1,
  imageUrl: 'https://placehold.co/600x400'
});

async function submitBuilding() {
  loading.value = true;
  
  try {
    const newBuilding: Omit<Building, 'id' | 'createdAt' | 'updatedAt'> = {
      name: form.value.name,
      address: form.value.address,
      totalUnits: form.value.totalUnits,
      imageUrl: form.value.imageUrl
    };
    
    // Add building to Firestore
    await buildingStore.addBuilding(newBuilding);
    
    $q.notify({
      color: 'positive',
      message: 'Building added successfully',
      icon: 'check_circle'
    });
    
    // Reset form
    form.value = {
      name: '',
      address: '',
      totalUnits: 1,
      imageUrl: 'https://placehold.co/600x400'
    };
    
    // Emit event to parent component
    emit('building-added');
  } catch (error) {
    console.error('Error adding building:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to add building',
      icon: 'error'
    });
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.building-form {
  max-width: 800px;
  margin: 0 auto;
}
</style>
