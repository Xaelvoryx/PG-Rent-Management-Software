import React from 'react';
import { Search, Plus, CreditCard, Bell, Sparkles } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onQuickAddTenant: () => void;
  onQuickRecordPayment: () => void;
  onGenerateRents: () => void;
  activeTabTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onQuickAddTenant,
  onQuickRecordPayment,
  onGenerateRents,
  activeTabTitle,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between select-none no-print shadow-sm">
      {/* Page Title & Search Bar */}
      <div className="flex items-center space-x-6">
        <h2 className="text-xl font-bold text-slate-800 capitalize tracking-tight">{activeTabTitle}</h2>

        {/* Global Search Input */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search tenant, room, receipt, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center space-x-3">
        <button
          id="btn-generate-monthly-rent"
          onClick={onGenerateRents}
          className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors"
          title="Auto generate monthly rent for active tenants"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Generate Rent</span>
        </button>

        <button
          id="btn-quick-record-payment"
          onClick={onQuickRecordPayment}
          className="flex items-center space-x-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          <CreditCard className="w-4 h-4" />
          <span>Record Payment</span>
        </button>

        <button
          id="btn-quick-add-tenant"
          onClick={onQuickAddTenant}
          className="flex items-center space-x-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Tenant</span>
        </button>
      </div>
    </header>
  );
};
