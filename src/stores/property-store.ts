import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useFirebase } from 'src/composables/useFirebase';
import type { Property, Tenant, Payment, DashboardStats } from 'src/models/property';
import {
  collection,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from 'src/boot/firebase';

export const usePropertyStore = defineStore('property', () => {
  const { getCollection, addDocument, updateDocument, deleteDocument } = useFirebase();

  // State
  const properties = ref<Property[]>([]);
  const tenants = ref<Tenant[]>([]);
  const payments = ref<Payment[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Dashboard stats
  const dashboardStats = ref<DashboardStats>({
    totalRentalIncome: 0,
    totalProperties: 0,
    activeContracts: 0,
    lastMonthIncome: 0,
    newProperties: 0,
    pendingRenewals: 0
  });

  // Getters
  const occupiedProperties = computed(() =>
    properties.value.filter(p => p.status === 'rented')
  );

  const vacantProperties = computed(() =>
    properties.value.filter(p => p.status === 'available')
  );

  const totalMonthlyRent = computed(() =>
    properties.value
      .filter(p => p.status === 'rented')
      .reduce((sum, property) => sum + (property.price / 12), 0)
  );

  // Actions
  async function fetchProperties() {
    loading.value = true;
    error.value = null;

    try {
      const data = await getCollection('properties');
      properties.value = data as Property[];
      calculateDashboardStats();
    } catch (err) {
      console.error('Error fetching properties:', err);
      error.value = 'Failed to load properties';
    } finally {
      loading.value = false;
    }
  }

  async function fetchTenants() {
    loading.value = true;
    error.value = null;

    try {
      const data = await getCollection('tenants');
      tenants.value = data as Tenant[];
    } catch (err) {
      console.error('Error fetching tenants:', err);
      error.value = 'Failed to load tenants';
    } finally {
      loading.value = false;
    }
  }

  async function fetchPayments() {
    loading.value = true;
    error.value = null;

    try {
      const data = await getCollection('payments');
      payments.value = data as Payment[];
      calculateDashboardStats();
    } catch (err) {
      console.error('Error fetching payments:', err);
      error.value = 'Failed to load payments';
    } finally {
      loading.value = false;
    }
  }

  async function addProperty(property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) {
    loading.value = true;
    error.value = null;

    try {
      const newProperty = {
        ...property,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const id = await addDocument('properties', newProperty);
      properties.value.push({ ...newProperty, id } as Property);
      calculateDashboardStats();
      return id;
    } catch (err) {
      console.error('Error adding property:', err);
      error.value = 'Failed to add property';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateProperty(id: string, property: Partial<Property>) {
    loading.value = true;
    error.value = null;

    try {
      const updatedProperty = {
        ...property,
        updatedAt: serverTimestamp()
      };

      await updateDocument('properties', id, updatedProperty);

      const index = properties.value.findIndex(p => p.id === id);
      if (index !== -1) {
        properties.value[index] = { ...properties.value[index], ...updatedProperty };
      }

      calculateDashboardStats();
    } catch (err) {
      console.error('Error updating property:', err);
      error.value = 'Failed to update property';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteProperty(id: string) {
    loading.value = true;
    error.value = null;

    try {
      await deleteDocument('properties', id);
      properties.value = properties.value.filter(p => p.id !== id);
      calculateDashboardStats();
    } catch (err) {
      console.error('Error deleting property:', err);
      error.value = 'Failed to delete property';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function addTenant(tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>) {
    loading.value = true;
    error.value = null;

    try {
      const newTenant = {
        ...tenant,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const id = await addDocument('tenants', newTenant);
      tenants.value.push({ ...newTenant, id } as Tenant);
      return id;
    } catch (err) {
      console.error('Error adding tenant:', err);
      error.value = 'Failed to add tenant';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function calculateDashboardStats() {
    // For demo purposes, we'll calculate some stats based on the data we have
    // In a real app, you might want to do this on the server side

    // Calculate total properties
    dashboardStats.value.totalProperties = properties.value.length;

    // Calculate active contracts (rented properties)
    dashboardStats.value.activeContracts = properties.value.filter(p => p.status === 'rented').length;

    // Calculate total rental income (sum of all prices for rented properties)
    // For properties that are rented, we'll use price as the annual rent, and divide by 12 for monthly
    dashboardStats.value.totalRentalIncome = properties.value
      .filter(p => p.status === 'rented')
      .reduce((sum, p) => sum + (p.price / 12), 0);

    // For demo purposes, set last month income to 90% of current
    dashboardStats.value.lastMonthIncome = Math.round(dashboardStats.value.totalRentalIncome * 0.9);

    // Count properties created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    dashboardStats.value.newProperties = properties.value.filter(p => {
      const createdAt = p.createdAt instanceof Date
        ? p.createdAt
        : new Date((p.createdAt as { seconds: number })?.seconds * 1000 || 0);
      return createdAt > thirtyDaysAgo;
    }).length;

    // For demo, set pending renewals to 2
    dashboardStats.value.pendingRenewals = 2;
  }

  // Initialize with sample data if in development
  async function initializeWithSampleData() {
    // Check if we already have data
    const propertiesSnapshot = await getDocs(collection(db, 'properties'));
    if (!propertiesSnapshot.empty) return;

    // Sample properties - using only the three static property types: House, Apartment, Shop
    const sampleProperties = [
      {
        name: 'Luxury Apartment',
        address: '123 Sunset Blvd, Los Angeles, CA',
        type: 'Apartment',
        price: 250000,
        status: 'available',
        squareMeters: 85,
        contactPhone: '(123) 456-7890',
        description: 'Beautiful luxury apartment with modern amenities',
        imageUrl: 'https://placehold.co/600x400',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        name: 'Downtown Shop',
        address: '456 Ocean Ave, Miami, FL',
        type: 'Shop',
        price: 450000,
        status: 'available',
        squareMeters: 120,
        contactPhone: '(123) 456-7891',
        description: 'Prime location shop in downtown area',
        imageUrl: 'https://placehold.co/600x400',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        name: 'Modern Apartment',
        address: '789 Main St, New York, NY',
        type: 'Apartment',
        price: 320000,
        status: 'sold',
        squareMeters: 95,
        contactPhone: '(123) 456-7892',
        description: 'Modern apartment with great city views',
        imageUrl: 'https://placehold.co/600x400',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        name: 'Family House',
        address: '321 Park Rd, Chicago, IL',
        type: 'House',
        price: 550000,
        status: 'available',
        squareMeters: 180,
        contactPhone: '(123) 456-7893',
        description: 'Spacious family house with garden',
        imageUrl: 'https://placehold.co/600x400',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        name: 'Rental Apartment',
        address: '555 Rental Ave, Boston, MA',
        type: 'Apartment',
        price: 36000, // $3000 per month * 12 = $36,000 per year
        status: 'rented',
        squareMeters: 75,
        contactPhone: '(123) 456-7894',
        description: 'Cozy apartment currently rented out',
        imageUrl: 'https://placehold.co/600x400',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        name: 'Rental Shop',
        address: '777 Business St, Seattle, WA',
        type: 'Shop',
        price: 60000, // $5000 per month * 12 = $60,000 per year
        status: 'rented',
        squareMeters: 150,
        contactPhone: '(123) 456-7895',
        description: 'Commercial shop space with current tenant',
        imageUrl: 'https://placehold.co/600x400',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    // Add sample properties to Firestore
    for (const property of sampleProperties) {
      await addDocument('properties', property);
    }

    // Fetch the properties we just added
    await fetchProperties();
  }

  return {
    properties,
    tenants,
    payments,
    loading,
    error,
    dashboardStats,
    occupiedProperties,
    vacantProperties,
    totalMonthlyRent,
    fetchProperties,
    fetchTenants,
    fetchPayments,
    addProperty,
    updateProperty,
    deleteProperty,
    addTenant,
    initializeWithSampleData
  };
});
