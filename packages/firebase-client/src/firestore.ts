import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  runTransaction,
  writeBatch,
  type DocumentReference,
  type CollectionReference,
  type Query,
  type QueryConstraint,
  type DocumentSnapshot,
  type QuerySnapshot,
  type Unsubscribe,
  type FieldValue,
} from 'firebase/firestore';
import { firebaseDb } from './config.ts';
import {
  MOCK_USERS,
  MOCK_VENDORS,
  MOCK_DRIVERS,
  MOCK_CATEGORIES,
  MOCK_PRODUCTS,
  MOCK_ORDERS,
  MOCK_DELIVERIES,
} from './mockData.ts';

export const db = firebaseDb;

// Re-export commonly used Firestore helpers
export {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  runTransaction,
  writeBatch,
  serverTimestamp,
  Timestamp,
  type DocumentReference,
  type CollectionReference,
  type Query,
  type QueryConstraint,
  type DocumentSnapshot,
  type QuerySnapshot,
  type Unsubscribe,
  type FieldValue,
};

function isMockApiKey(): boolean {
  const key = (import.meta.env['VITE_FIREBASE_API_KEY'] as string) || 'mock-api-key';
  return key === 'mock-api-key' || key.startsWith('mock');
}

const MOCK_STORAGE_VERSION = 'v3_commercial_k7fitness';

