# POEAGE HUB — Enterprise Architecture Documentation

> **Version**: 1.0.0  
> **Status**: Production Architecture  
> **Target Cloud**: Firebase (GCP) & Distributed React Edge  

---

## 1. Executive Summary & Ecosystem Overview

**POEAGE HUB** is a high-performance, multi-vendor e-commerce and logistics marketplace engineered to deliver consumer shopping, merchant store operations, courier dispatching, and administrative marketplace control within a unified monorepo.

The platform coordinates **four role-tailored frontend applications** powered by a single centralized Firebase backend:

```mermaid
graph TD
    subgraph Frontend Portals [Portals on Independent Ports]
        UserApp["Customer Storefront (:5173)<br/>Shopping, Cart, Checkout, Order Tracking"]
        VendorApp["Vendor Portal (:5175)<br/>Product Studio, Packaging, Settlements"]
        DriverApp["Driver Fleet Portal (:5176)<br/>Live Dispatches, OTP Handover, Earnings"]
        AdminApp["Admin Control Center (:5174)<br/>KYC Approvals, Dispatch Queue, Finance"]
    end

    subgraph SharedMonorepo [Shared Monorepo Packages]
        Types["@poeage/types<br/>Domain Models"]
        UI["@poeage/ui<br/>Design System Tokens"]
        Client["@poeage/firebase-client<br/>SDK & Functions Bridge"]
        Utils["@poeage/utils<br/>Paise Integer Engine"]
        Validation["@poeage/validation<br/>Zod Schemas"]
        Config["@poeage/config<br/>Collections & Constants"]
    end

    subgraph FirebaseInfrastructure [Centralized Firebase Infrastructure]
        Auth["Firebase Authentication<br/>(Custom Claims RBAC)"]
        Firestore["Cloud Firestore<br/>(Server-Authoritative Boundaries)"]
        Functions["Cloud Functions (v2)<br/>(Atomic Transactions & Splitting)"]
        Storage["Cloud Storage<br/>(Avatars, Assets, Proofs)"]
    end

    UserApp --> SharedMonorepo
    VendorApp --> SharedMonorepo
    DriverApp --> SharedMonorepo
    AdminApp --> SharedMonorepo

    SharedMonorepo --> FirebaseInfrastructure
```

---

## 2. Core Architectural Principles

### 2.1. Strict Server-Authoritative Boundaries
* **Client Trust Zero**: Frontend applications NEVER write master financial totals, compute platform commissions, modify inventory counts, or finalize delivery completion.
* **Paise Currency Standard**: Floating-point currency calculations are strictly prohibited. All monetary quantities across frontend stores, database schemas, and Cloud Functions are stored as 64-bit safe integers representing **paise** ($1\text{ INR} = 100\text{ paise}$).
* **Multi-Vendor Sub-Order Partitioning**: When a customer checks out a cart containing items from multiple sellers, an atomic transaction produces one master `/orders/{orderId}` and splits items into isolated `/vendorOrders/{vendorOrderId}` sub-orders. Each merchant accesses only their specific sub-order.

### 2.2. Role-Based Access Control (RBAC) Architecture
Authority is enforced at two distinct enforcement planes:
1. **Application Layer**: Frontend route guards (`ProtectedRoute`, `AdminGuard`, `VendorGuard`, `DriverGuard`) intercept unauthorized UI access.
2. **Database Boundary Layer**: `firestore.rules` and `storage.rules` validate cryptographically signed Firebase Auth tokens (`request.auth.token.roles`). Even if client-side code is tampered with, malicious requests are rejected at the database perimeter.

---

## 3. Order Lifecycle & Dispatch State Machine

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer (User App)
    participant CF as Cloud Functions (createOrder)
    participant DB as Cloud Firestore
    actor Vendor as Vendor (Vendor App)
    actor Admin as Admin (Admin App)
    actor Driver as Driver (Driver App)

    Customer->>CF: Submit Checkout (items, address, paymentMethod)
    CF->>DB: Atomic Transaction: Validate prices, lock & decrement /inventory
    CF->>DB: Write /orders, split into /vendorOrders, generate /deliveries with 4-digit OTP
    CF-->>Customer: Order Confirmed (PHB-YYYYMMDD-XXXX)
    
    Vendor->>DB: Reads /vendorOrders
    Vendor->>Vendor: Clicks "Accept Order" -> status: confirmed
    Vendor->>Vendor: Clicks "Start Packing" -> status: processing
    Vendor->>DB: Clicks "Mark Ready for Pickup" -> status: ready_for_pickup
    
    Admin->>DB: Inspects Dispatch Queue in Admin Drivers console
    Admin->>CF: Calls assignDriver(deliveryId, driverId)
    CF->>DB: Updates delivery status: assigned
    
    Driver->>DB: Sees live dispatch card on Driver Dashboard
    Driver->>Driver: Arrived at Depot & Picked Up -> status: picked_up
    Driver->>Driver: Heading to Customer -> status: out_for_delivery
    
    Customer-->>Driver: Shares 4-digit Handover PIN upon doorstep arrival
    Driver->>CF: Calls confirmDelivery(deliveryId, otp)
    CF->>DB: Verifies OTP against delivery record
    CF->>DB: Updates delivery & vendorOrder: delivered
    CF->>DB: Updates driver totalDeliveries & credits earnings
    CF->>DB: Accrues net earnings to vendor /settlementLedger
```

---

## 4. Shared Packages Specification

| Package | Purpose | Key Exports |
| :--- | :--- | :--- |
| `@poeage/types` | SDK-agnostic domain models | `UserProfile`, `Product`, `Vendor`, `Driver`, `Order`, `Delivery`, `CartItem`, `Address` |
| `@poeage/ui` | Tailwind component tokens | `Button`, `Input`, `Card`, `Badge`, `Spinner`, `cn` |
| `@poeage/firebase-client` | Client Firebase modular SDK initialization | `db`, `auth`, `storage`, `callFunction`, Firestore subscription helpers |
| `@poeage/utils` | Financial calculations & formatters | `formatMoney`, `formatMoneyCompact`, `rupeesToPaise`, `calculateCommission` |
| `@poeage/validation` | Zod validation boundary schemas | `loginSchema`, `registerSchema`, `addressSchema`, `productSchema`, `couponSchema` |
| `@poeage/config` | Platform configurations & constants | `APP_CONFIG`, `COLLECTION` mappings, status enums |

---

## 5. Security & Isolation Matrix

| Actor Role | Product Access | Order Access | Financial Access | Delivery Access |
| :--- | :--- | :--- | :--- | :--- |
| **Customer** | Read published catalog | Read own master orders | Read personal cart & order receipt | View live timeline & own 4-digit handover PIN |
| **Vendor** | CRUD own store SKUs | Read own assigned `/vendorOrders` | Read own settlement ledger & pending balance | Read pickup instructions for courier |
| **Driver** | None | None | Read personal wallet & trip earnings | Read assigned delivery route & verify customer OTP |
| **Admin** | Full moderation | Full master order inspection | Full platform GMV & payout release | Global fleet dispatch assignment |
