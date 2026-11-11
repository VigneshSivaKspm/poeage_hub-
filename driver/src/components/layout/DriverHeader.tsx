import React from 'react';
import { useDriverAuth } from '../../context/AuthContext';
import { Truck, Power, LogOut } from 'lucide-react';
import { Badge } from '@poeage/ui';

export const DriverHeader: React.FC = () => {
  const { driver, isOnline, toggleAvailability, signOutDriver } = useDriverAuth();

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shadow-md sticky top-0 z-40 text-white">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm shadow">
          <Truck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-tight leading-none">POEAGE DRIVER</h1>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{driver?.vehicleNumber || 'FLEET'}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Availability Toggle */}
        <button
          onClick={toggleAvailability}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
            isOnline
              ? 'bg-green-500 text-slate-950 hover:bg-green-400'
              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </button>

        {/* Sign Out */}
        <button
          onClick={signOutDriver}
          title="Sign Out"
          className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
