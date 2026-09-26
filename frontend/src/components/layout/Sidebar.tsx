import React from 'react';
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
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  propertyName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, propertyName }) => {
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
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen border-r border-slate-800 select-none no-print">
      {/* App Branding */}
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
        <div className="p-2.5 bg-blue-600 rounded-xl shadow-md text-white">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-tight text-white">PG Rent Manager</h1>
          <p className="text-xs text-blue-400 font-medium truncate max-w-[140px]">{propertyName || 'Sunshine PG'}</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Version Footer */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        <span>PG Rent Manager v1.0 • Desktop</span>
      </div>
    </aside>
  );
};
