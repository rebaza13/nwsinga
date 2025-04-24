import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useFirebase } from 'src/composables/useFirebase';
import type { Task } from 'src/models/property';
import { collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from 'src/boot/firebase';

export const useTaskStore = defineStore('task', () => {
  const { getCollection, addDocument, updateDocument, deleteDocument } = useFirebase();
  
  // State
  const tasks = ref<Task[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Actions
  async function fetchTasks() {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await getCollection('tasks');
      tasks.value = data as Task[];
    } catch (err) {
      console.error('Error fetching tasks:', err);
      error.value = 'Failed to load tasks';
    } finally {
      loading.value = false;
    }
  }
  
  async function addTask(task: Omit<Task, 'id' | 'createdAt'>) {
    loading.value = true;
    error.value = null;
    
    try {
      const newTask = {
        ...task,
        createdAt: serverTimestamp()
      };
      
      const id = await addDocument('tasks', newTask);
      tasks.value.push({ ...newTask, id } as Task);
      return id;
    } catch (err) {
      console.error('Error adding task:', err);
      error.value = 'Failed to add task';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  
  async function updateTask(id: string, task: Partial<Task>) {
    loading.value = true;
    error.value = null;
    
    try {
      await updateDocument('tasks', id, task);
      
      const index = tasks.value.findIndex(t => t.id === id);
      if (index !== -1) {
        tasks.value[index] = { ...tasks.value[index], ...task };
      }
    } catch (err) {
      console.error('Error updating task:', err);
      error.value = 'Failed to update task';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  
  async function deleteTask(id: string) {
    loading.value = true;
    error.value = null;
    
    try {
      await deleteDocument('tasks', id);
      tasks.value = tasks.value.filter(t => t.id !== id);
    } catch (err) {
      console.error('Error deleting task:', err);
      error.value = 'Failed to delete task';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  
  async function toggleTaskStatus(id: string) {
    const task = tasks.value.find(t => t.id === id);
    if (task) {
      await updateTask(id, { done: !task.done });
    }
  }
  
  // Initialize with sample data if in development
  async function initializeWithSampleData() {
    // Check if we already have data
    const tasksSnapshot = await getDocs(collection(db, 'tasks'));
    if (!tasksSnapshot.empty) return;
    
    // Sample tasks
    const sampleTasks = [
      {
        title: 'Collect rent from tenant #103',
        due: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        done: false,
        priority: 'high',
        createdAt: serverTimestamp()
      },
      {
        title: 'Schedule property inspection',
        due: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        done: false,
        priority: 'medium',
        createdAt: serverTimestamp()
      },
      {
        title: 'Renew contract for property #7',
        due: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        done: true,
        priority: 'medium',
        createdAt: serverTimestamp()
      },
      {
        title: 'Fix plumbing issue at property #2',
        due: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        done: false,
        priority: 'high',
        createdAt: serverTimestamp()
      }
    ];
    
    // Add sample tasks to Firestore
    for (const task of sampleTasks) {
      await addDocument('tasks', task);
    }
    
    // Fetch the tasks we just added
    await fetchTasks();
  }
  
  return {
    tasks,
    loading,
    error,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    initializeWithSampleData
  };
});
