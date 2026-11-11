import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, type FirebaseStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator, type Functions } from 'firebase/functions';

declare global {
  interface ImportMeta {
    readonly env: Record<string, string | boolean | undefined>;
  }
}

const firebaseConfig: FirebaseOptions = {
  apiKey: (import.meta.env['VITE_FIREBASE_API_KEY'] as string) || 'mock-api-key',
  authDomain: (import.meta.env['VITE_FIREBASE_AUTH_DOMAIN'] as string) || 'mock.firebaseapp.com',
  projectId: (import.meta.env['VITE_FIREBASE_PROJECT_ID'] as string) || 'poeage-hub-dev',
  storageBucket: (import.meta.env['VITE_FIREBASE_STORAGE_BUCKET'] as string) || 'poeage-hub-dev.appspot.com',
  messagingSenderId: (import.meta.env['VITE_FIREBASE_MESSAGING_SENDER_ID'] as string) || '123456789',
  appId: (import.meta.env['VITE_FIREBASE_APP_ID'] as string) || '1:123456789:web:abcdef',
  ...(import.meta.env['VITE_FIREBASE_MEASUREMENT_ID'] ? { measurementId: import.meta.env['VITE_FIREBASE_MEASUREMENT_ID'] as string } : {}),
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let functions: Functions;

function initFirebase() {
  if (getApps().length > 0) {
    app = getApps()[0]!;
  } else {
    app = initializeApp(firebaseConfig);
  }

  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app, 'asia-south1');

  const useEmulators = import.meta.env['VITE_USE_EMULATORS'] === 'true';

  if (useEmulators && import.meta.env.DEV) {
    try {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, '127.0.0.1', 8080);
      connectStorageEmulator(storage, '127.0.0.1', 9199);
      connectFunctionsEmulator(functions, '127.0.0.1', 5001);
      console.info('[Firebase] Connected to emulators');
    } catch {
      // Already connected
    }
  }

  return { app, auth, db, storage, functions };
}

const firebase = initFirebase();

export { firebase };
export const { app: firebaseApp, auth: firebaseAuth, db: firebaseDb, storage: firebaseStorage, functions: firebaseFunctions } = firebase;
