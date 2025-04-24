import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useFirebase } from 'src/composables/useFirebase';
import type { Activity } from 'src/models/property';
import { collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from 'src/boot/firebase';

export const useActivityStore = defineStore('activity', () => {
  const { getCollection, addDocument } = useFirebase();
  
  // State
  const activities = ref<Activity[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Actions
  async function fetchActivities() {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await getCollection('activities');
      activities.value = data as Activity[];
    } catch (err) {
      console.error('Error fetching activities:', err);
      error.value = 'Failed to load activities';
    } finally {
      loading.value = false;
    }
  }
  
  async function addActivity(activity: Omit<Activity, 'id' | 'createdAt'>) {
    loading.value = true;
    error.value = null;
    
    try {
      const newActivity = {
        ...activity,
        createdAt: serverTimestamp()
      };
      
      const id = await addDocument('activities', newActivity);
      activities.value.push({ ...newActivity, id } as Activity);
      return id;
    } catch (err) {
      console.error('Error adding activity:', err);
      error.value = 'Failed to add activity';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  
  // Initialize with sample data if in development
  async function initializeWithSampleData() {
    // Check if we already have data
    const activitiesSnapshot = await getDocs(collection(db, 'activities'));
    if (!activitiesSnapshot.empty) return;
    
    // Sample activities
    const sampleActivities = [
      {
        title: 'Payment Received',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Received $1,200 from John Doe for Property #103',
        icon: 'payments',
        color: 'positive',
        createdAt: serverTimestamp()
      },
      {
        title: 'New Tenant',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Sarah Johnson signed a lease for Property #205',
        icon: 'person_add',
        color: 'info',
        createdAt: serverTimestamp()
      },
      {
        title: 'Maintenance Request',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Plumbing issue reported at Property #118',
        icon: 'build',
        color: 'warning',
        createdAt: serverTimestamp()
      },
      {
        title: 'Contract Renewal',
        date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Michael Brown renewed lease for Property #307',
        icon: 'description',
        color: 'primary',
        createdAt: serverTimestamp()
      }
    ];
    
    // Add sample activities to Firestore
    for (const activity of sampleActivities) {
      await addDocument('activities', activity);
    }
    
    // Fetch the activities we just added
    await fetchActivities();
  }
  
  return {
    activities,
    loading,
    error,
    fetchActivities,
    addActivity,
    initializeWithSampleData
  };
});
