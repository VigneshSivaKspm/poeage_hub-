import React from 'react';
import { useAdminAuth } from '../context/AuthContext';
import { Button, Card, CardContent } from '@poeage/ui';
import { ShieldAlert, LogOut } from 'lucide-react';

export const AccessDeniedPage: React.FC = () => {
  const { user, signOutAdmin } = useAdminAuth();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-slate-800 bg-slate-800/90 text-white shadow-2xl">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto border border-red-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white">Administrative Access Required</h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            The account <strong className="text-white">{user?.email}</strong> does not have authorized marketplace administration privileges.
          </p>

          <div className="p-3 bg-slate-900/50 rounded-lg text-xs text-slate-400 text-left border border-slate-700">
            <p className="font-semibold text-slate-300 mb-1">Security Policy:</p>
            <p>Admin accounts cannot be self-registered. If you require access, contact the Super Administrator.</p>
          </div>

          <div className="pt-2">
            <Button
              variant="danger"
              className="w-full flex items-center justify-center gap-2"
              onClick={signOutAdmin}
            >
              <LogOut className="w-4 h-4" />
              Sign Out & Switch Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
