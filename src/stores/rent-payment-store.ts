import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useFirebase } from 'src/composables/useFirebase';
import type { RentPayment } from 'src/models/property';
import { collection, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from 'src/boot/firebase';
import { usePropertyStore } from './property-store';
import { useContractStore } from './contract-store';

export const useRentPaymentStore = defineStore('rentPayment', () => {
  const { getCollection, addDocument, deleteDocument } = useFirebase();
  const propertyStore = usePropertyStore();
  const contractStore = useContractStore();

  // State
  const rentPayments = ref<RentPayment[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const paymentsByTenant = computed(() => {
    const result: Record<string, RentPayment[]> = {};

    rentPayments.value.forEach(payment => {
      if (!result[payment.tenantId]) {
        result[payment.tenantId] = [];
      }
      result[payment.tenantId].push(payment);
    });

    // Sort payments by date (newest first) for each tenant
    Object.keys(result).forEach(tenantId => {
      result[tenantId].sort((a, b) => {
        const dateA = new Date(a.paymentDate).getTime();
        const dateB = new Date(b.paymentDate).getTime();
        return dateB - dateA;
      });
    });

    return result;
  });

  const paymentsByMonth = computed(() => {
    const result: Record<string, RentPayment[]> = {};

    rentPayments.value.forEach(payment => {
      if (!result[payment.paymentMonth]) {
        result[payment.paymentMonth] = [];
      }
      result[payment.paymentMonth].push(payment);
    });

    return result;
  });

  const totalPaymentsByTenant = computed(() => {
    const result: Record<string, number> = {};

    rentPayments.value.forEach(payment => {
      if (!result[payment.tenantId]) {
        result[payment.tenantId] = 0;
      }
      result[payment.tenantId] += payment.amount;
    });

    return result;
  });

  const totalPaymentsByMonth = computed(() => {
    const result: Record<string, number> = {};

    rentPayments.value.forEach(payment => {
      if (!result[payment.paymentMonth]) {
        result[payment.paymentMonth] = 0;
      }
      result[payment.paymentMonth] += payment.amount;
    });

    return result;
  });

  const totalPayments = computed(() => {
    return rentPayments.value.reduce((total, payment) => total + payment.amount, 0);
  });

  // Actions
  async function fetchRentPayments() {
    loading.value = true;
    error.value = null;

    try {
      // First ensure we have properties and tenants loaded
      if (propertyStore.properties.length === 0) {
        await propertyStore.fetchProperties();
      }

      if (propertyStore.tenants.length === 0) {
        await propertyStore.fetchTenants();
      }

      const data = await getCollection('rentPayments');

      // Enhance payments with tenant names and property types for display
      rentPayments.value = (data as RentPayment[]).map(payment => {
        const tenant = propertyStore.tenants.find(t => t.id === payment.tenantId);

        return {
          ...payment,
          propertyName: tenant?.propertyType || 'Unknown Property Type',
          tenantName: tenant?.name || 'Unknown Tenant'
        };
      });
    } catch (err) {
      console.error('Error fetching rent payments:', err);
      error.value = 'Failed to load rent payments';
    } finally {
      loading.value = false;
    }
  }

  async function fetchRentPaymentsByTenant(tenantId: string) {
    loading.value = true;
    error.value = null;

    try {
      console.log(`Fetching payments for tenant: ${tenantId}`);

      // Make sure we have tenants loaded
      if (propertyStore.tenants.length === 0) {
        await propertyStore.fetchTenants();
      }

      // First check if we already have payments for this tenant in the store
      const existingPayments = rentPayments.value.filter(p => p.tenantId === tenantId);
      console.log(`Found ${existingPayments.length} existing payments in store`);

      // Always fetch fresh from Firestore to ensure we have the latest
      const q = query(
        collection(db, 'rentPayments'),
        where('tenantId', '==', tenantId)
      );

      const querySnapshot = await getDocs(q);
      console.log(`Firestore query returned ${querySnapshot.size} documents`);

      const payments: RentPayment[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`Payment document:`, { id: doc.id, ...data });
        payments.push({ id: doc.id, ...data } as RentPayment);
      });

      // Get tenant info
      const tenant = propertyStore.tenants.find(t => t.id === tenantId);
      console.log(`Tenant info:`, tenant);

      // Enhance each payment with tenant names and property type
      const enhancedPayments = payments.map(payment => {
        return {
          ...payment,
          propertyName: tenant?.propertyType || 'Unknown Property Type',
          tenantName: tenant?.name || 'Unknown Tenant'
        };
      });

      console.log(`Enhanced ${enhancedPayments.length} payments for tenant ${tenantId}`);

      // Update the store with these payments
      const updatedPayments = [...rentPayments.value];

      // Remove existing payments for this tenant
      const filteredPayments = updatedPayments.filter(p => p.tenantId !== tenantId);

      // Add the newly fetched payments
      rentPayments.value = [...filteredPayments, ...enhancedPayments];

      console.log(`Updated store with ${enhancedPayments.length} payments for tenant ${tenantId}`);

      return enhancedPayments;
    } catch (err) {
      console.error('Error fetching rent payments by tenant:', err);
      error.value = 'Failed to load rent payments';
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function addRentPayment(payment: Omit<RentPayment, 'id' | 'createdAt' | 'propertyName' | 'tenantName'>) {
    loading.value = true;
    error.value = null;

    try {
      console.log('Adding rent payment to store:', payment);

      // Make sure we have tenants loaded
      if (propertyStore.tenants.length === 0) {
        await propertyStore.fetchTenants();
      }

      const newPayment = {
        ...payment,
        createdAt: serverTimestamp()
      };

      // Add to Firestore
      const id = await addDocument('rentPayments', newPayment);
      console.log('Payment added to Firestore with ID:', id);

      // Get tenant info
      const tenant = propertyStore.tenants.find(t => t.id === payment.tenantId);
      console.log('Tenant info for payment:', tenant);

      // Create enhanced payment with display info
      const enhancedPayment: RentPayment = {
        ...newPayment,
        id,
        propertyName: tenant?.propertyType || 'Unknown Property Type',
        tenantName: tenant?.name || 'Unknown Tenant'
      };

      // Create a new array to trigger reactivity
      rentPayments.value = [...rentPayments.value, enhancedPayment];

      // Log the updated state
      console.log('Updated rentPayments array:', rentPayments.value);
      console.log('Total payments:', totalPayments.value);
      console.log('Payments by month:', totalPaymentsByMonth.value);

      // Immediately fetch all payments to ensure consistency
      await fetchRentPayments();

      // Also fetch payments for this specific tenant
      await fetchRentPaymentsByTenant(payment.tenantId);

      return id;
    } catch (err) {
      console.error('Error adding rent payment:', err);
      error.value = 'Failed to add rent payment';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteRentPayment(id: string) {
    loading.value = true;
    error.value = null;

    try {
      await deleteDocument('rentPayments', id);
      rentPayments.value = rentPayments.value.filter(p => p.id !== id);
    } catch (err) {
      console.error('Error deleting rent payment:', err);
      error.value = 'Failed to delete rent payment';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Helper function to get payment months for a year
  function getPaymentMonthsForYear(year: number) {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const month = i + 1;
      months.push(`${year}-${month.toString().padStart(2, '0')}`);
    }
    return months;
  }

  // Helper function to get current year's payment months
  function getCurrentYearPaymentMonths() {
    return getPaymentMonthsForYear(new Date().getFullYear());
  }

  // Initialize with sample data if in development
  async function initializeWithSampleData() {
    // Check if we already have data
    const paymentsSnapshot = await getDocs(collection(db, 'rentPayments'));
    if (!paymentsSnapshot.empty) return;

    // Make sure we have properties, tenants, and contracts
    await propertyStore.initializeWithSampleData();
    await contractStore.initializeWithSampleData();

    // Get properties, tenants, and contracts
    await propertyStore.fetchProperties();
    await propertyStore.fetchTenants();
    await contractStore.fetchContracts();

    if (propertyStore.properties.length === 0 ||
        propertyStore.tenants.length === 0 ||
        contractStore.contracts.length === 0) {
      console.error('Cannot initialize rent payments without properties, tenants, and contracts');
      return;
    }

    // Sample rent payments
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    // Create sample payments for each contract for the past few months
    for (const contract of contractStore.contracts) {
      // Generate payments for the last 3 months
      for (let i = 0; i < 3; i++) {
        const month = currentMonth - i;
        const year = month <= 0 ? currentYear - 1 : currentYear;
        const adjustedMonth = month <= 0 ? month + 12 : month;

        const paymentMonth = `${year}-${adjustedMonth.toString().padStart(2, '0')}`;
        const paymentDate = new Date(year, adjustedMonth - 1, 15); // 15th of the month

        const samplePayment = {
          tenantId: contract.tenantId,
          amount: contract.monthlyRent,
          paymentDate: paymentDate.toISOString(),
          paymentMonth: paymentMonth,
          paymentMethod: ['cash', 'bank transfer', 'check'][Math.floor(Math.random() * 3)] as 'cash' | 'bank transfer' | 'check',
          receiptNumber: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
          notes: `Rent payment for ${paymentMonth}`,
          createdBy: 'Admin',
          createdAt: serverTimestamp()
        };

        await addDocument('rentPayments', samplePayment);
      }
    }

    // Fetch the payments we just added
    await fetchRentPayments();
  }

  return {
    rentPayments,
    loading,
    error,
    paymentsByTenant,
    paymentsByMonth,
    totalPaymentsByTenant,
    totalPaymentsByMonth,
    totalPayments,
    fetchRentPayments,
    fetchRentPaymentsByTenant,
    addRentPayment,
    deleteRentPayment,
    getPaymentMonthsForYear,
    getCurrentYearPaymentMonths,
    initializeWithSampleData
  };
});
