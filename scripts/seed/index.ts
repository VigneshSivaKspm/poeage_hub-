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
    id: 'sports-fitness',
    name: 'Sports & Fitness',
    slug: 'sports-fitness',
    description: 'Commercial gym equipment, whey isolates, resistance gear, and fitness apparel',
    imageURL: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600',
    order: 1,
  },
  {
    id: 'electronics',
    name: 'Electronics & Audio',
    slug: 'electronics',
    description: 'Smartphones, noise-cancelling audio, wearable tech, and smart home',
    imageURL: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    order: 2,
  },
  {
    id: 'fashion',
    name: 'Fashion & Apparel',
    slug: 'fashion',
    description: 'Everyday premium denim, combed organic cotton, and leather sneakers',
    imageURL: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600',
    order: 3,
  },
  {
    id: 'home-kitchen',
    name: 'Home & Modern Living',
    slug: 'home-kitchen',
    description: 'Ergonomic workstations, smart ambient lighting, and cookware',
    imageURL: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',
    order: 4,
  },
  {
    id: 'beauty-health',
    name: 'Beauty, Wellness & Skincare',
    slug: 'beauty-health',
    description: 'Dermatologist-tested serums, barrier creams, and pure botanicals',
    imageURL: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600',
    order: 5,
  },
  {
    id: 'books',
    name: 'Books & Professional Growth',
    slug: 'books',
    description: 'System design, engineering leadership, and business bestsellers',
    imageURL: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600',
    order: 6,
  },
];

