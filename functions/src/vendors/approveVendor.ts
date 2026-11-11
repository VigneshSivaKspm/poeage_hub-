import { https } from 'firebase-functions/v2';
import { HttpsError } from 'firebase-functions/v2/https';
import { adminDb, adminAuth, FieldValue } from '../shared/admin.js';

interface ApproveVendorInput {
  vendorId: string;
  approved: boolean;
  reviewNote?: string;
  commissionRate?: number;
}

export const approveVendor = https.onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }
  const uid = request.auth.uid;
  const claims = request.auth.token;
  const roles = (claims['roles'] as string[]) || [];
  const isAdmin = roles.includes('admin') || roles.includes('super_admin');
  if (!isAdmin) {
    throw new HttpsError('permission-denied', 'Only administrators can approve vendors.');
  }

  const { vendorId, approved, reviewNote, commissionRate = 0.12 } = request.data as ApproveVendorInput;
  if (!vendorId) {
    throw new HttpsError('invalid-argument', 'vendorId is required.');
  }

  const vendorRef = adminDb.collection('vendors').doc(vendorId);
  const vendorSnap = await vendorRef.get();
  if (!vendorSnap.exists) {
    throw new HttpsError('not-found', 'Vendor not found.');
  }

  const vendorData = vendorSnap.data()!;
  const targetUserId = vendorData['userId'] || vendorId;
  const newStatus = approved ? 'approved' : 'rejected';

  await vendorRef.update({
    status: newStatus,
    commissionRate,
    reviewNote: reviewNote || (approved ? 'Application approved by Admin' : 'Application rejected by Admin'),
    reviewedAt: FieldValue.serverTimestamp(),
    reviewedBy: uid,
    updatedAt: FieldValue.serverTimestamp(),
  });

  if (approved && targetUserId) {
    // Add 'vendor' to user roles
    const userRef = adminDb.collection('users').doc(targetUserId);
    await userRef.set(
      {
        roles: FieldValue.arrayUnion('vendor'),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // Sync custom claims
    try {
      const userRecord = await adminAuth.getUser(targetUserId);
      const currentClaims = userRecord.customClaims || {};
      const currentRoles = (currentClaims['roles'] as string[]) || [];
      if (!currentRoles.includes('vendor')) {
        await adminAuth.setCustomUserClaims(targetUserId, {
          ...currentClaims,
          roles: [...currentRoles, 'vendor'],
        });
      }
    } catch (authErr) {
      console.warn('Failed to update auth custom claims for vendor user:', authErr);
    }
  }

  return {
    success: true,
    vendorId,
    status: newStatus,
  };
});
