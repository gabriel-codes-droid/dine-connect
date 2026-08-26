// Firebase Configuration
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAuth, type Auth } from 'firebase/auth';

const RAW_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
const isPlaceholderKey = !RAW_API_KEY || RAW_API_KEY.startsWith('YOUR_') || RAW_API_KEY.includes('YOUR_PROJECT_ID');

const firebaseConfig = {
  apiKey: RAW_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let auth: Auth | null = null;

if (typeof window !== 'undefined') {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    if (!isPlaceholderKey) {
      db = getFirestore(app);
      storage = getStorage(app);
      auth = getAuth(app);
    } else {
      console.debug('Firebase: placeholder config detected — Firestore disabled, using mock data');
    }
  } catch (error) {
    console.error('Firebase initialization failed:', error);
  }
}

export { app, db, storage, auth };
export default firebaseConfig;
