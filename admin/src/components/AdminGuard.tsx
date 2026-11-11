import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AuthContext';
import { AccessDeniedPage } from '../pages/AccessDeniedPage';
import { Spinner } from '@poeage/ui';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, isAdmin, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <Spinner size="lg" className="text-blue-400" />
        <p className="mt-4 text-sm text-slate-400">Verifying administrative security credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <AccessDeniedPage />;
  }

  return <>{children}</>;
};