function getMockCollection<T>(collectionPath: string): T[] {
  try {
    const currentVer = localStorage.getItem('poeage_mock_storage_version');
    if (currentVer !== MOCK_STORAGE_VERSION) {
      // Invalidate old stale dummy data from earlier sessions
      ['products', 'categories', 'vendors', 'drivers', 'orders', 'deliveries', 'users'].forEach((k) => {
        localStorage.removeItem(`poeage_mock_${k}`);
      });
      localStorage.setItem('poeage_mock_storage_version', MOCK_STORAGE_VERSION);
    }
    const raw = localStorage.getItem(`poeage_mock_${collectionPath}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }

  if (collectionPath === 'products') return [...MOCK_PRODUCTS] as unknown as T[];
  if (collectionPath === 'categories') return [...MOCK_CATEGORIES] as unknown as T[];
  if (collectionPath === 'vendors') return [...MOCK_VENDORS] as unknown as T[];
  if (collectionPath === 'drivers') return [...MOCK_DRIVERS] as unknown as T[];
  if (collectionPath === 'orders') return [...MOCK_ORDERS] as unknown as T[];
  if (collectionPath === 'deliveries') return [...MOCK_DELIVERIES] as unknown as T[];
  if (collectionPath === 'users') return Object.values(MOCK_USERS) as unknown as T[];
  return [];
}

function saveMockCollection<T>(collectionPath: string, items: T[]) {
  try {
    localStorage.setItem(`poeage_mock_${collectionPath}`, JSON.stringify(items));
  } catch {
    // ignore
  }
}

// Generic helpers

export async function getDocument<T>(
  collectionPath: string,
  docId: string,
): Promise<T | null> {
  if (isMockApiKey()) {
    if (collectionPath === 'users') {
      const rawSession = localStorage.getItem('poeage_hub_mock_session');
      if (rawSession) {
        try {
          const sess = JSON.parse(rawSession);
          if (sess.uid === docId || sess.email === docId) {
            return {
              id: sess.uid,
              uid: sess.uid,
              email: sess.email,
              displayName: sess.displayName,
              roles: sess.roles,
              status: 'active',
              metadata: { totalOrders: 0, totalSpent: 0 },
            } as unknown as T;
          }
        } catch {
          // ignore
        }
      }
      const mockUser = MOCK_USERS[docId];
      if (mockUser) return mockUser as unknown as T;
      if (rawSession) {
        try {
          const sess = JSON.parse(rawSession);
          return {
            id: sess.uid,
            uid: sess.uid,
            email: sess.email,
            displayName: sess.displayName,
            roles: sess.roles,
            status: 'active',
            metadata: { totalOrders: 0, totalSpent: 0 },
          } as unknown as T;
        } catch {
          // ignore
        }
      }
    }
    const items = getMockCollection<any>(collectionPath);
    const found = items.find((i: any) => i.id === docId || i.uid === docId || i.userId === docId);
    if (found) return found as T;
    if (collectionPath === 'vendors') return MOCK_VENDORS[0] as unknown as T;
    if (collectionPath === 'drivers') return MOCK_DRIVERS[0] as unknown as T;
    return null;
  }

  try {
    const ref = doc(firebaseDb, collectionPath, docId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as T;
  } catch (err: any) {
    if (err?.code === 'auth/api-key-not-valid' || err?.message?.includes('api-key-not-valid')) {
      const items = getMockCollection<any>(collectionPath);
      const found = items.find((i: any) => i.id === docId || i.uid === docId || i.userId === docId);
      return (found || (collectionPath === 'vendors' ? MOCK_VENDORS[0] : null)) as T | null;
    }
    throw err;
  }
}

export async function getDocuments<T>(
  collectionPath: string,
  constraints: QueryConstraint[] = [],
): Promise<T[]> {
  if (isMockApiKey()) {
    return getMockCollection<T>(collectionPath);
  }

  try {
    const ref = collection(firebaseDb, collectionPath) as CollectionReference;
    const q = query(ref, ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
  } catch (err: any) {
    if (err?.code === 'auth/api-key-not-valid' || err?.message?.includes('api-key-not-valid')) {
      return getMockCollection<T>(collectionPath);
    }
    throw err;
  }
}

export async function createDocument<T extends Record<string, unknown>>(
  collectionPath: string,
  data: T,
): Promise<string> {
  const newId = 'doc_' + Math.random().toString(36).substring(2, 9);

  if (isMockApiKey()) {
    const items = getMockCollection<any>(collectionPath);
    items.unshift({
      id: newId,
      ...data,
      createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
      updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
    });
    saveMockCollection(collectionPath, items);
    return newId;
  }

  try {
    const ref = collection(firebaseDb, collectionPath);
    const docRef = await addDoc(ref, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err: any) {
    if (err?.code === 'auth/api-key-not-valid' || err?.message?.includes('api-key-not-valid')) {
      const items = getMockCollection<any>(collectionPath);
      items.unshift({
        id: newId,
        ...data,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
      });
      saveMockCollection(collectionPath, items);
      return newId;
    }
    throw err;
  }
}

export async function setDocument<T extends Record<string, unknown>>(
  collectionPath: string,
  docId: string,
  data: T,
  merge = false,
): Promise<void> {
  if (isMockApiKey()) {
    const items = getMockCollection<any>(collectionPath);
    const idx = items.findIndex((i: any) => i.id === docId);
    if (idx > -1) {
      items[idx] = merge ? { ...items[idx], ...data } : { id: docId, ...data };
    } else {
      items.unshift({ id: docId, ...data });
    }
    saveMockCollection(collectionPath, items);
    return;
  }

  try {
    const ref = doc(firebaseDb, collectionPath, docId);
    await setDoc(
      ref,
      {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge },
    );
  } catch (err: any) {
    if (err?.code === 'auth/api-key-not-valid' || err?.message?.includes('api-key-not-valid')) {
      const items = getMockCollection<any>(collectionPath);
      const idx = items.findIndex((i: any) => i.id === docId);
      if (idx > -1) {
        items[idx] = merge ? { ...items[idx], ...data } : { id: docId, ...data };
      } else {
        items.unshift({ id: docId, ...data });
      }
      saveMockCollection(collectionPath, items);
      return;
    }
    throw err;
  }
}

export async function updateDocument(
  collectionPath: string,
  docId: string,
  data: Record<string, unknown>,
): Promise<void> {
  if (isMockApiKey()) {
    const items = getMockCollection<any>(collectionPath);
    const idx = items.findIndex((i: any) => i.id === docId);
    if (idx > -1) {
      items[idx] = { ...items[idx], ...data, updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } };
      saveMockCollection(collectionPath, items);
    }
    return;
  }

  try {
    const ref = doc(firebaseDb, collectionPath, docId);
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
  } catch (err: any) {
    if (err?.code === 'auth/api-key-not-valid' || err?.message?.includes('api-key-not-valid')) {
      const items = getMockCollection<any>(collectionPath);
      const idx = items.findIndex((i: any) => i.id === docId);
      if (idx > -1) {
        items[idx] = { ...items[idx], ...data };
        saveMockCollection(collectionPath, items);
      }
      return;
    }
    throw err;
  }
}

export async function deleteDocument(collectionPath: string, docId: string): Promise<void> {
  if (isMockApiKey()) {
    const items = getMockCollection<any>(collectionPath).filter((i: any) => i.id !== docId);
    saveMockCollection(collectionPath, items);
    return;
  }

  try {
    const ref = doc(firebaseDb, collectionPath, docId);
    await deleteDoc(ref);
  } catch (err: any) {
    if (err?.code === 'auth/api-key-not-valid' || err?.message?.includes('api-key-not-valid')) {
      const items = getMockCollection<any>(collectionPath).filter((i: any) => i.id !== docId);
      saveMockCollection(collectionPath, items);
      return;
    }
    throw err;
  }
}

export function subscribeToDocument<T>(
  collectionPath: string,
  docId: string,
  callback: (data: T | null) => void,
): Unsubscribe {
  if (isMockApiKey()) {
    getDocument<T>(collectionPath, docId).then(callback);
    return () => {};
  }

  try {
    const ref = doc(firebaseDb, collectionPath, docId);
    return onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        callback(null);
      } else {
        callback({ id: snap.id, ...snap.data() } as T);
      }
    });
  } catch {
    getDocument<T>(collectionPath, docId).then(callback);
    return () => {};
  }
}

export function subscribeToCollection<T>(
  collectionPath: string,
  constraints: QueryConstraint[],
  callback: (data: T[]) => void,
): Unsubscribe {
  if (isMockApiKey()) {
    getDocuments<T>(collectionPath, constraints).then(callback);
    return () => {};
  }

  try {
    const ref = collection(firebaseDb, collectionPath) as CollectionReference;
    const q = query(ref, ...constraints);
    return onSnapshot(q, (snap: QuerySnapshot) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T));
    });
  } catch {
    getDocuments<T>(collectionPath, constraints).then(callback);
    return () => {};
  }
}
