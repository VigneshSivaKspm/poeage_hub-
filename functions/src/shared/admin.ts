/**
 * Firebase Admin SDK initialization — shared singleton.
 * Import this everywhere inside functions to avoid re-initializing.
 */
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import { getMessaging } from 'firebase-admin/messaging';

if (getApps().length === 0) {
  initializeApp();
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();
export const adminStorage = getStorage();
export const adminMessaging = getMessaging();

// Firestore helpers
export { FieldValue } from 'firebase-admin/firestore';

/**
 * Strongly-typed Firestore collection reference helper.
 */
export function typedCollection<T extends FirebaseFirestore.DocumentData>(path: string) {
  return adminDb.collection(path) as FirebaseFirestore.CollectionReference<T>;
}

/**
 * Strongly-typed Firestore document reference helper.
 */
export function typedDoc<T extends FirebaseFirestore.DocumentData>(path: string, id: string) {
  return adminDb.collection(path).doc(id) as FirebaseFirestore.DocumentReference<T>;
}
