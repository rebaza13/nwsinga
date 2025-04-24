import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useFirebase } from 'src/composables/useFirebase';
import type { Building } from 'src/models/property';
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
  
  // Initialize with sample data if in development
  async function initializeWithSampleData() {
    // Check if we already have data
    const buildingsSnapshot = await getDocs(collection(db, 'buildings'));
    if (!buildingsSnapshot.empty) return;
    
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
    initializeWithSampleData
  };
});
