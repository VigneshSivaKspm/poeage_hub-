import { https } from 'firebase-functions/v2';
import { HttpsError } from 'firebase-functions/v2/https';
import { adminDb, FieldValue } from '../shared/admin.js';

interface CreateOrderItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
}

interface CreateOrderInput {
  items: CreateOrderItemInput[];
  shippingAddress: {
    recipientName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    landmark?: string;
  };
  paymentMethod: 'cod' | 'razorpay_card' | 'razorpay_upi' | 'razorpay_netbanking' | 'razorpay_wallet';
  couponCode?: string;
  notes?: string;
}

export const createOrder = https.onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in to place an order.');
  }
  const uid = request.auth.uid;

  const data = request.data as CreateOrderInput;
  if (!data?.items || !Array.isArray(data.items) || data.items.length === 0) {
    throw new HttpsError('invalid-argument', 'Order must contain at least one item.');
  }

  if (!data.shippingAddress?.recipientName || !data.shippingAddress?.street || !data.shippingAddress?.pincode) {
    throw new HttpsError('invalid-argument', 'Complete shipping address is required.');
  }

  try {
    const result = await adminDb.runTransaction(async (transaction) => {
      // 1. Fetch all product documents
      const productDocs = await Promise.all(
        data.items.map((it) => transaction.get(adminDb.collection('products').doc(it.productId)))
      );

      const itemsDetail = [];
      let subtotal = 0;
      let totalGst = 0;

      for (let i = 0; i < data.items.length; i++) {
        const itemInput = data.items[i]!;
        const snap = productDocs[i]!;

        if (!snap.exists) {
          throw new HttpsError('not-found', `Product not found: ${itemInput.productId}`);
        }

        const prod = snap.data()!;
        if (prod['status'] !== 'published') {
          throw new HttpsError('failed-precondition', `Product "${prod['name']}" is not available for purchase.`);
        }

        // Check Inventory
        const inventoryRef = adminDb.collection('inventory').doc(itemInput.productId);
        const invSnap = await transaction.get(inventoryRef);
        if (invSnap.exists) {
          const invData = invSnap.data()!;
          const availableStock = (invData['quantity'] || 0) - (invData['reservedQuantity'] || 0);
          if (availableStock < itemInput.quantity) {
            throw new HttpsError(
              'resource-exhausted',
              `Insufficient stock for "${prod['name']}". Available: ${Math.max(0, availableStock)}`
            );
          }
          // Reserve inventory
          transaction.update(inventoryRef, {
            quantity: FieldValue.increment(-itemInput.quantity),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }

        const unitPrice = typeof prod['basePrice'] === 'number' ? prod['basePrice'] : 0;
        const lineTotal = unitPrice * itemInput.quantity;
        const gstRate = typeof prod['gstRate'] === 'number' ? prod['gstRate'] : 0.18;
        const lineGst = Math.round(lineTotal * gstRate);
        const commissionRate = typeof prod['commissionRate'] === 'number' ? prod['commissionRate'] : 0.12;
        const lineCommission = Math.round(lineTotal * commissionRate);

        subtotal += lineTotal;
        totalGst += lineGst;

        itemsDetail.push({
          productId: snap.id,
          variantId: itemInput.variantId || null,
          vendorId: prod['vendorId'] as string,
          name: prod['name'] as string,
          imageURL: Array.isArray(prod['images']) && prod['images'].length > 0 ? prod['images'][0] : '',
          quantity: itemInput.quantity,
          unitPrice,
          totalPrice: lineTotal,
          gstRate,
          gstAmount: lineGst,
          commissionRate,
          commissionAmount: lineCommission,
        });
      }

      // 2. Validate Coupon if provided
      let couponDiscount = 0;
      if (data.couponCode) {
        const couponRef = adminDb.collection('coupons').doc(data.couponCode.trim().toUpperCase());
        const couponSnap = await transaction.get(couponRef);
        if (couponSnap.exists) {
          const cData = couponSnap.data()!;
          if (cData['isActive'] && subtotal >= (cData['minOrderAmount'] || 0)) {
            if (cData['discountType'] === 'percentage') {
              const calc = Math.round((subtotal * (cData['discountValue'] || 0)) / 100);
              const maxCap = cData['maxDiscountAmount'] || calc;
              couponDiscount = Math.min(calc, maxCap);
            } else {
              couponDiscount = cData['discountValue'] || 0;
            }
          }
        }
      }

      // Free shipping threshold: ₹499 (49900 paise)
      const deliveryCharge = subtotal >= 49900 ? 0 : 5000;
      const grandTotal = Math.max(0, subtotal + deliveryCharge - couponDiscount);

      // Human-readable order number
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `PHB-${datePart}-${randomSuffix}`;

      const masterOrderRef = adminDb.collection('orders').doc();
      const orderId = masterOrderRef.id;

      // Group items by vendor to generate sub-orders
      const itemsByVendor = new Map<string, typeof itemsDetail>();
      for (const item of itemsDetail) {
        const list = itemsByVendor.get(item.vendorId) || [];
        list.push(item);
        itemsByVendor.set(item.vendorId, list);
      }

      const vendorOrderIds: string[] = [];

      for (const [vendorId, vendorItems] of itemsByVendor.entries()) {
        const vendorOrderRef = adminDb.collection('vendorOrders').doc();
        const vendorOrderId = vendorOrderRef.id;
        vendorOrderIds.push(vendorOrderId);

        const vSubtotal = vendorItems.reduce((acc, it) => acc + it.totalPrice, 0);
        const vCommission = vendorItems.reduce((acc, it) => acc + it.commissionAmount, 0);
        const vEarning = vSubtotal - vCommission;

        // Fetch vendor store info for pickup address
        const vendorDocSnap = await transaction.get(adminDb.collection('vendors').doc(vendorId));
        const vendorData = vendorDocSnap.exists ? vendorDocSnap.data()! : {};
        const pickupAddress = vendorData['address'] || {
          street: 'Vendor Hub',
          city: 'City',
          state: 'State',
          pincode: '000000',
        };

        // Create 4-digit delivery verification OTP
        const verificationOtp = String(Math.floor(1000 + Math.random() * 9000));

        // Create Delivery Record
        const deliveryRef = adminDb.collection('deliveries').doc();
        const deliveryId = deliveryRef.id;

        transaction.set(deliveryRef, {
          id: deliveryId,
          orderId,
          vendorOrderId,
          customerId: uid,
          vendorId,
          status: 'pending_assignment',
          pickupAddress,
          deliveryAddress: data.shippingAddress,
          verificationOtp,
          driverEarning: 5000, // ₹50 delivery partner earning
          statusHistory: [
            {
              status: 'pending_assignment',
              timestamp: FieldValue.serverTimestamp(),
              note: 'Order placed, awaiting dispatch assignment',
            },
          ],
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        // Create Vendor Order
        transaction.set(vendorOrderRef, {
          id: vendorOrderId,
          orderId,
          customerId: uid,
          vendorId,
          storeName: vendorData['storeName'] || 'Vendor Store',
          items: vendorItems,
          status: 'pending',
          subtotal: vSubtotal,
          commissionAmount: vCommission,
          vendorEarning: vEarning,
          deliveryId,
          statusHistory: [
            {
              status: 'pending',
              timestamp: FieldValue.serverTimestamp(),
              note: 'Vendor order created',
            },
          ],
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      const initialStatus = data.paymentMethod === 'cod' ? 'confirmed' : 'pending_payment';

      // Create Master Order
      transaction.set(masterOrderRef, {
        id: orderId,
        customerId: uid,
        orderNumber,
        status: initialStatus,
        items: itemsDetail,
        pricing: {
          subtotal,
          couponDiscount,
          deliveryCharge,
          gstTotal: totalGst,
          grandTotal,
        },
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod,
        couponCode: data.couponCode || null,
        vendorOrderIds,
        notes: data.notes || '',
        statusHistory: [
          {
            status: initialStatus,
            timestamp: FieldValue.serverTimestamp(),
            note: data.paymentMethod === 'cod' ? 'Order confirmed via Cash on Delivery' : 'Order created, awaiting payment',
            actorId: uid,
          },
        ],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Clear customer's cart
      const cartRef = adminDb.collection('carts').doc(uid);
      transaction.set(cartRef, { userId: uid, items: [], updatedAt: FieldValue.serverTimestamp() }, { merge: true });

      return {
        orderId,
        orderNumber,
        status: initialStatus,
        grandTotal,
        vendorOrderIds,
      };
    });

    return {
      success: true,
      ...result,
    };
  } catch (error: unknown) {
    if (error instanceof HttpsError) {
      throw error;
    }
    const msg = error instanceof Error ? error.message : 'Order creation failed';
    throw new HttpsError('internal', msg);
  }
});
