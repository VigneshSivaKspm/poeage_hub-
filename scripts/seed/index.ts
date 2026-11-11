/**
 * POEAGE HUB — Development Seed Script
 *
 * Usage: SEED_TARGET=emulator NODE_ENV=development pnpm seed
 *
 * This script seeds the Firebase emulator with development data.
 * It REFUSES to run against any non-emulator/non-development environment.
 */

import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// ===== SAFETY CHECK =====
function assertEmulatorEnvironment(): void {
  const seedTarget = process.env['SEED_TARGET'];
  const nodeEnv = process.env['NODE_ENV'];

  if (seedTarget !== 'emulator' && nodeEnv !== 'development') {
    throw new Error(
      `[SEED] 🚫 REFUSED to seed. This script only runs against the Firebase emulator.\n` +
        `  SEED_TARGET="${seedTarget ?? '(unset)'}" — must be "emulator"\n` +
        `  NODE_ENV="${nodeEnv ?? '(unset)'}" — must be "development"\n\n` +
        `  Run with: SEED_TARGET=emulator NODE_ENV=development pnpm seed`,
    );
  }

  console.log(`[SEED] ✅ Environment check passed (SEED_TARGET=${seedTarget}, NODE_ENV=${nodeEnv})`);
}

// ===== INIT =====
function initAdmin(): FirebaseFirestore.Firestore {
  process.env['FIRESTORE_EMULATOR_HOST'] = process.env['FIRESTORE_EMULATOR_HOST'] ?? '127.0.0.1:8080';
  initializeApp({ projectId: process.env['VITE_FIREBASE_PROJECT_ID'] ?? 'poeage-hub-dev' });
  return getFirestore();
}

// ===== SEED DATA =====

interface CategorySeed {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageURL: string;
  order: number;
}

const CATEGORIES: CategorySeed[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Smartphones, laptops, gadgets and audio devices',
    imageURL: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500',
    order: 1,
  },
  {
    id: 'fashion',
    name: 'Fashion',
    slug: 'fashion',
    description: "Apparel, footwear, and accessories",
    imageURL: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500',
    order: 2,
  },
  {
    id: 'home-kitchen',
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    description: 'Furniture, kitchen appliances, and décor',
    imageURL: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500',
    order: 3,
  },
  {
    id: 'beauty-health',
    name: 'Beauty & Health',
    slug: 'beauty-health',
    description: 'Skincare, wellness, and self-care essentials',
    imageURL: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500',
    order: 4,
  },
  {
    id: 'sports-outdoors',
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    description: 'Fitness equipment and sporting gear',
    imageURL: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500',
    order: 5,
  },
  {
    id: 'books',
    name: 'Books',
    slug: 'books',
    description: 'Bestselling novels, educational, and business reads',
    imageURL: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500',
    order: 6,
  },
];

const VENDORS = [
  {
    id: 'vendor-apex-electronics',
    userId: 'user-vendor-1',
    storeName: 'Apex Electronics Hub',
    storeSlug: 'apex-electronics',
    email: 'contact@apexelectronics.com',
    phone: '9876543210',
    status: 'approved',
    commissionRate: 0.10,
    description: 'Authorised retailer of high-performance audio, smart gadgets, and accessories.',
    address: {
      line1: 'Shop #12, Commercial Hub, MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'IN',
    },
    metadata: {
      totalSales: 15400000,
      totalOrders: 620,
      totalProducts: 14,
      averageRating: 4.8,
      totalRatings: 312,
      totalEarnings: 13860000,
      pendingSettlement: 450000,
    },
  },
  {
    id: 'vendor-stylestreet',
    userId: 'user-vendor-2',
    storeName: 'StyleStreet Fashion',
    storeSlug: 'stylestreet',
    email: 'hello@stylestreet.in',
    phone: '9876543211',
    status: 'approved',
    commissionRate: 0.12,
    description: 'Modern everyday essentials, premium cotton wear, and urban outerwear.',
    address: {
      line1: '45, Fashion Avenue, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'IN',
    },
    metadata: {
      totalSales: 8900000,
      totalOrders: 410,
      totalProducts: 25,
      averageRating: 4.6,
      totalRatings: 184,
      totalEarnings: 7832000,
      pendingSettlement: 210000,
    },
  },
];

