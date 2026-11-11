import * as functions from 'firebase-functions/v1';
import { adminDb, FieldValue } from '../shared/admin.js';

/**
 * Triggered on every new Firebase Auth user creation.
 * Creates a /users/{uid} document with default fields.
 */
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName, photoURL } = user;

  functions.logger.info(`[onUserCreated] New user: ${uid} <${email ?? 'no-email'}>`);

  const userDoc = {
    uid,
    email: email ?? '',
    displayName: displayName ?? email?.split('@')[0] ?? 'User',
    photoURL: photoURL ?? null,
    phone: user.phoneNumber ?? null,
    roles: ['customer'],
    status: 'active',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    metadata: {
      totalOrders: 0,
      totalSpent: 0,
      lastOrderAt: null,
    },
  };

  await adminDb.collection('users').doc(uid).set(userDoc);

  functions.logger.info(`[onUserCreated] Created /users/${uid}`);
});
