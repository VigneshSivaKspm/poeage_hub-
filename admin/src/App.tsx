import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AuthContext';
import { AdminGuard } from './components/AdminGuard';
import { AdminSidebar } from './components/layout/AdminSidebar';
import { AdminHeader } from './components/layout/AdminHeader';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductModerationPage } from './pages/products/ProductModerationPage';
import { AdminOrdersPage } from './pages/orders/AdminOrdersPage';
import { AdminDriversPage } from './pages/drivers/AdminDriversPage';
import { AdminVendorsPage } from './pages/vendors/AdminVendorsPage';
import { AdminSettlementsPage } from './pages/settlements/AdminSettlementsPage';

const PlaceholderView: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="p-8">
    <div className="bg-white border border-gray-200 rounded-xl p-8 text-center max-w-xl mx-auto shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{subtitle}</p>
      <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
        Phase 4 Commerce Active · Next Module Loaded Soon
      </span>
    </div>
  </div>
);

export default function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AdminLoginPage />} />
          <Route
            path="/*"
            element={
              <AdminGuard>
                <div className="flex min-h-screen bg-gray-50">
                  <AdminSidebar />
                  <div className="flex-1 flex flex-col min-w-0">
                    <AdminHeader />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/products" element={<ProductModerationPage />} />
                        <Route path="/orders" element={<AdminOrdersPage />} />
                        <Route path="/vendors" element={<AdminVendorsPage />} />
                        <Route path="/drivers" element={<AdminDriversPage />} />
                        <Route
                          path="/customers"
                          element={<PlaceholderView title="Customer Directory" subtitle="Inspect customer profiles, accounts, and audit records." />}
                        />
                        <Route path="/settlements" element={<AdminSettlementsPage />} />
                        <Route
                          path="/settings"
                          element={<PlaceholderView title="Platform Settings" subtitle="Configure marketplace identity, taxes, and service zones." />}
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </AdminGuard>
            }
          />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}
