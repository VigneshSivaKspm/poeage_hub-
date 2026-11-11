import React, { useState } from 'react';
import { useVendorAuth } from '../../context/AuthContext';
import { LogOut, Power } from 'lucide-react';
import { Badge } from '@poeage/ui';

export const VendorHeader: React.FC = () => {
  const { vendor, signOutVendor } = useVendorAuth();
  const [isOpen, setIsOpen] = useState(true);

  const toggleStoreStatus = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-gray-900">{vendor?.storeName || 'Seller Hub'}</h1>
        <Badge variant="success">Merchant Verified</Badge>
      </div>

      <div className="flex items-center gap-4">
        {/* Store Open/Close Toggle */}
        <button
          onClick={toggleStoreStatus}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            isOpen
              ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
              : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
          }`}
        >
          <Power className={`w-3.5 h-3.5 ${isOpen ? 'text-green-600' : 'text-gray-400'}`} />
          <span>{isOpen ? 'Store Open' : 'Store Paused'}</span>
        </button>

        {/* User profile & logout */}
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
            {vendor?.storeName?.[0]?.toUpperCase() || 'V'}
          </div>
          <button
            onClick={signOutVendor}
            title="Sign out of Vendor Portal"
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
