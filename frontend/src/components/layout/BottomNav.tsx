'use client';
import React from 'react';
import { LayoutDashboard, Users, ReceiptText, CalendarDays, MoreHorizontal } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tenants', label: 'Tenants', icon: Users },
    { id: 'rents', label: 'Rent', icon: ReceiptText },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'more', label: 'More', icon: MoreHorizontal },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 flex justify-between items-center px-2 pb-safe z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id || (item.id === 'more' && ['payments', 'whatsapp', 'reports', 'settings'].includes(activeTab));
        
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id === 'more' ? 'payments' : item.id)} // Default 'more' to payments
            className={`flex flex-col items-center justify-center flex-1 py-3 transition-colors ${
              isActive ? 'text-black' : 'text-zinc-500 hover:text-black'
            }`}
          >
            <Icon className={`w-6 h-6 mb-1 ${isActive ? 'fill-zinc-100' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
            <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
