import React from 'react';
import { Search, Plus, CreditCard, Sparkles, Building2 } from 'lucide-react';

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
    <header className="h-14 bg-white border-b border-zinc-200 px-4 flex items-center justify-between select-none no-print sticky top-0 z-40">
      {/* Mobile Logo & Page Title */}
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="md:hidden w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-base font-bold text-black capitalize tracking-tight flex-shrink-0 truncate">
          {activeTabTitle}
        </h2>

        {/* Global Search - Hidden on small mobile, visible on sm and up */}
        <div className="relative w-full max-w-xs hidden sm:block ml-4">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search tenant, room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-black placeholder-zinc-400"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        <button
          id="btn-generate-monthly-rent"
          onClick={onGenerateRents}
          className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-black text-xs font-semibold rounded-lg border border-zinc-300 transition-colors"
          title="Auto generate monthly rent"
        >
          <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
          <span>Generate Rent</span>
        </button>

        <button
          id="btn-quick-record-payment"
          onClick={onQuickRecordPayment}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-black hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Record Payment</span>
        </button>

        <button
          id="btn-quick-add-tenant"
          onClick={onQuickAddTenant}
          className="flex items-center space-x-1.5 p-1.5 sm:px-3 sm:py-1.5 bg-white hover:bg-zinc-100 text-black text-xs font-semibold rounded-lg border border-zinc-300 transition-colors"
          title="Add Tenant"
        >
          <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">Add Tenant</span>
        </button>
      </div>
    </header>
  );
};
