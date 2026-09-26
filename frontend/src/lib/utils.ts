export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0.00';
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return 'N/A';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return 'N/A';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getRentStatusBadge(status: string) {
  switch (status) {
    case 'PAID':
      return { label: 'PAID', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    case 'PARTIAL':
      return { label: 'PARTIAL', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
    case 'OVERDUE':
      return { label: 'OVERDUE', bg: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold' };
    case 'PENDING':
      return { label: 'PENDING', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
    case 'UPCOMING':
      return { label: 'UPCOMING', bg: 'bg-slate-100 text-slate-700 border-slate-300' };
    case 'WAIVED':
      return { label: 'WAIVED', bg: 'bg-purple-100 text-purple-800 border-purple-300' };
    default:
      return { label: status, bg: 'bg-gray-100 text-gray-800 border-gray-300' };
  }
}

export function getTenantStatusBadge(status: string) {
  switch (status) {
    case 'ACTIVE':
      return { label: 'Active', bg: 'bg-emerald-100 text-emerald-800' };
    case 'NOTICE_PERIOD':
      return { label: 'Notice Period', bg: 'bg-amber-100 text-amber-800' };
    case 'CHECKED_OUT':
      return { label: 'Checked Out', bg: 'bg-slate-100 text-slate-700' };
    case 'ARCHIVED':
      return { label: 'Archived', bg: 'bg-rose-100 text-rose-800' };
    default:
      return { label: status, bg: 'bg-gray-100 text-gray-800' };
  }
}
