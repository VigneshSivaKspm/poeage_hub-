import React from 'react';
import { NavLink } from 'react-router-dom';
import { Package, History, Wallet, User } from 'lucide-react';

const TABS = [
  { label: 'Deliveries', path: '/', icon: Package },
  { label: 'History', path: '/history', icon: History },
  { label: 'Earnings', path: '/earnings', icon: Wallet },
  { label: 'Profile', path: '/profile', icon: User },
];

export const DriverBottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 h-16 z-40 flex items-center justify-around px-2 text-xs">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-16 h-12 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'text-amber-400 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-[10px] tracking-tight leading-none">{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
