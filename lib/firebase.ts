import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, indexedDBLocalPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

setPersistence(auth, indexedDBLocalPersistence)
  .then(() => {
    console.log('[FIREBASE] ✅ Persistence set to indexedDB (best for mobile)');
  })
  .catch((error) => {
    console.warn('[FIREBASE] indexedDB persistence failed, trying browserLocal:', error);
    return setPersistence(auth, browserLocalPersistence);
  })
  .catch((error) => {
    console.error('[FIREBASE] ❌ All persistence methods failed:', error);
  });

export { app, db, auth };
