import { initializeApp } from 'firebase/app';
import { initializeFirestore, CACHE_SIZE_UNLIMITED, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD1t2AKrSAoY7RklFTfQpEKtxRbAgIr7E0",
  authDomain: "nwsingatest.firebaseapp.com",
  projectId: "nwsingatest",
  storageBucket: "nwsingatest.firebasestorage.app",
  messagingSenderId: "545366628547",
  appId: "1:545366628547:web:5a368ecc0f6c2575fdea76"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore with settings optimized for mobile
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    tabManager: persistentMultipleTabManager()
  })
});

export default app;