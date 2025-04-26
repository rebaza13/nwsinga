import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useFirebase } from 'src/composables/useFirebase';
import type { Building, Tenant } from 'src/models/property';
import { collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from 'src/boot/firebase';

export const useBuildingStore = defineStore('building', () => {
  const { getCollection, addDocument, updateDocument, deleteDocument } = useFirebase();

  // State
  const buildings = ref<Building[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const buildingOptions = computed(() => {
    return buildings.value.map(building => ({
      label: building.name,
      value: building.id
    }));
  });

  // Actions
  async function fetchBuildings() {
    loading.value = true;
    error.value = null;

    try {
      const data = await getCollection('buildings');
      buildings.value = data as Building[];
    } catch (err) {
      console.error('Error fetching buildings:', err);
      error.value = 'Failed to load buildings';
    } finally {
      loading.value = false;
    }
  }

  async function addBuilding(building: Omit<Building, 'id' | 'createdAt' | 'updatedAt'>) {
    loading.value = true;
    error.value = null;

    try {
      const newBuilding = {
        ...building,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const id = await addDocument('buildings', newBuilding);
      buildings.value.push({ ...newBuilding, id } as Building);
      return id;
    } catch (err) {
      console.error('Error adding building:', err);
      error.value = 'Failed to add building';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateBuilding(id: string, building: Partial<Building>) {
    loading.value = true;
    error.value = null;

    try {
      const updatedBuilding = {
        ...building,
        updatedAt: serverTimestamp()
      };

      await updateDocument('buildings', id, updatedBuilding);

      const index = buildings.value.findIndex(b => b.id === id);
      if (index !== -1) {
        buildings.value[index] = { ...buildings.value[index], ...updatedBuilding };
      }
    } catch (err) {
      console.error('Error updating building:', err);
      error.value = 'Failed to update building';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteBuilding(id: string) {
    loading.value = true;
    error.value = null;

    try {
      await deleteDocument('buildings', id);
      buildings.value = buildings.value.filter(b => b.id !== id);
    } catch (err) {
      console.error('Error deleting building:', err);
      error.value = 'Failed to delete building';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function getBuildingById(id: string): Building | undefined {
    return buildings.value.find(b => b.id === id);
  }

  function getBuildingName(id?: string): string {
    if (!id) return 'Not Assigned';
    const building = getBuildingById(id);
    return building ? building.name : 'Unknown Building';
  }

  async function addTenant(tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>) {
    loading.value = true;
    error.value = null;

    try {
      console.log('Building store received tenant:', tenant);

      // Ensure tenants collection exists
      await ensureTenantsCollection();

      const newTenant = {
        ...tenant,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('Prepared tenant for Firestore:', newTenant);

      const id = await addDocument('tenants', newTenant);
      console.log('Tenant added with ID:', id);
      return id;
    } catch (err) {
      console.error('Error adding tenant:', err);
      console.error('Error details:', JSON.stringify(err));
      error.value = 'Failed to add tenant';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Check if tenants collection exists
  async function ensureTenantsCollection() {
    try {
      // Try to get the tenants collection
      const tenantsSnapshot = await getDocs(collection(db, 'tenants'));
      console.log('Tenants collection exists with', tenantsSnapshot.size, 'documents');
      return true;
    } catch (err) {
      console.error('Error checking tenants collection:', err);
      // If there's an error, try to create a dummy document to initialize the collection
      try {
        console.log('Attempting to initialize tenants collection...');
        await addDocument('tenants', {
          name: 'Initialization',
          createdAt: serverTimestamp()
        });
        console.log('Tenants collection initialized');
        return true;
      } catch (initErr) {
        console.error('Failed to initialize tenants collection:', initErr);
        return false;
      }
    }
  }

  // Initialize with sample data if in development
  async function initializeWithSampleData() {
    // Check if we already have data
    const buildingsSnapshot = await getDocs(collection(db, 'buildings'));
    if (!buildingsSnapshot.empty) return;

    // Ensure tenants collection exists
    await ensureTenantsCollection();

    // Sample buildings
    const sampleBuildings = [
      {
        name: 'Building A',
        address: '123 Main Street, Cityville',
        totalUnits: 10,
        imageUrl: 'https://placehold.co/600x400',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        name: 'Building B',
        address: '456 Oak Avenue, Townsburg',
        totalUnits: 8,
        imageUrl: 'https://placehold.co/600x400',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        name: 'Building C',
        address: '789 Pine Road, Villageton',
        totalUnits: 12,
        imageUrl: 'https://placehold.co/600x400',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    // Add sample buildings to Firestore
    for (const building of sampleBuildings) {
      await addDocument('buildings', building);
    }

    // Fetch the buildings we just added
    await fetchBuildings();
  }

  return {
    buildings,
    loading,
    error,
    buildingOptions,
    fetchBuildings,
    addBuilding,
    updateBuilding,
    deleteBuilding,
    getBuildingById,
    getBuildingName,
    addTenant,
    initializeWithSampleData
  };
});
