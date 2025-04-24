import { db } from 'src/boot/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';

export function useFirebase() {
  const getCollection = async (collectionName: string) => {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting collection:', error);
      throw error;
    }
  };

  const addDocument = async (collectionName: string, data: unknown) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      return docRef.id;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  };

  const updateDocument = async (collectionName: string, docId: string, data: unknown) => {
    try {
      const docRef = doc(db, collectionName, docId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateDoc(docRef, data as { [key: string]: any });
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  };

  const deleteDocument = async (collectionName: string, docId: string) => {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  };

  return {
    getCollection,
    addDocument,
    updateDocument,
    deleteDocument
  };
}