const PRODUCTS = [
  {
    id: 'prod-wireless-earbuds',
    vendorId: 'vendor-apex-electronics',
    categoryId: 'electronics',
    name: 'Wireless Noise-Cancelling Earbuds Pro',
    slug: 'wireless-noise-cancelling-earbuds-pro',
    description: 'Immersive sound with 40dB active noise cancellation, transparency mode, and 32-hour playback battery life.',
    shortDescription: 'Active noise cancellation earbuds with 32hr battery life.',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600',
    ],
    status: 'published',
    basePrice: 249900, // ₹2,499
    salePrice: 499900, // ₹4,999 compare-at
    commissionRate: 0.10,
    tags: ['audio', 'earbuds', 'wireless', 'bluetooth'],
    isFeatured: true,
    gstRate: 0.18,
    metadata: {
      totalSold: 310,
      totalRevenue: 77469000,
      averageRating: 4.8,
      totalRatings: 142,
      viewCount: 2400,
    },
    quantity: 65,
  },
  {
    id: 'prod-cotton-shirt',
    vendorId: 'vendor-stylestreet',
    categoryId: 'fashion',
    name: 'Pure Cotton Casual Slim Fit Shirt',
    slug: 'pure-cotton-casual-slim-fit-shirt',
    description: 'Breathable 100% combed cotton casual shirt for all-day comfort. Machine washable and pre-shrunk fabric.',
    shortDescription: '100% combed cotton casual slim fit shirt.',
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600',
    ],
    status: 'published',
    basePrice: 99900, // ₹999
    salePrice: 199900, // ₹1,999
    commissionRate: 0.12,
    tags: ['shirt', 'cotton', 'men', 'casual'],
    isFeatured: true,
    gstRate: 0.05,
    metadata: {
      totalSold: 180,
      totalRevenue: 17982000,
      averageRating: 4.6,
      totalRatings: 89,
      viewCount: 1650,
    },
    quantity: 40,
  },
  {
    id: 'prod-smart-ambient-lamp',
    vendorId: 'vendor-apex-electronics',
    categoryId: 'home-kitchen',
    name: 'Smart Ambient Desk Lamp with App Control',
    slug: 'smart-ambient-desk-lamp-app-control',
    description: '16M RGB colors, warm white to cool daylight tuning, touch brightness slider, and schedule automation.',
    shortDescription: 'RGB Smart LED desk lamp with app & touch controls.',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600',
    ],
    status: 'published',
    basePrice: 149900, // ₹1,499
    salePrice: 299900, // ₹2,999
    commissionRate: 0.10,
    tags: ['lighting', 'smart-home', 'desk-lamp', 'led'],
    isFeatured: true,
    gstRate: 0.18,
    metadata: {
      totalSold: 245,
      totalRevenue: 36725500,
      averageRating: 4.9,
      totalRatings: 215,
      viewCount: 3100,
    },
    quantity: 28,
  },
  {
    id: 'prod-glow-serum',
    vendorId: 'vendor-stylestreet',
    categoryId: 'beauty-health',
    name: 'Organic Vitamin C Glow Face Serum (30ml)',
    slug: 'organic-vitamin-c-glow-face-serum',
    description: 'Infused with 20% Vitamin C, Ferulic Acid, and Hyaluronic Acid to brighten complexion and reduce dark spots.',
    shortDescription: 'Brightening antioxidant face serum with Hyaluronic Acid.',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600',
    ],
    status: 'published',
    basePrice: 64900, // ₹649
    salePrice: 129900, // ₹1,299
    commissionRate: 0.12,
    tags: ['skincare', 'serum', 'vitamin-c', 'beauty'],
    isFeatured: true,
    gstRate: 0.18,
    metadata: {
      totalSold: 520,
      totalRevenue: 33748000,
      averageRating: 4.7,
      totalRatings: 310,
      viewCount: 4200,
    },
    quantity: 85,
  },
];

async function seedCategories(db: FirebaseFirestore.Firestore): Promise<void> {
  console.log('\n[SEED] 📂 Seeding categories...');
  const batch = db.batch();
  const now = Timestamp.now();

  for (const cat of CATEGORIES) {
    const ref = db.collection('categories').doc(cat.id);
    batch.set(ref, {
      ...cat,
      parentId: null,
      isActive: true,
      productCount: 2,
      createdAt: now,
      updatedAt: now,
    });
  }

  await batch.commit();

  for (const cat of CATEGORIES) {
    console.log(`[DEV DATA] Created category: ${cat.name}`);
  }
}

async function seedVendors(db: FirebaseFirestore.Firestore): Promise<void> {
  console.log('\n[SEED] 🏪 Seeding test vendors...');
  const batch = db.batch();
  const now = Timestamp.now();

  for (const v of VENDORS) {
    const ref = db.collection('vendors').doc(v.id);
    batch.set(ref, {
      ...v,
      createdAt: now,
      updatedAt: now,
    });
  }

  await batch.commit();
  for (const v of VENDORS) {
    console.log(`[DEV DATA] Created vendor: ${v.storeName} (${v.id})`);
  }
}

async function seedProductsAndInventory(db: FirebaseFirestore.Firestore): Promise<void> {
  console.log('\n[SEED] 📦 Seeding catalog products & inventory...');
  const batch = db.batch();
  const now = Timestamp.now();

  for (const p of PRODUCTS) {
    const { quantity, ...productData } = p;
    const prodRef = db.collection('products').doc(p.id);
    batch.set(prodRef, {
      ...productData,
      createdAt: now,
      updatedAt: now,
    });

    const invRef = db.collection('inventory').doc(p.id);
    batch.set(invRef, {
      id: p.id,
      productId: p.id,
      vendorId: p.vendorId,
      quantity,
      reservedQuantity: 0,
      reorderLevel: 5,
      createdAt: now,
      updatedAt: now,
    });
  }

  await batch.commit();
  for (const p of PRODUCTS) {
    console.log(`[DEV DATA] Created product: ${p.name} [₹${p.basePrice / 100}] + Inventory [${p.quantity} units]`);
  }
}

