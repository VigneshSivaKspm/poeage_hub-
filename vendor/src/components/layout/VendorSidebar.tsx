import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Wallet,
  Store,
  Settings,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Products', path: '/products', icon: Package },
  { label: 'Orders', path: '/orders', icon: ShoppingBag },
  { label: 'Inventory', path: '/inventory', icon: Layers },
  { label: 'Finance & Payouts', path: '/settlements', icon: Wallet },
  { label: 'Store Settings', path: '/settings', icon: Store },
];

export const VendorSidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col flex-shrink-0 min-h-screen">
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow">
          P
        </div>
        <div>
          <span className="font-extrabold text-white text-base tracking-tight">POEAGE</span>
          <span className="text-emerald-400 font-extrabold text-base tracking-tight ml-1">VENDOR</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Seller Management
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-xs">
          <p className="font-semibold text-slate-300 mb-1">Commission Tier</p>
          <p className="text-emerald-400 font-bold">Standard 10% (1,000 bps)</p>
        </div>
      </div>
    </aside>
  );
};
