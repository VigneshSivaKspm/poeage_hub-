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
};

// Generic helpers

export async function getDocument<T>(
  collectionPath: string,
  docId: string,
): Promise<T | null> {
  const ref = doc(firebaseDb, collectionPath, docId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T;
}

export async function getDocuments<T>(
  collectionPath: string,
  constraints: QueryConstraint[] = [],
): Promise<T[]> {
  const ref = collection(firebaseDb, collectionPath) as CollectionReference;
  const q = query(ref, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
}

export async function createDocument<T extends Record<string, unknown>>(
  collectionPath: string,
  data: T,
): Promise<string> {
  const ref = collection(firebaseDb, collectionPath);
  const docRef = await addDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function setDocument<T extends Record<string, unknown>>(
  collectionPath: string,
  docId: string,
  data: T,
  merge = false,
): Promise<void> {
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
}

export async function updateDocument(
  collectionPath: string,
  docId: string,
  data: Record<string, unknown>,
): Promise<void> {
  const ref = doc(firebaseDb, collectionPath, docId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteDocument(collectionPath: string, docId: string): Promise<void> {
  const ref = doc(firebaseDb, collectionPath, docId);
  await deleteDoc(ref);
}

export function subscribeToDocument<T>(
  collectionPath: string,
  docId: string,
  callback: (data: T | null) => void,
): Unsubscribe {
  const ref = doc(firebaseDb, collectionPath, docId);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback(null);
    } else {
      callback({ id: snap.id, ...snap.data() } as T);
    }
  });
}

export function subscribeToCollection<T>(
  collectionPath: string,
  constraints: QueryConstraint[],
  callback: (data: T[]) => void,
): Unsubscribe {
  const ref = collection(firebaseDb, collectionPath) as CollectionReference;
  const q = query(ref, ...constraints);
  return onSnapshot(q, (snap: QuerySnapshot) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T));
  });
}
