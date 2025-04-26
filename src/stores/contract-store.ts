import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useFirebase } from 'src/composables/useFirebase';
import type { Contract } from 'src/models/property';
import { collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from 'src/boot/firebase';

export const useContractStore = defineStore('contract', () => {
  const { getCollection, addDocument, updateDocument, deleteDocument } = useFirebase();

  // State
  const contracts = ref<Contract[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const activeContracts = computed(() =>
    contracts.value.filter(contract => contract.isActive)
  );

  const expiringSoonContracts = computed(() => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return contracts.value.filter(contract => {
      const endDate = new Date(contract.endDate);
      return contract.isActive && endDate <= thirtyDaysFromNow && endDate >= new Date();
    });
  });

  const totalMonthlyIncome = computed(() =>
    contracts.value
      .filter(contract => contract.isActive && contract.contractType === 'lease')
      .reduce((sum, contract) => sum + contract.amount, 0)
  );

  // Actions
  async function fetchContracts() {
    loading.value = true;
    error.value = null;

    try {
      const data = await getCollection('contracts');
      contracts.value = data as Contract[];
    } catch (err) {
      console.error('Error fetching contracts:', err);
      error.value = 'Failed to load contracts';
    } finally {
      loading.value = false;
    }
  }

  async function addContract(contract: Omit<Contract, 'id' | 'createdAt'>) {
    loading.value = true;
    error.value = null;

    try {
      const newContract = {
        ...contract,
        createdAt: serverTimestamp()
      };

      const id = await addDocument('contracts', newContract);

      const enhancedContract: Contract = {
        ...newContract,
        id
      };

      contracts.value.push(enhancedContract);

      return id;
    } catch (err) {
      console.error('Error adding contract:', err);
      error.value = 'Failed to add contract';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Initialize with sample data if in development
  async function initializeWithSampleData() {
    // Check if we already have data
    const contractsSnapshot = await getDocs(collection(db, 'contracts'));
    if (!contractsSnapshot.empty) return;

    // Sample contracts
    const today = new Date();
    const oneYearFromNow = new Date(today);
    oneYearFromNow.setFullYear(today.getFullYear() + 1);

    const sixMonthsFromNow = new Date(today);
    sixMonthsFromNow.setMonth(today.getMonth() + 6);

    const oneMonthFromNow = new Date(today);
    oneMonthFromNow.setMonth(today.getMonth() + 1);

    // Sample contracts
    const sampleContracts = [
      {
        title: 'Property Sale Agreement',
        contractType: 'sale',
        startDate: today.toISOString(),
        endDate: oneYearFromNow.toISOString(),
        amount: 250000,
        depositAmount: 25000,
        isActive: true,
        createdBy: 'Admin',
        notes: 'Sale contract for downtown property',
        createdAt: serverTimestamp()
      },
      {
        title: 'Commercial Lease Agreement',
        contractType: 'lease',
        startDate: new Date(today.setMonth(today.getMonth() - 3)).toISOString(),
        endDate: sixMonthsFromNow.toISOString(),
        amount: 2200,
        depositAmount: 4400,
        isActive: true,
        createdBy: 'Admin',
        notes: '6-month commercial lease',
        createdAt: serverTimestamp()
      },
      {
        title: 'Residential Lease Contract',
        contractType: 'lease',
        startDate: new Date(today.setMonth(today.getMonth() - 11)).toISOString(),
        endDate: oneMonthFromNow.toISOString(),
        amount: 1800,
        depositAmount: 3600,
        isActive: true,
        createdBy: 'Admin',
        notes: 'Expiring soon, needs renewal',
        createdAt: serverTimestamp()
      }
    ];

    // Add sample contracts to Firestore
    for (const contract of sampleContracts) {
      await addDocument('contracts', contract);
    }

    // Fetch the contracts we just added
    await fetchContracts();
  }

  async function updateContract(id: string, contract: Omit<Contract, 'id' | 'createdAt'>) {
    loading.value = true;
    error.value = null;

    try {
      await updateDocument('contracts', id, contract);

      // Update the contract in the local state
      const index = contracts.value.findIndex(c => c.id === id);
      if (index !== -1) {
        contracts.value[index] = {
          ...contract,
          id,
          createdAt: contracts.value[index].createdAt
        };
      }

      return id;
    } catch (err) {
      console.error('Error updating contract:', err);
      error.value = 'Failed to update contract';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteContract(id: string) {
    loading.value = true;
    error.value = null;

    try {
      await deleteDocument('contracts', id);

      // Remove the contract from the local state
      contracts.value = contracts.value.filter(c => c.id !== id);
    } catch (err) {
      console.error('Error deleting contract:', err);
      error.value = 'Failed to delete contract';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    contracts,
    loading,
    error,
    activeContracts,
    expiringSoonContracts,
    totalMonthlyIncome,
    fetchContracts,
    addContract,
    updateContract,
    deleteContract,
    initializeWithSampleData
  };
});
