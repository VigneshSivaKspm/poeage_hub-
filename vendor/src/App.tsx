import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { VendorAuthProvider } from './context/AuthContext';
import { VendorGuard } from './components/VendorGuard';
import { VendorSidebar } from './components/layout/VendorSidebar';
import { VendorHeader } from './components/layout/VendorHeader';
import { VendorLoginPage } from './pages/auth/VendorLoginPage';
import { VendorRegisterPage } from './pages/auth/VendorRegisterPage';
import { VendorOnboardingPage } from './pages/onboarding/VendorOnboardingPage';
import { VendorStatusPage } from './pages/onboarding/VendorStatusPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductListPage } from './pages/products/ProductListPage';
import { CreateProductPage } from './pages/products/CreateProductPage';
import { VendorOrdersPage } from './pages/orders/VendorOrdersPage';
import { VendorSettlementsPage } from './pages/settlements/VendorSettlementsPage';

const PlaceholderView: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="p-8">
    <div className="bg-white border border-gray-200 rounded-xl p-8 text-center max-w-xl mx-auto shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{subtitle}</p>
      <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
        Phase 4 Commerce Active · Next Module Loaded Soon
      </span>
    </div>
  </div>
);

export default function App() {
  return (
    <VendorAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<VendorLoginPage />} />
          <Route path="/register" element={<VendorRegisterPage />} />
          <Route path="/onboarding" element={<VendorOnboardingPage />} />
          <Route path="/status" element={<VendorStatusPage />} />
          <Route
            path="/*"
            element={
              <VendorGuard>
                <div className="flex min-h-screen bg-gray-50">
                  <VendorSidebar />
                  <div className="flex-1 flex flex-col min-w-0">
                    <VendorHeader />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/products" element={<ProductListPage />} />
                        <Route path="/products/new" element={<CreateProductPage />} />
                        <Route path="/orders" element={<VendorOrdersPage />} />
                        <Route
                          path="/inventory"
                          element={<PlaceholderView title="Inventory & Stock Adjustments" subtitle="Track live, reserved, and threshold stock levels." />}
                        />
                        <Route path="/settlements" element={<VendorSettlementsPage />} />
                        <Route
                          path="/settings"
                          element={<PlaceholderView title="Store Profile & Policies" subtitle="Configure opening hours, shipping policies, and return terms." />}
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </VendorGuard>
            }
          />
        </Routes>
      </BrowserRouter>
    </VendorAuthProvider>
  );
}
