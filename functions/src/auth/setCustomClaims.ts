import { https, logger } from 'firebase-functions/v2';
import { HttpsError } from 'firebase-functions/v2/https';
import { adminAuth, adminDb } from '../shared/admin.js';

interface SetCustomClaimsData {
  targetUid: string;
  roles: string[];
}

/**
 * Callable function to set custom claims (roles) on a user.
 * Only callable by existing admins/super_admins.
 */
export const setCustomClaims = https.onCall<SetCustomClaimsData>(async (request) => {
  const callerUid = request.auth?.uid;

  if (!callerUid) {
    throw new HttpsError('unauthenticated', 'You must be signed in to perform this action.');
  }

  // Verify caller has admin role
  const callerToken = request.auth?.token;
  const callerRoles: string[] = (callerToken?.['roles'] as string[] | undefined) ?? [];
  const isAdmin = callerRoles.includes('admin') || callerRoles.includes('super_admin');

  if (!isAdmin) {
    throw new HttpsError('permission-denied', 'Only admins can set custom claims.');
  }

  const { targetUid, roles } = request.data;

  if (!targetUid || !Array.isArray(roles)) {
    throw new HttpsError('invalid-argument', 'targetUid and roles are required.');
  }

  const allowedRoles = ['customer', 'vendor', 'driver', 'admin', 'super_admin', 'operations_admin', 'support_admin'];
  const invalidRoles = roles.filter((r) => !allowedRoles.includes(r));

  if (invalidRoles.length > 0) {
    throw new HttpsError('invalid-argument', `Invalid roles: ${invalidRoles.join(', ')}`);
  }

  // Set custom claims
  await adminAuth.setCustomUserClaims(targetUid, { roles });

  // Update /users/{uid}
  await adminDb.collection('users').doc(targetUid).update({
    roles,
    updatedAt: new Date(),
  });

  logger.info(`[setCustomClaims] Set roles ${roles.join(',')} on user ${targetUid} by ${callerUid}`);

  return { success: true, uid: targetUid, roles };
});
