import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useVendorAuth } from '../context/AuthContext';
import { Spinner } from '@poeage/ui';

interface VendorGuardProps {
  children: React.ReactNode;
}

export const VendorGuard: React.FC<VendorGuardProps> = ({ children }) => {
  const { user, status, loading } = useVendorAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <Spinner size="lg" className="text-emerald-500" />
        <p className="mt-4 text-sm text-slate-400">Loading merchant credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (status === 'none') {
    return <Navigate to="/onboarding" replace />;
  }

  if (status === 'pending_review' || status === 'rejected' || status === 'suspended') {
    return <Navigate to="/status" replace />;
  }

  return <>{children}</>;
};
