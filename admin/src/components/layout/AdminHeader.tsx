import React from 'react';
import { useAdminAuth } from '../../context/AuthContext';
import { LogOut, Bell, Shield, User } from 'lucide-react';
import { Badge } from '@poeage/ui';

export const AdminHeader: React.FC = () => {
  const { user, profile, roles, signOutAdmin } = useAdminAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-gray-900">Control Center</h1>
        <Badge variant="info">Phase 2: Auth Active</Badge>
      </div>

      <div className="flex items-center gap-4">
        {/* Role indicator */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-semibold text-gray-700 capitalize">{roles[0] || 'Admin'}</span>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
            {profile?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-gray-900 truncate max-w-[120px]">{profile?.displayName || 'Admin'}</p>
            <p className="text-[10px] text-gray-500 truncate max-w-[120px]">{user?.email}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={signOutAdmin}
          title="Sign out of Admin"
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
