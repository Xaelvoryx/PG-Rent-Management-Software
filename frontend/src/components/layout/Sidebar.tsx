'use client';
import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  ReceiptText,
  CreditCard,
  CalendarDays,
  MessageSquare,
  BarChart3,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  propertyName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, propertyName }) => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tenants', label: 'Tenants', icon: Users },
    { id: 'rents', label: 'Rent', icon: ReceiptText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`hidden md:flex ${
        collapsed ? 'w-16' : 'w-60'
      } bg-black text-white flex-col h-screen border-r border-zinc-800 select-none no-print transition-all duration-300 ease-in-out relative flex-shrink-0`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-6 z-50 w-7 h-7 bg-black border border-zinc-700 rounded-full flex items-center justify-center text-white hover:bg-zinc-800 transition-colors shadow-md"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* App Branding */}
      <div className={`border-b border-zinc-800 flex items-center ${collapsed ? 'p-3 justify-center' : 'p-4 space-x-3'}`}>
        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-black" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-sm leading-tight tracking-tight text-white truncate">PG Rent Manager</h1>
            <p className="text-xs text-zinc-400 font-medium truncate max-w-[130px]">{propertyName || 'Sunshine PG'}</p>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className={`flex-1 py-3 space-y-0.5 overflow-y-auto ${collapsed ? 'px-2' : 'px-2'}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center ${collapsed ? 'justify-center px-2' : 'space-x-3 px-3'} py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-white text-black font-semibold'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Version Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-zinc-800 text-xs text-zinc-600 text-center">
          <span>PG Rent Manager v1.0</span>
        </div>
      )}
    </aside>
  );
};