async function seedPlatformSettings(db: FirebaseFirestore.Firestore): Promise<void> {
  console.log('\n[SEED] ⚙️  Seeding platform settings...');
  const now = Timestamp.now();

  await db.collection('platformSettings').doc('global').set({
    id: 'global',
    deliveryChargeFlat: 4900, // ₹49
    freeDeliveryThreshold: 50000, // ₹500
    defaultCommissionRate: 0.12,
    driverEarningPerDelivery: 5000, // ₹50
    gstOnCommission: 0.18,
    supportEmail: 'support@poeagehub.com',
    supportPhone: '+91-80-4567-8901',
    maintenanceMode: false,
    razorpayKeyId: 'rzp_test_placeholder',
    createdAt: now,
    updatedAt: now,
  });

  console.log('[DEV DATA] Created platform settings: global');
}

const DRIVERS = [
  {
    id: 'driver-rajesh',
    userId: 'user-driver-rajesh',
    displayName: 'Rajesh Kumar',
    phone: '+91-98765-11111',
    email: 'rajesh.driver@poeagehub.com',
    status: 'approved',
    vehicleType: 'motorcycle',
    vehicleNumber: 'KA-01-AB-1234',
    licenseNumber: 'DL-0420110012345',
    isOnline: true,
    metadata: {
      totalDeliveries: 42,
      totalEarnings: 210000,
      averageRating: 4.8,
    },
  },
  {
    id: 'driver-amit',
    userId: 'user-driver-amit',
    displayName: 'Amit Verma',
    phone: '+91-98765-22222',
    email: 'amit.driver@poeagehub.com',
    status: 'pending_review',
    vehicleType: 'scooter',
    vehicleNumber: 'MH-02-CD-5678',
    licenseNumber: 'DL-0920150098765',
    isOnline: false,
    metadata: {
      totalDeliveries: 0,
      totalEarnings: 0,
      averageRating: 0,
    },
  },
];

const COUPONS = [
  {
    id: 'WELCOME100',
    code: 'WELCOME100',
    description: 'Flat ₹100 OFF on orders above ₹500',
    discountType: 'flat',
    discountValue: 10000,
    minOrderAmount: 50000,
    usageLimit: 1000,
    perUserLimit: 1,
    usedCount: 15,
    isActive: true,
  },
  {
    id: 'SUPER10',
    code: 'SUPER10',
    description: '10% instant discount up to ₹200 on orders above ₹1,000',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscountAmount: 20000,
    minOrderAmount: 100000,
    usageLimit: 500,
    perUserLimit: 1,
    usedCount: 8,
    isActive: true,
  },
];

async function seedDrivers(db: FirebaseFirestore.Firestore): Promise<void> {
  console.log('\n[SEED] 🛵 Seeding drivers...');
  const batch = db.batch();
  const now = Timestamp.now();

  for (const d of DRIVERS) {
    const ref = db.collection('drivers').doc(d.id);
    batch.set(ref, {
      ...d,
      createdAt: now,
      updatedAt: now,
    });
  }

  await batch.commit();
  for (const d of DRIVERS) {
    console.log(`[DEV DATA] Created driver: ${d.displayName} (${d.status})`);
  }
}

async function seedCoupons(db: FirebaseFirestore.Firestore): Promise<void> {
  console.log('\n[SEED] 🎟️  Seeding coupons...');
  const batch = db.batch();
  const now = Timestamp.now();

  for (const c of COUPONS) {
    const ref = db.collection('coupons').doc(c.id);
    batch.set(ref, {
      ...c,
      validFrom: now,
      validUntil: Timestamp.fromMillis(Date.now() + 365 * 24 * 3600 * 1000),
      createdAt: now,
      updatedAt: now,
    });
  }

  await batch.commit();
  for (const c of COUPONS) {
    console.log(`[DEV DATA] Created coupon: ${c.code}`);
  }
}

// ===== MAIN =====

export async function main(): Promise<void> {
  assertEmulatorEnvironment();

  console.log('\n[SEED] 🌱 Starting POEAGE HUB development seed...\n');
  const startTime = Date.now();

  const db = initAdmin();

  await seedCategories(db);
  await seedVendors(db);
  await seedProductsAndInventory(db);
  await seedDrivers(db);
  await seedCoupons(db);
  await seedPlatformSettings(db);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n[SEED] ✅ Seeding complete in ${elapsed}s`);
}

// Run when invoked directly
main().catch((err: unknown) => {
  console.error('\n[SEED] ❌ Seed failed:', err);
  process.exit(1);
});
