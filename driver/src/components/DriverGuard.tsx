import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDriverAuth } from '../context/AuthContext';
import { Spinner } from '@poeage/ui';

interface DriverGuardProps {
  children: React.ReactNode;
}

export const DriverGuard: React.FC<DriverGuardProps> = ({ children }) => {
  const { user, status, loading } = useDriverAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Spinner size="lg" className="text-amber-500" />
        <p className="mt-4 text-sm text-slate-400">Loading driver credentials...</p>
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
