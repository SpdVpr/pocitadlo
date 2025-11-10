const { initializeApp } = require('firebase/app');
const { getFirestore, doc, deleteDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupOldTimer() {
  try {
    const oldTimerRef = doc(db, 'active_timer', 'current');
    await deleteDoc(oldTimerRef);
    console.log('✅ Starý dokument active_timer/current byl úspěšně smazán');
    process.exit(0);
  } catch (error) {
    if (error.code === 'not-found') {
      console.log('✅ Starý dokument již neexistuje');
      process.exit(0);
    }
    console.error('❌ Chyba při mazání:', error);
    process.exit(1);
  }
}

cleanupOldTimer();
