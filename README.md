# POEAGE HUB

> A production-grade **multi-vendor e-commerce platform** built with React, TypeScript, Firebase, and pnpm workspaces.

[![Phase](https://img.shields.io/badge/Phase-1%20Foundation-blue)](./docs/implementation-progress.md)
[![License](https://img.shields.io/badge/License-Private-red)](./LICENSE)

---

## Overview

POEAGE HUB is a full-featured marketplace platform supporting **4 distinct portals**:

| Portal | URL | Purpose |
|--------|-----|---------|
| 🛍️ **User / Customer** | `localhost:5173` | Customer-facing storefront |
| 🔧 **Admin** | `localhost:5174` | Platform administration & operations |
| 🏪 **Vendor** | `localhost:5175` | Vendor store management |
| 🚗 **Driver** | `localhost:5176` | Delivery driver app |

---

## Monorepo Structure

```
poeage-hub/
├── admin/                  # Admin portal (React + Vite)
├── user/                   # Customer storefront (React + Vite)
├── vendor/                 # Vendor portal (React + Vite)
├── driver/                 # Driver app (React + Vite)
│
├── packages/
│   ├── types/              # @poeage/types — shared TypeScript types
│   ├── firebase-client/    # @poeage/firebase-client — Firebase SDK wrapper
│   ├── utils/              # @poeage/utils — utilities (cn, slugify, money, etc.)
│   ├── validation/         # @poeage/validation — Zod schemas
│   ├── config/             # @poeage/config — APP_CONFIG, COLLECTION constants
│   └── ui/                 # @poeage/ui — shared component library (Phase 3)
│
├── functions/              # Firebase Cloud Functions (Node 20)
│   └── src/
│       ├── auth/           # onUserCreated, setCustomClaims
│       ├── vendors/        # approveVendor
│       ├── drivers/        # approveDriver
│       ├── checkout/       # createOrder
│       ├── payments/       # verifyPayment, razorpayWebhook
│       ├── orders/         # updateOrderStatus
│       ├── deliveries/     # assignDriver, confirmDelivery
│       ├── settlements/    # calculateSettlement
│       └── notifications/  # sendNotification
│
├── scripts/
│   └── seed/index.ts       # Dev data seed (emulator only)
│
├── docs/
│   └── implementation-progress.md
│
├── firebase.json           # Firebase hosting + functions config
├── firestore.rules         # Firestore security rules
├── firestore.indexes.json  # Composite indexes
├── storage.rules           # Cloud Storage security rules
├── tsconfig.base.json      # Shared TypeScript base config
└── pnpm-workspace.yaml     # pnpm workspace definition
```

---

## Quick Start

### Prerequisites

- **Node.js** 20+
- **pnpm** 9+ (`npm install -g pnpm`)
- **Firebase CLI** (`npm install -g firebase-tools`)
- **Java** 11+ (for Firebase emulators)

### 1. Clone & Install

```bash
git clone <repo-url>
cd poeage-hub
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
# Fill in your Firebase project credentials
```

### 3. Start Firebase Emulators

```bash
pnpm emulators
# UI available at http://localhost:4000
```

### 4. Seed Development Data

```bash
SEED_TARGET=emulator NODE_ENV=development pnpm seed
```

### 5. Start All Dev Servers

```bash
pnpm dev
# Or start individually:
pnpm dev:user    # http://localhost:5173
pnpm dev:admin   # http://localhost:5174
pnpm dev:vendor  # http://localhost:5175
pnpm dev:driver  # http://localhost:5176
```

---

## Development Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all 4 apps concurrently |
| `pnpm dev:user` | Start user app only |
| `pnpm dev:admin` | Start admin app only |
| `pnpm dev:vendor` | Start vendor app only |
| `pnpm dev:driver` | Start driver app only |
| `pnpm build` | Build all apps |
| `pnpm typecheck` | TypeScript check all packages |
| `pnpm lint` | Lint all packages |
| `pnpm emulators` | Start Firebase emulators |
| `pnpm seed` | Seed emulator with dev data |

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Cloud Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `RAZORPAY_KEY_ID` | Razorpay test key (server-side only) |
| `RAZORPAY_KEY_SECRET` | Razorpay secret (NEVER expose to browser) |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key |
| `VITE_USE_EMULATORS` | `true` to connect to local emulators |

---

## Firebase Setup

### New Project

```bash
firebase login
firebase projects:create poeage-hub-dev
firebase use poeage-hub-dev

# Enable services in console:
# - Authentication (Email/Password + Google)
# - Firestore Database
# - Cloud Storage
# - Cloud Functions

firebase deploy --only firestore:rules,firestore:indexes,storage
```

### Emulators

The emulator suite runs on these ports (see `firebase.json`):

| Service | Port |
|---------|------|
| Auth | 9099 |
| Firestore | 8080 |
| Cloud Functions | 5001 |
| Storage | 9199 |
| Hosting | 5000 |
| Emulator UI | 4000 |

---

## Architecture

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| Backend | Firebase (Auth, Firestore, Storage, Functions) |
| Payments | Razorpay |
| Maps | Google Maps |
| Package Manager | pnpm v9 workspaces |
| Functions Runtime | Node.js 20 |

### Financial Model

> **Important**: All monetary values are stored in **paise** (1 INR = 100 paise) using integers to avoid floating-point errors.

- Vendor commission: 12% default (configurable per vendor)
- GST on commission: 18%
- Driver earnings: Flat ₹30 per delivery (configurable)
- Free delivery threshold: ₹500

---

## Implementation Progress

See [`docs/implementation-progress.md`](./docs/implementation-progress.md) for detailed phase tracking.

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Repository Foundation | ✅ Complete |
| 2 | Authentication System | 🔜 Next |
| 3 | Shared UI Component Library | ⏳ Not Started |
| 4 | Vendor & Product Management | ⏳ Not Started |
| 5 | Customer Store & Checkout | ⏳ Not Started |
| 6 | Driver & Delivery System | ⏳ Not Started |
| 7 | Notifications | ⏳ Not Started |
| 8 | Finance & Settlements | ⏳ Not Started |
| 9 | Analytics & Reporting | ⏳ Not Started |
| 10 | Production Deployment | ⏳ Not Started |

---

## Contributing

This is a private project. All development follows the phase-based implementation plan. See `docs/implementation-progress.md` for the current state and next steps.
