<template>
  <q-page class="q-pa-md">
    <!-- Header Section -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h4 class="q-my-none text-weight-bold">{{ $t('properties.title') }}</h4>
        <p class="text-grey-8 q-mt-sm">{{ $t('properties.manage') }}</p>
      </div>
      <div class="col-auto">
        <q-btn color="primary" icon-right="add" :label="$t('properties.add')" @click="showAddPropertyDialog = true" />
        <q-btn color="primary" flat icon-right="refresh" :label="$t('app.refresh')" class="q-ml-sm" @click="refreshData"
          :loading="isLoading" />
      </div>
    </div>

    <!-- Filter Section -->
    <div class="row q-mb-md">
      <div class="col-12 col-md-4">
        <q-select v-model="selectedType" :options="propertyTypes" :label="$t('properties.filterByType')" outlined dense clearable
          @update:model-value="filterProperties">
          <template v-slot:prepend>
            <q-icon name="category" />
          </template>
        </q-select>
      </div>
    </div>

    <!-- Properties Grid -->
    <div class="row q-col-gutter-md">
      <div v-for="property in filteredProperties" :key="property.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
        <q-card class="property-card">
          <q-img :src="property.imageUrl || 'https://placehold.co/600x400?text=Property'" height="200px">
            <div class="absolute-top-right q-pa-xs">
              <q-badge :color="getStatusColor(property.status)" class="text-capitalize">
                {{ $t(`properties.${property.status}`) }}
              </q-badge>
            </div>
          </q-img>

          <q-card-section>
            <div class="text-h6 ellipsis">{{ property.name }}</div>
            <div class="text-subtitle2 text-grey-8">{{ $t(`properties.${property.type.toLowerCase()}`) }}</div>

            <div class="row q-mt-sm items-center">
              <q-icon name="location_on" size="xs" color="grey-7" />
              <div class="text-caption text-grey-8 q-ml-xs ellipsis">{{ property.address }}</div>
            </div>

            <div v-if="property.contactPhone" class="row q-mt-sm items-center">
              <q-icon name="phone" size="xs" color="grey-7" />
              <div class="text-caption text-grey-8 q-ml-xs">{{ property.contactPhone }}</div>
            </div>

            <div class="row q-mt-sm items-center">
              <q-icon name="attach_money" size="xs" color="grey-7" />
              <div class="text-caption text-grey-8 q-ml-xs">{{ formatCurrency(property.price || 0) }}</div>
            </div>

            <div class="row q-mt-sm items-center">
              <q-icon name="square_foot" size="xs" color="grey-7" />
              <div class="text-caption text-grey-8 q-ml-xs">{{ property.squareMeters || '100' }} m²</div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions>
            <q-btn flat color="primary" icon="edit" :label="$t('app.edit')" @click="editProperty(property)" />
            <q-space />
            <q-btn flat color="negative" icon="delete" @click="confirmDeleteProperty(property)" />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Empty State -->
      <div v-if="filteredProperties.length === 0" class="col-12 text-center q-pa-xl">
        <q-icon name="home_work" size="100px" color="grey-4" />
        <div class="text-h6 text-grey-6 q-mt-md">{{ $t('properties.noProperties') }}</div>
        <div class="text-grey-6 q-mb-md">{{ $t('properties.addPropertyPrompt') }}</div>
        <q-btn color="primary" icon="add" :label="$t('properties.add')" @click="showAddPropertyDialog = true" />
      </div>
    </div>

    <!-- Add Property Dialog -->
    <q-dialog v-model="showAddPropertyDialog" persistent maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editMode ? $t('properties.edit') : $t('properties.add') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <property-form :property="selectedProperty" @property-added="onPropertyAdded"
            @property-updated="onPropertyUpdated" @cancel="closePropertyDialog" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteConfirmation" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">{{ $t('properties.deleteConfirm') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('app.cancel')" color="primary" v-close-popup />
          <q-btn flat :label="$t('app.delete')" color="negative" @click="deleteProperty" :loading="isDeleting" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import PropertyForm from 'src/components/PropertyForm.vue';
import { usePropertyStore } from 'src/stores/property-store';
import type { Property } from 'src/models/property';

useI18n(); // Initialize i18n

const $q = useQuasar();
const propertyStore = usePropertyStore();
const isLoading = ref(false);
const isDeleting = ref(false);
const showAddPropertyDialog = ref(false);
const showDeleteConfirmation = ref(false);
const selectedProperty = ref<Property | null>(null);
const selectedType = ref<string | null>(null);
const editMode = ref(false);

const propertyTypes = ['House', 'Apartment', 'Shop'];

// Computed properties
const filteredProperties = computed(() => {
  let properties = propertyStore.properties;

  // Filter by type
  if (selectedType.value) {
    properties = properties.filter(p => p.type === selectedType.value);
  }

  return properties;
});

onMounted(async () => {
  await refreshData();
});

async function refreshData() {
  isLoading.value = true;
  try {
    await propertyStore.fetchProperties();
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

function filterProperties() {
  // This function is called when filters change
  // The filtering is handled by the computed property
}

function editProperty(property: Property) {
  selectedProperty.value = { ...property };
  editMode.value = true;
  showAddPropertyDialog.value = true;
}

function confirmDeleteProperty(property: Property) {
  selectedProperty.value = property;
  showDeleteConfirmation.value = true;
}

async function deleteProperty() {
  if (!selectedProperty.value) return;

  isDeleting.value = true;
  try {
    await propertyStore.deleteProperty(selectedProperty.value.id as string);

    $q.notify({
      color: 'positive',
      message: $t('properties.deleteSuccess'),
      icon: 'check_circle'
    });

    showDeleteConfirmation.value = false;
    await refreshData();
  } catch (error) {
    console.error('Error deleting property:', error);
    $q.notify({
      color: 'negative',
      message: $t('app.error'),
      icon: 'error'
    });
  } finally {
    isDeleting.value = false;
  }
}

function onPropertyAdded(): void {
  showAddPropertyDialog.value = false;
  void refreshData(); // Use void operator to explicitly ignore the promise

  $q.notify({
    color: 'positive',
    message: $t('properties.addSuccess'),
    icon: 'check_circle'
  });
}

function onPropertyUpdated(): void {
  showAddPropertyDialog.value = false;
  void refreshData(); // Use void operator to explicitly ignore the promise

  $q.notify({
    color: 'positive',
    message: $t('properties.updateSuccess'),
    icon: 'check_circle'
  });
}

function closePropertyDialog() {
  showAddPropertyDialog.value = false;
  selectedProperty.value = null;
  editMode.value = false;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'available':
      return 'positive';
    case 'sold':
      return 'negative';
    case 'rented':
      return 'warning';
    default:
      return 'grey';
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}
</script>

<style lang="scss" scoped>
.property-card {
  transition: transform 0.3s, box-shadow 0.3s;
  height: 100%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
  }
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
