'use client';

import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';
import { ToastContainer, ToastMessage } from '../components/ui/Toast';

import { AddTenantModal } from '../components/modals/AddTenantModal';
import { EditTenantModal } from '../components/modals/EditTenantModal';
import { RecordPaymentModal } from '../components/modals/RecordPaymentModal';
import { ReceiptViewerModal } from '../components/modals/ReceiptViewerModal';
import { WhatsAppPreviewModal } from '../components/modals/WhatsAppPreviewModal';
import { TenantHistoryModal } from '../components/modals/TenantHistoryModal';
import { TemplateEditorModal } from '../components/modals/TemplateEditorModal';

import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getRentStatusBadge,
  getTenantStatusBadge,
} from '../lib/utils';

import {
  TrendingUp,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  CreditCard,
  MessageSquare,
  Plus,
  Printer,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  FileSpreadsheet,
  Building,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [mounted, setMounted] = useState(false);

  // Modals state
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [isEditTenantOpen, setIsEditTenantOpen] = useState(false);
  const [selectedTenantForEdit, setSelectedTenantForEdit] = useState<any>(null);

  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [paymentPreselectTenantId, setPaymentPreselectTenantId] = useState<string>('');
  const [paymentPreselectRentId, setPaymentPreselectRentId] = useState<string>('');

  const [isReceiptViewerOpen, setIsReceiptViewerOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppTenant, setWhatsAppTenant] = useState<any>(null);
  const [whatsAppRent, setWhatsAppRent] = useState<any>(null);

  const [isTenantHistoryOpen, setIsTenantHistoryOpen] = useState(false);
  const [historyTenantId, setHistoryTenantId] = useState<string>('');

  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Data states
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [tenantStatusFilter, setTenantStatusFilter] = useState('ACTIVE');
  const [rents, setRents] = useState<any[]>([]);
  // Initialize with empty string to avoid hydration mismatch; set on client mount
  const [selectedRentMonth, setSelectedRentMonth] = useState<string>('');
  const [rentStatusFilter, setRentStatusFilter] = useState('');

  const [payments, setPayments] = useState<any[]>([]);
  const [calendarMonthData, setCalendarMonthData] = useState<any>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>('');

  const [templates, setTemplates] = useState<any[]>([]);
  const [whatsappLogs, setWhatsappLogs] = useState<any[]>([]);

  const [reportsData, setReportsData] = useState<any>(null);
  const [reportType, setReportType] = useState('monthly');

  const [propertyInfo, setPropertyInfo] = useState<any>({
    name: 'Sunshine Luxury PG',
    address: '123 Main Road, Koramangala, Bengaluru',
    phone: '+91 98765 43210',
    email: 'contact@sunshinepg.com',
  });

  const [restoreJson, setRestoreJson] = useState('');

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, text }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Set date-based state on client mount to avoid SSR hydration mismatch
  useEffect(() => {
    const now = new Date();
    setSelectedRentMonth(now.toISOString().slice(0, 7));
    setSelectedCalendarDate(now.toISOString().slice(0, 10));
    setMounted(true);
  }, []);

  // Initial Fetch & Refresh Trigger — only after mounted (date values ready)
  useEffect(() => {
    if (!mounted) return;
    loadPropertyInfo();
    loadDashboard();
    if (activeTab === 'tenants') loadTenants();
    if (activeTab === 'rents') loadRents();
    if (activeTab === 'payments') loadPayments();
    if (activeTab === 'calendar') loadCalendarMonth();
    if (activeTab === 'whatsapp') loadWhatsApp();
    if (activeTab === 'reports') loadReports();
  }, [mounted, activeTab, selectedRentMonth, tenantStatusFilter, rentStatusFilter, searchQuery]);

  const loadPropertyInfo = async () => {
    try {
      const res = await api.get('/settings/property');
      setPropertyInfo(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadDashboard = async () => {
    try {
      const res = await api.get(`/dashboard/summary?rentMonth=${selectedRentMonth}`);
      setDashboardData(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadTenants = async () => {
    try {
      const res = await api.get(
        `/tenants?status=${tenantStatusFilter}&search=${encodeURIComponent(searchQuery)}`,
      );
      setTenants(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadRents = async () => {
    try {
      let url = `/rents?rentMonth=${selectedRentMonth}&search=${encodeURIComponent(searchQuery)}`;
      if (rentStatusFilter) url += `&status=${rentStatusFilter}`;
      const res = await api.get(url);
      setRents(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadPayments = async () => {
    try {
      const res = await api.get(`/payments?search=${encodeURIComponent(searchQuery)}`);
      setPayments(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadCalendarMonth = async () => {
    try {
      const [year, month] = selectedRentMonth.split('-');
      const res = await api.get(`/calendar/month?year=${year}&month=${month}`);
      setCalendarMonthData(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadWhatsApp = async () => {
    try {
      const [tmplRes, msgRes] = await Promise.all([
        api.get('/whatsapp/templates'),
        api.get('/whatsapp/messages'),
      ]);
      setTemplates(tmplRes.data || []);
      setWhatsappLogs(msgRes.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadReports = async () => {
    try {
      if (reportType === 'monthly') {
        const res = await api.get(`/reports/monthly?rentMonth=${selectedRentMonth}`);
        setReportsData(res.data);
      } else if (reportType === 'daily') {
        const res = await api.get('/reports/daily');
        setReportsData(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateRents = async () => {
    try {
      const res = await api.post('/rents/generate', { rentMonth: selectedRentMonth });
      showToast(res.data.message || 'Rent records generated successfully!', 'success');
      loadDashboard();
      if (activeTab === 'rents') loadRents();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to generate rents', 'error');
    }
  };

  const handleArchiveTenant = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to archive tenant "${name}"? Financial records will remain preserved.`)) {
      try {
        await api.delete(`/tenants/${id}`);
        showToast(`Tenant "${name}" archived`, 'info');
        loadTenants();
      } catch (err: any) {
        showToast('Failed to archive tenant', 'error');
      }
    }
  };

  const handleSavePropertyInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch('/settings/property', propertyInfo);
      showToast('PG Information updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update PG Info', 'error');
    }
  };

  const handleRestoreBackup = async () => {
    if (!restoreJson) {
      showToast('Please paste or select a valid JSON backup', 'error');
      return;
    }
    if (window.confirm('WARNING: This will replace application data with the backup contents. Continue?')) {
      try {
        const parsed = JSON.parse(restoreJson);
        const res = await api.post('/settings/restore', parsed);
        showToast(res.data.message || 'Database restored successfully!', 'success');
        loadDashboard();
        setRestoreJson('');
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Invalid JSON format', 'error');
      }
    }
  };

  if (!mounted) {
    return (
      <div className="flex h-screen bg-zinc-100 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center animate-pulse">
            <Building className="w-7 h-7 text-white" />
          </div>
          <span className="text-sm font-semibold text-zinc-500 tracking-wide">Loading PG Rent Manager...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        propertyName={propertyInfo?.name}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onQuickAddTenant={() => setIsAddTenantOpen(true)}
          onQuickRecordPayment={() => {
            setPaymentPreselectTenantId('');
            setPaymentPreselectRentId('');
            setIsRecordPaymentOpen(true);
          }}
          onGenerateRents={handleGenerateRents}
          activeTabTitle={activeTab}
        />

        {/* Tab Content Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
          {/* ================= MODULE 1: DASHBOARD ================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Summary Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-zinc-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                  <div>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                      Total Expected Rent
                    </span>
                    <span className="text-2xl font-extrabold text-black mt-1 block">
                      {formatCurrency(dashboardData?.cards?.totalExpected || 0)}
                    </span>
                    <span className="text-xs text-zinc-500 mt-0.5 block font-medium">
                      Month: {selectedRentMonth}
                    </span>
                  </div>
                  <div className="p-3 bg-zinc-100 text-zinc-800 rounded-xl">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-xl border border-zinc-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                  <div>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                      Rent Collected
                    </span>
                    <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">
                      {formatCurrency(dashboardData?.cards?.totalCollected || 0)}
                    </span>
                    <span className="text-xs text-emerald-700 font-medium mt-0.5 block">
                      {dashboardData?.cards?.paidTenantsCount || 0} Tenants Paid
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-xl border border-zinc-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                  <div>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                      Pending Rent
                    </span>
                    <span className="text-2xl font-extrabold text-amber-600 mt-1 block">
                      {formatCurrency(dashboardData?.cards?.totalPendingAmount || 0)}
                    </span>
                    <span className="text-xs text-amber-700 font-medium mt-0.5 block">
                      {dashboardData?.cards?.pendingTenantsCount || 0} Pending / Partial
                    </span>
                  </div>
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-xl border border-zinc-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                  <div>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                      Overdue Rent
                    </span>
                    <span className="text-2xl font-extrabold text-rose-600 mt-1 block">
                      {formatCurrency(dashboardData?.cards?.totalOverdueAmount || 0)}
                    </span>
                    <span className="text-xs text-rose-700 font-medium mt-0.5 block">
                      {dashboardData?.cards?.overdueTenantsCount || 0} Overdue Tenants
                    </span>
                  </div>
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Progress Collection Bar */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-zinc-200 shadow-sm space-y-2.5">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-black">Monthly Collection ({selectedRentMonth})</span>
                  <span className="text-black font-bold text-base">
                    {formatCurrency(dashboardData?.cards?.totalCollected || 0)} /{' '}
                    {formatCurrency(dashboardData?.cards?.totalExpected || 0)} (
                    {dashboardData?.cards?.collectionPercentage || 0}%)
                  </span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-3 overflow-hidden border border-zinc-200">
                  <div
                    className="bg-black h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, dashboardData?.cards?.collectionPercentage || 0)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Overdue Action List & Today's Payments */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Overdue Tenants List */}
                <div className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-5 shadow-sm flex flex-col min-h-[400px]">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-black text-base flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                      <span>Overdue Tenants</span>
                    </h3>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-rose-100 text-rose-800 rounded-md border border-rose-200">
                      {dashboardData?.overdueList?.length || 0} Overdue
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 max-h-80 pr-1">
                    {dashboardData?.overdueList?.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-8">
                        No overdue rent records! All payments up to date.
                      </p>
                    ) : (
                      dashboardData?.overdueList?.map((item: any) => (
                        <div
                          key={item.rentId}
                          className="p-3.5 bg-white border border-rose-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm transition-all hover:border-rose-300 hover:shadow-md"
                        >
                          <div>
                            <span className="font-bold text-black text-sm block">
                              {item.tenantName}
                            </span>
                            <span className="text-xs text-zinc-600 block">
                              Room {item.roomNumber} • Phone: {item.phone}
                            </span>
                            <span className="text-xs text-rose-600 font-semibold block mt-0.5">
                              Due: {formatCurrency(item.remainingAmount)} (Due Date: {formatDate(item.dueDate)})
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 w-full sm:w-auto">
                            <button
                              onClick={() => {
                                setWhatsAppTenant({
                                  id: item.tenantId,
                                  fullName: item.tenantName,
                                  phone: item.phone,
                                  roomNumber: item.roomNumber,
                                });
                                setWhatsAppRent({
                                  id: item.rentId,
                                  amount: item.amount,
                                  remainingAmount: item.remainingAmount,
                                  dueDate: item.dueDate,
                                  status: 'OVERDUE',
                                });
                                setIsWhatsAppModalOpen(true);
                              }}
                              className="flex-1 sm:flex-none px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-black border border-zinc-200 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1 transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Remind</span>
                            </button>

                            <button
                              onClick={() => {
                                setPaymentPreselectTenantId(item.tenantId);
                                setPaymentPreselectRentId(item.rentId);
                                setIsRecordPaymentOpen(true);
                              }}
                              className="flex-1 sm:flex-none px-3 py-1.5 bg-black hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors text-center"
                            >
                              Pay
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Today's Payments */}
                <div className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-5 shadow-sm flex flex-col min-h-[400px]">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-black text-base flex items-center space-x-2">
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                      <span>Today's Collections</span>
                    </h3>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                      {dashboardData?.todayPayments?.length || 0} Payments
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 max-h-80 pr-1">
                    {dashboardData?.todayPayments?.length === 0 ? (
                      <p className="text-sm text-zinc-400 text-center py-8">
                        No payments recorded today yet.
                      </p>
                    ) : (
                      dashboardData?.todayPayments?.map((p: any) => (
                        <div
                          key={p.id}
                          className="p-3.5 bg-white border border-zinc-200 rounded-xl flex items-center justify-between shadow-sm transition-all hover:shadow-md"
                        >
                          <div>
                            <span className="font-bold text-black text-sm block">
                              {p.tenantName}
                            </span>
                            <span className="text-xs text-zinc-500 block font-medium">
                              Room {p.roomNumber} • Receipt: {p.receiptNumber || 'N/A'}
                            </span>
                            <span className="text-xs text-zinc-400 block mt-0.5">
                              {p.method} • {formatDateTime(p.time)}
                            </span>
                          </div>
                          <span className="font-bold text-emerald-600 text-base">
                            {formatCurrency(p.amount)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= MODULE 2: TENANTS ================= */}
          {activeTab === 'tenants' && (
            <div className="space-y-4">
              {/* Filter Pills & Actions */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 gap-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  {['ACTIVE', 'NOTICE_PERIOD', 'CHECKED_OUT', 'ARCHIVED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setTenantStatusFilter(st)}
                      className={`px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors ${
                        tenantStatusFilter === st
                          ? 'bg-black text-white shadow-sm'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsAddTenantOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Tenant</span>
                </button>
              </div>

              {/* Tenants Mobile Cards View (Hidden on medium/large screens) */}
              <div className="md:hidden space-y-4">
                {tenants.length === 0 ? (
                  <div className="bg-white p-8 text-center text-zinc-400 rounded-xl border border-zinc-200 shadow-sm font-medium text-sm">
                    No tenants found matching criteria.
                  </div>
                ) : (
                  tenants.map((t) => {
                    const badge = getTenantStatusBadge(t.status);
                    return (
                      <div key={t.id} className="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm flex flex-col gap-3 transition-all hover:shadow-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-black block text-base leading-tight">{t.fullName}</span>
                            <span className="text-xs text-zinc-500 font-medium block mt-1">Room {t.roomNumber} • Bed {t.bedNumber || 'A'}</span>
                          </div>
                          <span className={`inline-block px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm py-2">
                          <div className="flex flex-col">
                            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Rent</span>
                            <span className="font-extrabold text-black text-lg">{formatCurrency(t.monthlyRent)}</span>
                          </div>
                          <div className="flex flex-col text-right">
                            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Phone</span>
                            <span className="font-bold text-zinc-800 text-sm mt-1">{t.phone}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-3 border-t border-zinc-100">
                          <button onClick={() => { setHistoryTenantId(t.id); setIsTenantHistoryOpen(true); }} className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 text-black text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors">
                            <Eye className="w-4 h-4" /> <span>History</span>
                          </button>
                          <button onClick={() => { setSelectedTenantForEdit(t); setIsEditTenantOpen(true); }} className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 text-black text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors">
                            <Edit className="w-4 h-4" /> <span>Edit</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Tenants Desktop Table (Hidden on small mobile screens) */}
              <div className="hidden md:block bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-zinc-50 text-zinc-500 font-bold text-[11px] uppercase tracking-wider border-b border-zinc-200">
                      <tr>
                        <th className="p-4">Tenant Name</th>
                        <th className="p-4">Room / Bed</th>
                        <th className="p-4">Phone Number</th>
                        <th className="p-4">Monthly Rent</th>
                        <th className="p-4">Deposit</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {tenants.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-zinc-400 font-medium">
                            No tenants found matching criteria.
                          </td>
                        </tr>
                      ) : (
                        tenants.map((t) => {
                          const badge = getTenantStatusBadge(t.status);
                          return (
                            <tr key={t.id} className="hover:bg-zinc-50 transition-colors">
                              <td className="p-4">
                                <span className="font-bold text-black block">{t.fullName}</span>
                                <span className="text-xs text-zinc-500 font-medium mt-0.5 block">
                                  Joined: {formatDate(t.joiningDate)}
                                </span>
                              </td>
                              <td className="p-4 font-bold text-zinc-800">
                                Room {t.roomNumber} <span className="text-zinc-500 font-medium text-xs ml-1">(Bed {t.bedNumber || 'A'})</span>
                              </td>
                              <td className="p-4 font-medium text-zinc-700">{t.phone}</td>
                              <td className="p-4 font-extrabold text-black">
                                {formatCurrency(t.monthlyRent)}
                              </td>
                              <td className="p-4 text-zinc-600 font-medium">
                                {formatCurrency(t.depositAmount)}
                              </td>
                              <td className="p-4">
                                <span className={`inline-block px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md ${badge.bg}`}>
                                  {badge.label}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => { setHistoryTenantId(t.id); setIsTenantHistoryOpen(true); }}
                                    className="p-2 text-zinc-600 hover:bg-zinc-200 hover:text-black rounded-lg transition-colors"
                                    title="View History"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => { setSelectedTenantForEdit(t); setIsEditTenantOpen(true); }}
                                    className="p-2 text-zinc-600 hover:bg-zinc-200 hover:text-black rounded-lg transition-colors"
                                    title="Edit Tenant"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleArchiveTenant(t.id, t.fullName)}
                                    className="p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors"
                                    title="Archive Tenant"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= MODULE 3: RENT MANAGEMENT ================= */}
          {activeTab === 'rents' && (
            <div className="space-y-4">
              {/* Month Selector & Filter */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 gap-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Month:</label>
                    <input
                      type="month"
                      value={selectedRentMonth}
                      onChange={(e) => setSelectedRentMonth(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-zinc-300 rounded-lg font-bold text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 sm:border-l sm:border-zinc-200 sm:pl-4">
                    {['', 'PAID', 'PARTIAL', 'OVERDUE', 'PENDING'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setRentStatusFilter(st)}
                        className={`px-3 py-1.5 text-[11px] font-bold rounded-md uppercase tracking-wider transition-colors ${
                          rentStatusFilter === st
                            ? 'bg-black text-white shadow-sm'
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        }`}
                      >
                        {st || 'ALL'}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerateRents}
                  className="w-full sm:w-auto px-4 py-2 bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Auto Generate</span>
                </button>
              </div>

              {/* Rents Mobile Cards View (Hidden on medium/large screens) */}
              <div className="md:hidden space-y-4">
                {rents.length === 0 ? (
                  <div className="bg-white p-8 text-center text-zinc-400 font-medium text-sm rounded-xl border border-zinc-200 shadow-sm">
                    No rent records found for {selectedRentMonth}.
                  </div>
                ) : (
                  rents.map((r) => {
                    const badge = getRentStatusBadge(r.status);
                    return (
                      <div key={r.id} className="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm flex flex-col gap-3 transition-all hover:shadow-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-black block text-base leading-tight">{r.tenant?.fullName}</span>
                            <span className="text-xs text-zinc-500 font-medium block mt-1">Room {r.tenant?.roomNumber} • {r.rentMonth}</span>
                          </div>
                          <span className={`inline-block px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-zinc-100">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Billed</span>
                            <span className="font-extrabold text-black mt-0.5">{formatCurrency(r.amount)}</span>
                          </div>
                          <div className="flex flex-col text-center">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Paid</span>
                            <span className="font-bold text-emerald-600 mt-0.5">{formatCurrency(r.paidAmount)}</span>
                          </div>
                          <div className="flex flex-col text-right">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Due</span>
                            <span className="font-bold text-rose-600 mt-0.5">{formatCurrency(r.remainingAmount)}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-1">
                          {r.status !== 'PAID' && r.status !== 'WAIVED' ? (
                            <>
                              <button
                                onClick={() => {
                                  setPaymentPreselectTenantId(r.tenantId);
                                  setPaymentPreselectRentId(r.id);
                                  setIsRecordPaymentOpen(true);
                                }}
                                className="flex-1 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors"
                              >
                                Record Pay
                              </button>
                              <button
                                onClick={() => {
                                  setWhatsAppTenant(r.tenant);
                                  setWhatsAppRent(r);
                                  setIsWhatsAppModalOpen(true);
                                }}
                                className="flex-1 py-2 bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-black text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Remind</span>
                              </button>
                            </>
                          ) : (
                            <div className="w-full text-center py-1 text-xs font-bold text-emerald-600 tracking-wide">
                              ✓ Rent Fully Settled
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Rents Desktop Table (Hidden on mobile) */}
              <div className="hidden md:block bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-zinc-50 text-zinc-500 font-bold text-[11px] uppercase tracking-wider border-b border-zinc-200">
                      <tr>
                        <th className="p-4">Tenant Name</th>
                        <th className="p-4">Room</th>
                        <th className="p-4">Month</th>
                        <th className="p-4">Due Date</th>
                        <th className="p-4 text-right">Billed</th>
                        <th className="p-4 text-right">Paid</th>
                        <th className="p-4 text-right">Remaining</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {rents.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-8 text-center text-zinc-400 font-medium">
                            No rent records found for {selectedRentMonth}.
                          </td>
                        </tr>
                      ) : (
                        rents.map((r) => {
                          const badge = getRentStatusBadge(r.status);
                          return (
                            <tr key={r.id} className="hover:bg-zinc-50 transition-colors">
                              <td className="p-4 font-bold text-black">{r.tenant?.fullName}</td>
                              <td className="p-4 font-medium text-zinc-700">Room {r.tenant?.roomNumber}</td>
                              <td className="p-4 font-medium text-zinc-600">{r.rentMonth}</td>
                              <td className="p-4 text-zinc-500 text-xs font-medium">{formatDate(r.dueDate)}</td>
                              <td className="p-4 text-right font-extrabold text-black">
                                {formatCurrency(r.amount)}
                              </td>
                              <td className="p-4 text-right font-bold text-emerald-600">
                                {formatCurrency(r.paidAmount)}
                              </td>
                              <td className="p-4 text-right font-bold text-rose-600">
                                {formatCurrency(r.remainingAmount)}
                              </td>
                              <td className="p-4 text-center">
                                <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${badge.bg}`}>
                                  {badge.label}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  {r.status !== 'PAID' && r.status !== 'WAIVED' && (
                                    <>
                                      <button
                                        onClick={() => {
                                          setPaymentPreselectTenantId(r.tenantId);
                                          setPaymentPreselectRentId(r.id);
                                          setIsRecordPaymentOpen(true);
                                        }}
                                        className="px-3 py-1.5 bg-black hover:bg-zinc-800 text-white text-[11px] uppercase tracking-wider font-bold rounded-lg transition-colors"
                                      >
                                        Pay
                                      </button>
                                      <button
                                        onClick={() => {
                                          setWhatsAppTenant(r.tenant);
                                          setWhatsAppRent(r);
                                          setIsWhatsAppModalOpen(true);
                                        }}
                                        className="p-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-black rounded-lg transition-colors"
                                        title="Send WhatsApp Reminder"
                                      >
                                        <MessageSquare className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= MODULE 4: PAYMENTS & RECEIPTS ================= */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 gap-4 shadow-sm">
                <span className="font-bold text-black text-sm uppercase tracking-wider">Payment Transaction History</span>
                <button
                  onClick={() => {
                    setPaymentPreselectTenantId('');
                    setPaymentPreselectRentId('');
                    setIsRecordPaymentOpen(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center space-x-2 shadow-sm transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Record New Payment</span>
                </button>
              </div>

              {/* Payments Mobile Cards View (Hidden on medium/large screens) */}
              <div className="md:hidden space-y-4">
                {payments.length === 0 ? (
                  <div className="bg-white p-8 text-center text-zinc-400 font-medium text-sm rounded-xl border border-zinc-200 shadow-sm">
                    No payment transactions recorded.
                  </div>
                ) : (
                  payments.map((p) => (
                    <div key={p.id} className="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm flex flex-col gap-3 transition-all hover:shadow-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-black block text-base leading-tight">{p.tenant?.fullName}</span>
                          <span className="text-xs text-zinc-500 font-medium block mt-1">Room {p.tenant?.roomNumber} • {p.rent?.rentMonth}</span>
                        </div>
                        <span className="font-extrabold text-emerald-600 text-lg">
                          {formatCurrency(p.amount)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 py-2 border-t border-b border-zinc-100">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Method</span>
                          <span className="font-bold text-black mt-0.5">{p.paymentMethod}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Date</span>
                          <span className="font-medium text-zinc-800 mt-0.5">{formatDate(p.paymentDate)}</span>
                        </div>
                        <div className="flex flex-col col-span-2 mt-1">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Receipt / Ref #</span>
                          <span className="font-mono text-xs text-black font-semibold mt-0.5">
                            {p.receipt?.receiptNumber || p.referenceNumber || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {p.receipt && (
                        <div className="pt-1">
                          <button
                            onClick={() => {
                              setSelectedReceipt(p.receipt);
                              setIsReceiptViewerOpen(true);
                            }}
                            className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-black border border-zinc-200 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Receipt</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Payments Desktop Table (Hidden on mobile) */}
              <div className="hidden md:block bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-zinc-50 text-zinc-500 font-bold text-[11px] uppercase tracking-wider border-b border-zinc-200">
                      <tr>
                        <th className="p-4">Receipt #</th>
                        <th className="p-4">Tenant Name</th>
                        <th className="p-4">Room</th>
                        <th className="p-4">Rent Month</th>
                        <th className="p-4">Payment Date</th>
                        <th className="p-4">Method</th>
                        <th className="p-4">Reference No.</th>
                        <th className="p-4 text-right">Amount Paid</th>
                        <th className="p-4 text-center">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {payments.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-8 text-center text-zinc-400 font-medium">
                            No payment transactions recorded.
                          </td>
                        </tr>
                      ) : (
                        payments.map((p) => (
                          <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                            <td className="p-4 font-mono font-bold text-black text-xs">
                              {p.receipt?.receiptNumber || 'N/A'}
                            </td>
                            <td className="p-4 font-bold text-black">{p.tenant?.fullName}</td>
                            <td className="p-4 font-medium text-zinc-700">Room {p.tenant?.roomNumber}</td>
                            <td className="p-4 font-medium text-zinc-600">{p.rent?.rentMonth}</td>
                            <td className="p-4 text-zinc-500 text-xs font-medium">{formatDate(p.paymentDate)}</td>
                            <td className="p-4 font-bold text-zinc-800">{p.paymentMethod}</td>
                            <td className="p-4 text-zinc-500 text-xs font-medium">{p.referenceNumber || 'N/A'}</td>
                            <td className="p-4 text-right font-extrabold text-emerald-600">
                              {formatCurrency(p.amount)}
                            </td>
                            <td className="p-4 text-center">
                              {p.receipt && (
                                <button
                                  onClick={() => {
                                    setSelectedReceipt(p.receipt);
                                    setIsReceiptViewerOpen(true);
                                  }}
                                  className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-black text-[11px] font-bold uppercase tracking-wider rounded-lg flex items-center justify-center space-x-1.5 mx-auto transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= MODULE 5: RENT CALENDAR ================= */}
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              {/* Calendar Controls */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-4 rounded-xl border border-zinc-200 gap-4 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-black text-white rounded-lg">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-black text-base">
                    Activity Calendar ({selectedRentMonth})
                  </h3>
                </div>
                <input
                  type="month"
                  value={selectedRentMonth}
                  onChange={(e) => setSelectedRentMonth(e.target.value)}
                  className="w-full sm:w-auto px-3 py-1.5 text-sm border border-zinc-300 rounded-lg font-bold text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                />
              </div>

              {/* Month Daily Grid */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-3">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="text-center font-bold text-[10px] sm:text-xs uppercase text-zinc-500 py-1">
                    {d}
                  </div>
                ))}

                {calendarMonthData &&
                  Object.values(calendarMonthData.dailyData || {}).map((day: any) => {
                    const isSelected = selectedCalendarDate === day.date;
                    const hasPayments = day.payments?.length > 0;
                    const hasDues = day.rentsDue?.length > 0;

                    return (
                      <div
                        key={day.date}
                        onClick={() => setSelectedCalendarDate(day.date)}
                        className={`p-1.5 sm:p-3 bg-white border rounded-xl cursor-pointer min-h-[70px] sm:min-h-[90px] flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'border-black ring-1 ring-black shadow-md'
                            : 'border-zinc-200 hover:border-zinc-400 shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-start sm:items-center">
                          <span className={`font-bold text-xs sm:text-sm ${isSelected ? 'text-black' : 'text-zinc-700'}`}>
                            {day.date.split('-')[2]}
                          </span>
                          {hasPayments && (
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 mt-1 sm:mt-0"></span>
                          )}
                        </div>

                        <div className="space-y-0.5 sm:space-y-1 text-[9px] sm:text-[11px] leading-tight">
                          {hasPayments && (
                            <div className="text-emerald-600 font-bold truncate">
                              +{formatCurrency(day.totalCollected)}
                            </div>
                          )}
                          {hasDues && (
                            <div className="text-rose-600 font-bold truncate">
                              Due: {formatCurrency(day.totalDue)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Selected Day Activity Drawer */}
              {selectedCalendarDate && calendarMonthData?.dailyData?.[selectedCalendarDate] && (
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-black shadow-md space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <h4 className="font-bold text-black text-base flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-zinc-500" />
                    <span>Activity on {formatDate(selectedCalendarDate)}</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Payments Received on Date */}
                    <div>
                      <h5 className="font-bold text-[11px] uppercase tracking-wider text-zinc-500 mb-3 flex items-center space-x-1.5">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Received ({calendarMonthData.dailyData[selectedCalendarDate].payments.length})</span>
                      </h5>
                      <div className="space-y-2.5">
                        {calendarMonthData.dailyData[selectedCalendarDate].payments.length === 0 ? (
                          <p className="text-xs font-medium text-zinc-400 bg-zinc-50 p-3 rounded-lg border border-dashed border-zinc-200">No payments received on this date.</p>
                        ) : (
                          calendarMonthData.dailyData[selectedCalendarDate].payments.map((p: any) => (
                            <div
                              key={p.id}
                              className="p-3 bg-white border border-emerald-200 shadow-sm rounded-lg flex justify-between items-center text-xs transition-all hover:shadow-md"
                            >
                              <div>
                                <span className="font-bold text-black block text-sm">{p.tenantName}</span>
                                <span className="text-zinc-500 font-medium mt-0.5 block">Room {p.roomNumber} • {p.paymentMethod}</span>
                              </div>
                              <span className="font-extrabold text-emerald-600 text-base">
                                +{formatCurrency(p.amount)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Rents Due on Date */}
                    <div>
                      <h5 className="font-bold text-[11px] uppercase tracking-wider text-zinc-500 mb-3 flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Due ({calendarMonthData.dailyData[selectedCalendarDate].rentsDue.length})</span>
                      </h5>
                      <div className="space-y-2.5">
                        {calendarMonthData.dailyData[selectedCalendarDate].rentsDue.length === 0 ? (
                          <p className="text-xs font-medium text-zinc-400 bg-zinc-50 p-3 rounded-lg border border-dashed border-zinc-200">No rents due on this date.</p>
                        ) : (
                          calendarMonthData.dailyData[selectedCalendarDate].rentsDue.map((r: any) => (
                            <div
                              key={r.id}
                              className="p-3 bg-white border border-rose-200 shadow-sm rounded-lg flex justify-between items-center text-xs transition-all hover:shadow-md"
                            >
                              <div>
                                <span className="font-bold text-black block text-sm">{r.tenantName}</span>
                                <span className="text-zinc-500 font-medium mt-0.5 block">Room {r.roomNumber}</span>
                              </div>
                              <span className="font-extrabold text-rose-600 text-base">
                                {formatCurrency(r.amount)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= MODULE 6: WHATSAPP AUTOMATION ================= */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-6">
              {/* WhatsApp Message Templates Section */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-zinc-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <h3 className="font-bold text-black text-base">WhatsApp Message Templates</h3>
                    <p className="text-xs text-zinc-500 font-medium mt-1">
                      Editable text templates with automatic variable substitution.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      className="p-4 bg-white border border-zinc-200 shadow-sm rounded-xl space-y-3 flex flex-col justify-between transition-all hover:shadow-md"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-sm text-black">{tmpl.name}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-zinc-100 text-zinc-600 rounded-md">
                            {tmpl.type}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 font-mono leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-100 line-clamp-4">
                          {tmpl.content}
                        </p>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => {
                            setSelectedTemplate(tmpl);
                            setIsTemplateEditorOpen(true);
                          }}
                          className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300"
                        >
                          Edit Template
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Communication Log */}
              <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-zinc-200 font-bold text-black text-sm">
                  Recent WhatsApp Message History Log
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-zinc-50 text-zinc-500 font-bold text-[11px] uppercase tracking-wider border-b border-zinc-200">
                      <tr>
                        <th className="p-4">Sent Timestamp</th>
                        <th className="p-4">Tenant Name</th>
                        <th className="p-4">Phone</th>
                        <th className="p-4">Template</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Message Text</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {whatsappLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-zinc-400 font-medium">
                            No WhatsApp messages logged yet.
                          </td>
                        </tr>
                      ) : (
                        whatsappLogs.map((m) => (
                          <tr key={m.id} className="hover:bg-zinc-50 transition-colors">
                            <td className="p-4 text-xs font-medium text-zinc-600">{formatDateTime(m.sentAt)}</td>
                            <td className="p-4 font-bold text-black">{m.tenant?.fullName}</td>
                            <td className="p-4 text-zinc-600 font-medium">{m.phone}</td>
                            <td className="p-4 font-bold text-zinc-800 text-[11px] uppercase tracking-wider">{m.templateName}</td>
                            <td className="p-4">
                              <span className="inline-block px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                                {m.status}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-zinc-600 max-w-xs truncate font-mono bg-zinc-50 rounded mx-2 my-2 border border-zinc-100">
                              {m.messageBody}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= MODULE 7: REPORTS ================= */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              {/* Reports Control Tabs */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 gap-4 shadow-sm">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setReportType('monthly')}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
                      reportType === 'monthly'
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    Monthly Rent Report
                  </button>
                  <button
                    onClick={() => setReportType('daily')}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
                      reportType === 'daily'
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    Daily Collection Report
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <a
                    href={`${api.defaults.baseURL}/reports/${reportType}/csv?rentMonth=${selectedRentMonth}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-none px-4 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Export CSV</span>
                  </a>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 sm:flex-none px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-black border border-zinc-200 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Report</span>
                  </button>
                </div>
              </div>

              {/* Monthly Report View */}
              {reportType === 'monthly' && reportsData && (
                <div className="bg-white p-4 sm:p-6 rounded-xl border border-zinc-200 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start border-b border-zinc-200 pb-4 gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-black leading-tight">
                        Monthly Rent Financial Report ({reportsData.rentMonth})
                      </h3>
                      <p className="text-xs text-zinc-500 font-medium mt-1">Property: {propertyInfo?.name}</p>
                    </div>
                    <div className="flex space-x-6 text-xs bg-zinc-50 p-3 rounded-xl border border-zinc-100 w-full sm:w-auto">
                      <div>
                        <span className="text-zinc-500 block uppercase tracking-wider font-bold text-[10px]">Expected</span>
                        <span className="font-extrabold text-black text-sm mt-0.5 block">
                          {formatCurrency(reportsData.totals?.totalExpected || 0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block uppercase tracking-wider font-bold text-[10px]">Collected</span>
                        <span className="font-extrabold text-emerald-600 text-sm mt-0.5 block">
                          {formatCurrency(reportsData.totals?.totalCollected || 0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block uppercase tracking-wider font-bold text-[10px]">Pending</span>
                        <span className="font-extrabold text-rose-600 text-sm mt-0.5 block">
                          {formatCurrency(reportsData.totals?.totalPending || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap border border-zinc-200 rounded-lg overflow-hidden">
                      <thead className="bg-zinc-50 text-zinc-500 font-bold uppercase tracking-wider text-[11px] border-b border-zinc-200">
                        <tr>
                          <th className="p-3 sm:p-4">Tenant</th>
                          <th className="p-3 sm:p-4">Room</th>
                          <th className="p-3 sm:p-4">Phone</th>
                          <th className="p-3 sm:p-4 text-right">Rent Billed</th>
                          <th className="p-3 sm:p-4 text-right">Paid</th>
                          <th className="p-3 sm:p-4 text-right">Remaining</th>
                          <th className="p-3 sm:p-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {reportsData.rows?.map((r: any) => (
                          <tr key={r.tenantId} className="hover:bg-zinc-50 transition-colors">
                            <td className="p-3 sm:p-4 font-bold text-black">{r.tenantName}</td>
                            <td className="p-3 sm:p-4 font-medium text-zinc-700">Room {r.roomNumber}</td>
                            <td className="p-3 sm:p-4 text-zinc-500 font-medium">{r.phone}</td>
                            <td className="p-3 sm:p-4 text-right font-extrabold text-black">{formatCurrency(r.amount)}</td>
                            <td className="p-3 sm:p-4 text-right font-bold text-emerald-600">
                              {formatCurrency(r.paidAmount)}
                            </td>
                            <td className="p-3 sm:p-4 text-right font-bold text-rose-600">
                              {formatCurrency(r.remainingAmount)}
                            </td>
                            <td className="p-3 sm:p-4 text-center font-bold text-[10px] tracking-wider uppercase text-zinc-600">{r.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= MODULE 8: SETTINGS & BACKUP ================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl mx-auto pb-8">
              {/* PG Information Form */}
              <form
                onSubmit={handleSavePropertyInfo}
                className="bg-white p-4 sm:p-6 rounded-xl border border-zinc-200 space-y-4 shadow-sm"
              >
                <h3 className="font-bold text-black text-base flex items-center space-x-2 pb-2 border-b border-zinc-100">
                  <div className="p-1.5 bg-zinc-100 rounded-md">
                    <Building className="w-5 h-5 text-black" />
                  </div>
                  <span>PG Property Configuration</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold tracking-wider text-zinc-500 uppercase mb-1.5">
                      PG / Hostel Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={propertyInfo?.name || ''}
                      onChange={(e) => setPropertyInfo({ ...propertyInfo, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black focus:outline-none transition-colors font-medium text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold tracking-wider text-zinc-500 uppercase mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={propertyInfo?.phone || ''}
                      onChange={(e) => setPropertyInfo({ ...propertyInfo, phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black focus:outline-none transition-colors font-medium text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold tracking-wider text-zinc-500 uppercase mb-1.5">
                    Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={propertyInfo?.address || ''}
                    onChange={(e) => setPropertyInfo({ ...propertyInfo, address: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black focus:outline-none transition-colors font-medium text-black"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-colors"
                  >
                    Save Property Info
                  </button>
                </div>
              </form>

              {/* Database Backup & Restore */}
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-zinc-200 space-y-4 shadow-sm">
                <h3 className="font-bold text-black text-base flex items-center space-x-2 pb-2 border-b border-zinc-100">
                  <div className="p-1.5 bg-zinc-100 rounded-md">
                    <ShieldCheck className="w-5 h-5 text-black" />
                  </div>
                  <span>Database Backup & Restore</span>
                </h3>

                <p className="text-xs text-zinc-500 font-medium">
                  Export complete application data to a JSON backup file or restore from a previous backup file.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                  <a
                    href={`${api.defaults.baseURL}/settings/backup`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto px-4 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center space-x-2 shadow-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Backup (JSON)</span>
                  </a>
                </div>

                <div className="border-t border-zinc-100 pt-5 mt-5 space-y-3">
                  <label className="block text-[11px] font-bold tracking-wider text-rose-600 uppercase">
                    Restore Data from Backup (Paste JSON)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Paste JSON backup content here..."
                    value={restoreJson}
                    onChange={(e) => setRestoreJson(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg font-mono resize-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 focus:outline-none bg-rose-50/30 transition-colors text-black"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleRestoreBackup}
                      className="w-full sm:w-auto px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-colors"
                    >
                      Restore Database
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <AddTenantModal
        isOpen={isAddTenantOpen}
        onClose={() => setIsAddTenantOpen(false)}
        onSuccess={() => {
          loadTenants();
          loadDashboard();
        }}
        showToast={showToast}
      />

      <EditTenantModal
        isOpen={isEditTenantOpen}
        onClose={() => setIsEditTenantOpen(false)}
        tenant={selectedTenantForEdit}
        onSuccess={() => {
          loadTenants();
          loadDashboard();
        }}
        showToast={showToast}
      />

      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        preselectedTenantId={paymentPreselectTenantId}
        preselectedRentId={paymentPreselectRentId}
        onSuccess={(payData) => {
          loadDashboard();
          if (activeTab === 'rents') loadRents();
          if (activeTab === 'payments') loadPayments();
          if (payData?.receipt) {
            setSelectedReceipt(payData.receipt);
            setIsReceiptViewerOpen(true);
          }
        }}
        showToast={showToast}
      />

      <ReceiptViewerModal
        isOpen={isReceiptViewerOpen}
        onClose={() => setIsReceiptViewerOpen(false)}
        receiptData={selectedReceipt}
      />

      <WhatsAppPreviewModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        tenant={whatsAppTenant}
        rent={whatsAppRent}
        showToast={showToast}
      />

      <TenantHistoryModal
        isOpen={isTenantHistoryOpen}
        onClose={() => setIsTenantHistoryOpen(false)}
        tenantId={historyTenantId}
      />

      <TemplateEditorModal
        isOpen={isTemplateEditorOpen}
        onClose={() => setIsTemplateEditorOpen(false)}
        template={selectedTemplate}
        onSuccess={loadWhatsApp}
        showToast={showToast}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
