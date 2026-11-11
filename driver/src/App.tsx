import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DriverAuthProvider } from './context/AuthContext';
import { DriverGuard } from './components/DriverGuard';
import { DriverHeader } from './components/layout/DriverHeader';
import { DriverBottomNav } from './components/layout/DriverBottomNav';
import { DriverLoginPage } from './pages/auth/DriverLoginPage';
import { DriverRegisterPage } from './pages/auth/DriverRegisterPage';
import { DriverOnboardingPage } from './pages/onboarding/DriverOnboardingPage';
import { DriverStatusPage } from './pages/onboarding/DriverStatusPage';
import { DashboardPage } from './pages/DashboardPage';
import { DriverHistoryPage } from './pages/history/DriverHistoryPage';
import { DriverEarningsPage } from './pages/earnings/DriverEarningsPage';

const PlaceholderView: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="p-6 max-w-xl mx-auto pb-24 text-center">
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-white">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-xs text-slate-400 mb-4">{subtitle}</p>
      <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-full">
        Phase 2 Verification Active · Module Unlocking Next
      </span>
    </div>
  </div>
);

export default function App() {
  return (
    <DriverAuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
          <Routes>
            <Route path="/login" element={<DriverLoginPage />} />
            <Route path="/register" element={<DriverRegisterPage />} />
            <Route path="/onboarding" element={<DriverOnboardingPage />} />
            <Route path="/status" element={<DriverStatusPage />} />
            <Route
              path="/*"
              element={
                <DriverGuard>
                  <div className="flex flex-col min-h-screen">
                    <DriverHeader />
                    <main className="flex-1 overflow-y-auto">
                      <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/history" element={<DriverHistoryPage />} />
                        <Route path="/earnings" element={<DriverEarningsPage />} />
                        <Route
                          path="/profile"
                          element={<PlaceholderView title="Driver Profile" subtitle="Manage vehicle documents, emergency contacts, and active zones." />}
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </main>
                    <DriverBottomNav />
                  </div>
                </DriverGuard>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </DriverAuthProvider>
  );
}