const VENDORS = [
  {
    id: 'vendor-k7-fitness',
    userId: 'user-vendor-k7',
    storeName: 'K7 Fitness & Athletics Pro',
    storeSlug: 'k7-fitness',
    email: 'contact@k7fitness.app',
    phone: '+91-98450-77889',
    status: 'approved',
    commissionRate: 0.10,
    description: 'Authorized retailer of commercial fitness gear, micro-filtered whey protein, and ergonomic workout equipment.',
    address: {
      line1: 'Shop #7, Prestige Tech Park, Outer Ring Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560103',
      country: 'IN',
    },
    metadata: {
      totalSales: 8940000,
      totalOrders: 142,
      totalProducts: 4,
      averageRating: 4.9,
      totalRatings: 180,
      totalEarnings: 8046000,
      pendingSettlement: 145000,
    },
  },
  {
    id: 'vendor-apex-electronics',
    userId: 'user-vendor-1',
    storeName: 'Apex Electronics Ltd',
    storeSlug: 'apex-electronics',
    email: 'contact@apexelectronics.in',
    phone: '9845011223',
    status: 'approved',
    commissionRate: 0.12,
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
    storeName: 'StyleStreet Fashion Co',
    storeSlug: 'stylestreet',
    email: 'hello@stylestreet.in',
    phone: '9845099887',
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
  {
    id: 'vendor-pureglow',
    userId: 'user-vendor-3',
    storeName: 'PureGlow Botanicals',
    storeSlug: 'pureglow',
    email: 'care@pureglowbotanicals.com',
    phone: '9845033445',
    status: 'approved',
    commissionRate: 0.15,
    description: 'Certified organic, clinical skincare and botanical wellness formulations.',
    address: {
      line1: '88, Green Glen Layout, Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560103',
      country: 'IN',
    },
    metadata: {
      totalSales: 4120000,
      totalOrders: 110,
      totalProducts: 10,
      averageRating: 4.8,
      totalRatings: 164,
      totalEarnings: 3502000,
      pendingSettlement: 48000,
    },
  },
];

const PRODUCTS = [
  {
    id: 'prod-k7-hex-dumbbell-set',
    vendorId: 'vendor-k7-fitness',
    categoryId: 'sports-fitness',
    name: 'K7 Pro Rubber Hex Dumbbell Pair (10kg + 15kg)',
    slug: 'k7-pro-rubber-hex-dumbbell-pair',
    description: 'Commercial anti-roll cast iron dumbbells coated with heavy-duty virgin rubber and knurled ergonomic chrome handles.',
    shortDescription: 'Heavy-duty rubber hex dumbbells with non-slip knurled grip.',
    images: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600',
    ],
    status: 'published',
    basePrice: 349900, // ₹3,499
    salePrice: 599900, // ₹5,999
    commissionRate: 0.10,
    tags: ['fitness', 'dumbbells', 'strength', 'k7', 'gym'],
    isFeatured: true,
    gstRate: 0.18,
    metadata: {
      totalSold: 215,
      totalRevenue: 75228500,
      averageRating: 4.9,
      totalRatings: 94,
      viewCount: 3200,
    },
    quantity: 45,
  },
  {
    id: 'prod-k7-iso-whey-protein',
    vendorId: 'vendor-k7-fitness',
    categoryId: 'sports-fitness',
    name: 'K7 Iso-Whey 100% Ultra-Pure Whey Isolate (Vanilla 1kg)',
    slug: 'k7-iso-whey-ultra-pure-isolate-1kg',
    description: '27g pure protein per serving, 6.2g BCAAs, cold micro-filtration technology, zero added sugar.',
    shortDescription: '27g protein per scoop with zero sugar and rapid absorption.',
    images: [
      'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600',
    ],
    status: 'published',
    basePrice: 289900, // ₹2,899
    salePrice: 429900, // ₹4,299
    commissionRate: 0.10,
    tags: ['nutrition', 'protein', 'whey', 'supplements', 'k7'],
    isFeatured: true,
    gstRate: 0.18,
    metadata: {
      totalSold: 480,
      totalRevenue: 139152000,
      averageRating: 4.8,
      totalRatings: 210,
      viewCount: 5400,
    },
    quantity: 80,
  },
  {
    id: 'prod-wireless-headphones-anc',
    vendorId: 'vendor-apex-electronics',
    categoryId: 'electronics',
    name: 'AcousticPro ANC Wireless Headphones with Spatial Audio',
    slug: 'acousticpro-wireless-anc-headphones',
    description: 'Industry-leading Hybrid Active Noise Cancellation, custom 40mm beryllium drivers, 45-hour battery, and fast USB-C charging.',
    shortDescription: 'Flagship hybrid noise-cancelling headphones with 45hr playback.',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    ],
    status: 'published',
    basePrice: 499900, // ₹4,999
    salePrice: 999900, // ₹9,999
    commissionRate: 0.12,
    tags: ['audio', 'wireless', 'headphones', 'anc'],
    isFeatured: true,
    gstRate: 0.18,
    metadata: {
      totalSold: 310,
      totalRevenue: 154969000,
      averageRating: 4.8,
      totalRatings: 142,
      viewCount: 3800,
    },
    quantity: 50,
  },
  {
    id: 'prod-apex-pulse-smartwatch',
    vendorId: 'vendor-apex-electronics',
    categoryId: 'electronics',
    name: 'Apex Pulse Watch Pro — 1.78" AMOLED GPS Smartwatch',
    slug: 'apex-pulse-watch-pro-amoled-gps',
    description: 'Ultra-bright always-on AMOLED display, standalone dual-frequency GPS, SpO2 & Heart Rate telemetry, 5ATM water resistance.',
    shortDescription: 'AMOLED fitness GPS smartwatch with 10-day battery life.',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
    ],
    status: 'published',
    basePrice: 399900, // ₹3,999
    salePrice: 799900, // ₹7,999
    commissionRate: 0.12,
    tags: ['smartwatch', 'wearable', 'gps', 'fitness-tracker'],
    isFeatured: true,
    gstRate: 0.18,
    metadata: {
      totalSold: 412,
      totalRevenue: 164758800,
      averageRating: 4.7,
      totalRatings: 185,
      viewCount: 4600,
    },
    quantity: 40,
  },
  {
    id: 'prod-vintage-denim-jacket',
    vendorId: 'vendor-stylestreet',
    categoryId: 'fashion',
    name: 'Heritage Relaxed-Fit Washed Heavyweight Denim Jacket',
    slug: 'heritage-relaxed-fit-washed-denim-jacket',
    description: 'Crafted from 100% sustainable heavy-weight organic cotton denim with vintage stonewash fading and brass hardware.',
    shortDescription: 'Classic relaxed-fit denim jacket in vintage stonewash.',
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600',
    ],
    status: 'published',
    basePrice: 249900, // ₹2,499
    salePrice: 499900, // ₹4,999
    commissionRate: 0.12,
    tags: ['jacket', 'denim', 'fashion', 'outerwear'],
    isFeatured: true,
    gstRate: 0.12,
    metadata: {
      totalSold: 145,
      totalRevenue: 36235500,
      averageRating: 4.6,
      totalRatings: 67,
      viewCount: 2850,
    },
    quantity: 35,
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
    basePrice: 189900, // ₹1,899
    salePrice: 349900, // ₹3,499
    commissionRate: 0.10,
    tags: ['lighting', 'smart-home', 'desk-lamp', 'led'],
    isFeatured: true,
    gstRate: 0.18,
    metadata: {
      totalSold: 245,
      totalRevenue: 46525500,
      averageRating: 4.9,
      totalRatings: 215,
      viewCount: 3600,
    },
    quantity: 28,
  },
  {
    id: 'prod-glow-serum',
    vendorId: 'vendor-pureglow',
    categoryId: 'beauty-health',
    name: 'PureGlow 20% Vitamin C + Ferulic Acid Radiance Face Serum (30ml)',
    slug: 'pureglow-vitamin-c-ferulic-face-serum',
    description: 'Infused with 20% Vitamin C, Ferulic Acid, and Hyaluronic Acid to brighten complexion and reduce dark spots.',
    shortDescription: 'Brightening antioxidant face serum with Hyaluronic Acid.',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600',
    ],
    status: 'published',
    basePrice: 89900, // ₹899
    salePrice: 159900, // ₹1,599
    commissionRate: 0.15,
    tags: ['skincare', 'serum', 'vitamin-c', 'beauty'],
    isFeatured: true,
    gstRate: 0.18,
    metadata: {
      totalSold: 520,
      totalRevenue: 46748000,
      averageRating: 4.8,
      totalRatings: 310,
      viewCount: 4700,
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
