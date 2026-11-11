import { https } from 'firebase-functions/v2';
import { HttpsError } from 'firebase-functions/v2/https';
import { adminDb, FieldValue } from '../shared/admin.js';

interface CalculateSettlementInput {
  vendorId?: string;
  action?: 'preview' | 'generate_payout';
}

export const calculateSettlement = https.onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }
  const uid = request.auth.uid;
  const claims = request.auth.token;
  const roles = (claims['roles'] as string[]) || [];
  const isAdmin = roles.includes('admin') || roles.includes('super_admin');

  const { vendorId, action = 'preview' } = (request.data || {}) as CalculateSettlementInput;

  // Vendors can only preview their own settlement; Admins can do for all or specific
  if (!isAdmin && vendorId !== uid) {
    throw new HttpsError('permission-denied', 'You cannot view other vendors settlements.');
  }

  if (vendorId) {
    const vendorSnap = await adminDb.collection('vendors').doc(vendorId).get();
    if (!vendorSnap.exists) {
      throw new HttpsError('not-found', 'Vendor not found.');
    }

    const vendor = vendorSnap.data()!;
    const pendingAmount = vendor['metadata']?.['pendingSettlement'] || 0;

    // Fetch accrued ledger items
    const ledgerSnap = await adminDb
      .collection('settlementLedger')
      .where('vendorId', '==', vendorId)
      .where('status', '==', 'accrued')
      .get();

    const items = ledgerSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (action === 'generate_payout' && isAdmin) {
      if (pendingAmount <= 0) {
        throw new HttpsError('failed-precondition', 'No pending balance available for payout.');
      }

      const payoutRef = adminDb.collection('payouts').doc();
      const payoutId = payoutRef.id;

      await adminDb.runTransaction(async (transaction) => {
        // Create payout document
        transaction.set(payoutRef, {
          id: payoutId,
          vendorId,
          storeName: vendor['storeName'],
          amount: pendingAmount,
          currency: 'INR',
          status: 'processed',
          processedAt: FieldValue.serverTimestamp(),
          processedBy: uid,
          itemCount: items.length,
          bankDetails: vendor['bankDetails'] || null,
        });

        // Mark ledger entries as settled
        for (const itemDoc of ledgerSnap.docs) {
          transaction.update(itemDoc.ref, {
            status: 'settled',
            payoutId,
            settledAt: FieldValue.serverTimestamp(),
          });
        }

        // Reset vendor pending settlement
        transaction.update(vendorSnap.ref, {
          'metadata.pendingSettlement': 0,
          updatedAt: FieldValue.serverTimestamp(),
        });
      });

      return {
        success: true,
        payoutId,
        amount: pendingAmount,
        status: 'processed',
      };
    }

    return {
      success: true,
      vendorId,
      storeName: vendor['storeName'],
      pendingSettlement: pendingAmount,
      totalEarnings: vendor['metadata']?.['totalEarnings'] || 0,
      unsettledOrdersCount: items.length,
      items,
    };
  }

  // Admin view all vendors pending settlements
  if (!isAdmin) {
    throw new HttpsError('permission-denied', 'Only admins can view global settlement overview.');
  }

  const vendorsSnap = await adminDb.collection('vendors').where('metadata.pendingSettlement', '>', 0).get();
  const summary = vendorsSnap.docs.map((d) => {
    const data = d.data();
    return {
      vendorId: d.id,
      storeName: data['storeName'],
      pendingSettlement: data['metadata']?.['pendingSettlement'] || 0,
      bankAccount: data['bankDetails']?.['accountNumber'] ? 'Configured' : 'Missing',
    };
  });

  return {
    success: true,
    totalPendingVendors: summary.length,
    totalPayable: summary.reduce((sum, v) => sum + v.pendingSettlement, 0),
    vendors: summary,
  };
});
