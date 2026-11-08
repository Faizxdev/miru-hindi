import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration — strictly from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Only initialize Firebase if we have a valid API key.
// During Vercel's build-time static generation, env vars may be missing,
// so we must guard against crashing with "auth/invalid-api-key".
function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseConfig.apiKey) {
    return null;
  }
  if (getApps().length > 0) {
    return getApps()[0];
  }
  return initializeApp(firebaseConfig);
}

const app = getFirebaseApp();
export const isFirebaseConfigured = Boolean(app);

// Safe accessors — return real services or throw-safe stubs
export const auth: Auth = app ? getAuth(app) : ({} as Auth);
export const db: Firestore = app ? getFirestore(app) : ({} as Firestore);
export const storage: FirebaseStorage = app ? getStorage(app) : ({} as FirebaseStorage);

// Initialize Analytics only in the browser with a valid app
export let analytics: any = null;
if (typeof window !== 'undefined' && app) {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Connect to emulators in development (only if explicitly enabled)
if (app && process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';
  
  if (useEmulators) {
    try {
      if (!(auth as any).emulatorConfig) {
        connectAuthEmulator(auth, 'http://localhost:9099');
      }
    } catch (error) {
      console.log('Auth emulator connection failed:', error);
    }
    try {
      connectFirestoreEmulator(db, 'localhost', 8080);
    } catch (error) {
      console.log('Firestore emulator connection failed:', error);
    }
    try {
      connectStorageEmulator(storage, 'localhost', 9199);
    } catch (error) {
      console.log('Storage emulator connection failed:', error);
    }
  }
}

export default app;
