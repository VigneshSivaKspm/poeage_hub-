// Firebase Client — public API
export { firebase, firebaseApp, firebaseAuth, firebaseDb, firebaseStorage, firebaseFunctions } from './config.ts';

export {
  auth,
  signIn,
  register,
  signInWithGoogle,
  logout,
  resetPassword,
  onAuthChange,
  getIdToken,
  getIdTokenResult,
  type User,
} from './auth.ts';

export {
  db,
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
  getDocument,
  getDocuments,
  createDocument,
  setDocument,
  updateDocument,
  deleteDocument,
  subscribeToDocument,
  subscribeToCollection,
  type DocumentReference,
  type CollectionReference,
  type Query,
  type QueryConstraint,
  type DocumentSnapshot,
  type QuerySnapshot,
  type Unsubscribe,
  type FieldValue,
} from './firestore.ts';

export {
  storage,
  uploadFile,
  uploadUserAvatar,
  uploadProductImage,
  uploadVendorAsset,
  deleteFile,
  getFileURL,
  type UploadProgress,
} from './storage.ts';

export { callFunction, httpsCallable } from './functions.ts';

