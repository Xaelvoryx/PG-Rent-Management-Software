'use client';

import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
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
      <div className="flex h-screen bg-slate-100 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center animate-pulse">
            <Building className="w-7 h-7 text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-500 tracking-wide">Loading PG Rent Manager...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
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
        <main className="flex-1 overflow-y-auto p-6">
          {/* ================= MODULE 1: DASHBOARD ================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Summary Cards Grid */}
              <div className="grid grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Total Expected Rent
                    </span>
                    <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                      {formatCurrency(dashboardData?.cards?.totalExpected || 0)}
                    </span>
                    <span className="text-xs text-slate-400 mt-0.5 block">
                      Month: {selectedRentMonth}
                    </span>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
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

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
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

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
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
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-800">Monthly Collection Progress ({selectedRentMonth})</span>
                  <span className="text-blue-600 font-bold text-base">
                    {formatCurrency(dashboardData?.cards?.totalCollected || 0)} /{' '}
                    {formatCurrency(dashboardData?.cards?.totalExpected || 0)} (
                    {dashboardData?.cards?.collectionPercentage || 0}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-3.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, dashboardData?.cards?.collectionPercentage || 0)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Overdue Action List & Today's Payments */}
              <div className="grid grid-cols-2 gap-6">
                {/* Overdue Tenants List */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                      <span>Overdue Tenants</span>
                    </h3>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full">
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
                          className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-xl flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">
                              {item.tenantName}
                            </span>
                            <span className="text-xs text-slate-600 block">
                              Room {item.roomNumber} • Phone: {item.phone}
                            </span>
                            <span className="text-xs text-rose-700 font-semibold block mt-0.5">
                              Due: {formatCurrency(item.remainingAmount)} (Due Date: {formatDate(item.dueDate)})
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
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
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-1"
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
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
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
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                      <span>Today's Collections</span>
                    </h3>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                      {dashboardData?.todayPayments?.length || 0} Payments Received
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 max-h-80 pr-1">
                    {dashboardData?.todayPayments?.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-8">
                        No payments recorded today yet.
                      </p>
                    ) : (
                      dashboardData?.todayPayments?.map((p: any) => (
                        <div
                          key={p.id}
                          className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">
                              {p.tenantName}
                            </span>
                            <span className="text-xs text-slate-600 block">
                              Room {p.roomNumber} • Receipt: {p.receiptNumber || 'N/A'}
                            </span>
                            <span className="text-xs text-slate-500 block">
                              Method: {p.method} • Time: {formatDateTime(p.time)}
                            </span>
                          </div>
                          <span className="font-extrabold text-emerald-700 text-base">
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
              {/* Filter Pills */}
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-2">
                  {['ACTIVE', 'NOTICE_PERIOD', 'CHECKED_OUT', 'ARCHIVED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setTenantStatusFilter(st)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        tenantStatusFilter === st
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsAddTenantOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Tenant</span>
                </button>
              </div>

              {/* Tenants Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-800 text-white font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Tenant Name</th>
                      <th className="p-3.5">Room / Bed</th>
                      <th className="p-3.5">Phone Number</th>
                      <th className="p-3.5">Monthly Rent</th>
                      <th className="p-3.5">Deposit</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {tenants.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          No tenants found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      tenants.map((t) => {
                        const badge = getTenantStatusBadge(t.status);
                        return (
                          <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3.5">
                              <span className="font-bold text-slate-900 block">{t.fullName}</span>
                              <span className="text-xs text-slate-500 block">
                                Joined: {formatDate(t.joiningDate)}
                              </span>
                            </td>
                            <td className="p-3.5 font-semibold text-slate-800">
                              Room {t.roomNumber} (Bed {t.bedNumber || 'A'})
                            </td>
                            <td className="p-3.5 text-slate-600">{t.phone}</td>
                            <td className="p-3.5 font-bold text-blue-900">
                              {formatCurrency(t.monthlyRent)}
                            </td>
                            <td className="p-3.5 text-slate-600">
                              {formatCurrency(t.depositAmount)}
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${badge.bg}`}
                              >
                                {badge.label}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => {
                                    setHistoryTenantId(t.id);
                                    setIsTenantHistoryOpen(true);
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                  title="View History"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedTenantForEdit(t);
                                    setIsEditTenantOpen(true);
                                  }}
                                  className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                                  title="Edit Tenant"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleArchiveTenant(t.id, t.fullName)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
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
          )}

          {/* ================= MODULE 3: RENT MANAGEMENT ================= */}
          {activeTab === 'rents' && (
            <div className="space-y-4">
              {/* Month Selector & Filter */}
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-bold text-slate-700 uppercase">Rent Month:</label>
                    <input
                      type="month"
                      value={selectedRentMonth}
                      onChange={(e) => setSelectedRentMonth(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg font-bold text-slate-800"
                    />
                  </div>

                  <div className="flex items-center space-x-1 border-l border-slate-200 pl-4">
                    {['', 'PAID', 'PARTIAL', 'OVERDUE', 'PENDING'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setRentStatusFilter(st)}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                          rentStatusFilter === st
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st || 'ALL'}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerateRents}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Auto Generate Monthly Rents</span>
                </button>
              </div>

              {/* Rents Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-800 text-white font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Tenant Name</th>
                      <th className="p-3.5">Room</th>
                      <th className="p-3.5">Rent Month</th>
                      <th className="p-3.5">Due Date</th>
                      <th className="p-3.5 text-right">Rent Billed</th>
                      <th className="p-3.5 text-right">Paid</th>
                      <th className="p-3.5 text-right">Remaining</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {rents.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-400">
                          No rent records found for {selectedRentMonth}.
                        </td>
                      </tr>
                    ) : (
                      rents.map((r) => {
                        const badge = getRentStatusBadge(r.status);
                        return (
                          <tr key={r.id} className="hover:bg-slate-50">
                            <td className="p-3.5 font-bold text-slate-900">{r.tenant?.fullName}</td>
                            <td className="p-3.5 font-semibold text-slate-700">Room {r.tenant?.roomNumber}</td>
                            <td className="p-3.5 font-medium text-slate-600">{r.rentMonth}</td>
                            <td className="p-3.5 text-slate-600">{formatDate(r.dueDate)}</td>
                            <td className="p-3.5 text-right font-bold text-slate-900">
                              {formatCurrency(r.amount)}
                            </td>
                            <td className="p-3.5 text-right font-bold text-emerald-700">
                              {formatCurrency(r.paidAmount)}
                            </td>
                            <td className="p-3.5 text-right font-bold text-rose-700">
                              {formatCurrency(r.remainingAmount)}
                            </td>
                            <td className="p-3.5 text-center">
                              <span
                                className={`inline-block px-2.5 py-1 text-xs rounded-full border ${badge.bg}`}
                              >
                                {badge.label}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                {r.status !== 'PAID' && r.status !== 'WAIVED' && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setPaymentPreselectTenantId(r.tenantId);
                                        setPaymentPreselectRentId(r.id);
                                        setIsRecordPaymentOpen(true);
                                      }}
                                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
                                    >
                                      Record Pay
                                    </button>
                                    <button
                                      onClick={() => {
                                        setWhatsAppTenant(r.tenant);
                                        setWhatsAppRent(r);
                                        setIsWhatsAppModalOpen(true);
                                      }}
                                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                                    >
                                      WhatsApp
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
          )}

          {/* ================= MODULE 4: PAYMENTS & RECEIPTS ================= */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 text-sm">Payment Transaction History</span>
                <button
                  onClick={() => {
                    setPaymentPreselectTenantId('');
                    setPaymentPreselectRentId('');
                    setIsRecordPaymentOpen(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-2 shadow-xs"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Record New Payment</span>
                </button>
              </div>

              {/* Payments Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-800 text-white font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Receipt #</th>
                      <th className="p-3.5">Tenant Name</th>
                      <th className="p-3.5">Room</th>
                      <th className="p-3.5">Rent Month</th>
                      <th className="p-3.5">Payment Date</th>
                      <th className="p-3.5">Method</th>
                      <th className="p-3.5">Reference No.</th>
                      <th className="p-3.5 text-right">Amount Paid</th>
                      <th className="p-3.5 text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-400">
                          No payment transactions recorded.
                        </td>
                      </tr>
                    ) : (
                      payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-3.5 font-bold text-blue-600">
                            {p.receipt?.receiptNumber || 'N/A'}
                          </td>
                          <td className="p-3.5 font-bold text-slate-900">{p.tenant?.fullName}</td>
                          <td className="p-3.5 font-semibold text-slate-700">Room {p.tenant?.roomNumber}</td>
                          <td className="p-3.5 font-medium text-slate-600">{p.rent?.rentMonth}</td>
                          <td className="p-3.5 text-slate-600">{formatDate(p.paymentDate)}</td>
                          <td className="p-3.5 font-medium text-slate-700">{p.paymentMethod}</td>
                          <td className="p-3.5 text-slate-500">{p.referenceNumber || 'N/A'}</td>
                          <td className="p-3.5 text-right font-extrabold text-emerald-700">
                            {formatCurrency(p.amount)}
                          </td>
                          <td className="p-3.5 text-center">
                            {p.receipt && (
                              <button
                                onClick={() => {
                                  setSelectedReceipt(p.receipt);
                                  setIsReceiptViewerOpen(true);
                                }}
                                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center space-x-1 mx-auto"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Receipt</span>
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
          )}

          {/* ================= MODULE 5: RENT CALENDAR ================= */}
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              {/* Calendar Controls */}
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-800 text-base">
                    Rent & Payment Activity Calendar ({selectedRentMonth})
                  </h3>
                </div>
                <input
                  type="month"
                  value={selectedRentMonth}
                  onChange={(e) => setSelectedRentMonth(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg font-bold text-slate-800"
                />
              </div>

              {/* Month Daily Grid */}
              <div className="grid grid-cols-7 gap-3">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="text-center font-bold text-xs uppercase text-slate-500 py-1">
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
                        className={`p-3 bg-white border rounded-xl cursor-pointer min-h-[90px] flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm text-slate-800">
                            {day.date.split('-')[2]}
                          </span>
                          {hasPayments && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          )}
                        </div>

                        <div className="space-y-1 text-[11px]">
                          {hasPayments && (
                            <div className="text-emerald-700 font-bold">
                              +{formatCurrency(day.totalCollected)}
                            </div>
                          )}
                          {hasDues && (
                            <div className="text-amber-700 font-semibold">
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
                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                  <h4 className="font-bold text-slate-900 text-base">
                    Activity Details for Date: {formatDate(selectedCalendarDate)}
                  </h4>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Payments Received on Date */}
                    <div>
                      <h5 className="font-bold text-xs uppercase text-slate-500 mb-2">
                        Payments Received ({calendarMonthData.dailyData[selectedCalendarDate].payments.length})
                      </h5>
                      <div className="space-y-2">
                        {calendarMonthData.dailyData[selectedCalendarDate].payments.length === 0 ? (
                          <p className="text-xs text-slate-400">No payments received on this date.</p>
                        ) : (
                          calendarMonthData.dailyData[selectedCalendarDate].payments.map((p: any) => (
                            <div
                              key={p.id}
                              className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex justify-between items-center text-xs"
                            >
                              <div>
                                <span className="font-bold text-slate-900 block">{p.tenantName}</span>
                                <span className="text-slate-600">Room {p.roomNumber} • {p.paymentMethod}</span>
                              </div>
                              <span className="font-extrabold text-emerald-800 text-sm">
                                {formatCurrency(p.amount)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Rents Due on Date */}
                    <div>
                      <h5 className="font-bold text-xs uppercase text-slate-500 mb-2">
                        Rents Due on Date ({calendarMonthData.dailyData[selectedCalendarDate].rentsDue.length})
                      </h5>
                      <div className="space-y-2">
                        {calendarMonthData.dailyData[selectedCalendarDate].rentsDue.length === 0 ? (
                          <p className="text-xs text-slate-400">No rents due on this date.</p>
                        ) : (
                          calendarMonthData.dailyData[selectedCalendarDate].rentsDue.map((r: any) => (
                            <div
                              key={r.id}
                              className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-xs"
                            >
                              <div>
                                <span className="font-bold text-slate-900 block">{r.tenantName}</span>
                                <span className="text-slate-600">Room {r.roomNumber}</span>
                              </div>
                              <span className="font-bold text-slate-900">
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
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">WhatsApp Message Templates</h3>
                    <p className="text-xs text-slate-500">
                      Editable text templates with automatic variable substitution.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {templates.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-sm text-slate-900">{tmpl.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                            {tmpl.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-mono leading-relaxed line-clamp-3">
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
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-200 font-bold text-sm text-slate-800">
                  Recent WhatsApp Message History Log
                </div>

                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-800 text-white font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Sent Timestamp</th>
                      <th className="p-3.5">Tenant Name</th>
                      <th className="p-3.5">Phone</th>
                      <th className="p-3.5">Template</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Message Text</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {whatsappLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          No WhatsApp messages logged yet.
                        </td>
                      </tr>
                    ) : (
                      whatsappLogs.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="p-3.5 text-xs text-slate-600">{formatDateTime(m.sentAt)}</td>
                          <td className="p-3.5 font-bold text-slate-900">{m.tenant?.fullName}</td>
                          <td className="p-3.5 text-slate-600">{m.phone}</td>
                          <td className="p-3.5 font-medium text-slate-700">{m.templateName}</td>
                          <td className="p-3.5">
                            <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                              {m.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-xs text-slate-700 max-w-xs truncate">
                            {m.messageBody}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= MODULE 7: REPORTS ================= */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              {/* Reports Control Tabs */}
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setReportType('monthly')}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg ${
                      reportType === 'monthly'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Monthly Rent Report
                  </button>
                  <button
                    onClick={() => setReportType('daily')}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg ${
                      reportType === 'daily'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Daily Collection Report
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <a
                    href={`${api.defaults.baseURL}/reports/${reportType}/csv?rentMonth=${selectedRentMonth}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-2 shadow-xs"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Export CSV</span>
                  </a>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 flex items-center space-x-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Report</span>
                  </button>
                </div>
              </div>

              {/* Monthly Report View */}
              {reportType === 'monthly' && reportsData && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Monthly Rent Financial Report ({reportsData.rentMonth})
                      </h3>
                      <p className="text-xs text-slate-500">Property: {propertyInfo?.name}</p>
                    </div>
                    <div className="flex space-x-4 text-xs">
                      <div>
                        <span className="text-slate-500 block">Total Expected</span>
                        <span className="font-extrabold text-slate-900 text-sm">
                          {formatCurrency(reportsData.totals?.totalExpected || 0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Total Collected</span>
                        <span className="font-extrabold text-emerald-700 text-sm">
                          {formatCurrency(reportsData.totals?.totalCollected || 0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Total Pending</span>
                        <span className="font-extrabold text-rose-700 text-sm">
                          {formatCurrency(reportsData.totals?.totalPending || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-800 text-white font-semibold uppercase">
                      <tr>
                        <th className="p-3">Tenant</th>
                        <th className="p-3">Room</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3 text-right">Rent Billed</th>
                        <th className="p-3 text-right">Paid</th>
                        <th className="p-3 text-right">Remaining</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {reportsData.rows?.map((r: any) => (
                        <tr key={r.tenantId} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{r.tenantName}</td>
                          <td className="p-3">Room {r.roomNumber}</td>
                          <td className="p-3 text-slate-600">{r.phone}</td>
                          <td className="p-3 text-right font-semibold">{formatCurrency(r.amount)}</td>
                          <td className="p-3 text-right font-bold text-emerald-700">
                            {formatCurrency(r.paidAmount)}
                          </td>
                          <td className="p-3 text-right font-bold text-rose-700">
                            {formatCurrency(r.remainingAmount)}
                          </td>
                          <td className="p-3 text-center font-bold">{r.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ================= MODULE 8: SETTINGS & BACKUP ================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl">
              {/* PG Information Form */}
              <form
                onSubmit={handleSavePropertyInfo}
                className="bg-white p-6 rounded-xl border border-slate-200 space-y-4"
              >
                <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  <span>PG Property Configuration</span>
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      PG / Hostel Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={propertyInfo?.name || ''}
                      onChange={(e) => setPropertyInfo({ ...propertyInfo, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={propertyInfo?.phone || ''}
                      onChange={(e) => setPropertyInfo({ ...propertyInfo, phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={propertyInfo?.address || ''}
                    onChange={(e) => setPropertyInfo({ ...propertyInfo, address: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                  >
                    Save Property Info
                  </button>
                </div>
              </form>

              {/* Database Backup & Restore */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Database Backup & Restore</span>
                </h3>

                <p className="text-xs text-slate-600">
                  Export complete application data to a JSON backup file or restore from a previous backup file.
                </p>

                <div className="flex items-center space-x-4">
                  <a
                    href={`${api.defaults.baseURL}/settings/backup`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center space-x-2 shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Database Backup (JSON)</span>
                  </a>
                </div>

                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">
                    Restore Data from Backup (Paste JSON)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Paste JSON backup content here..."
                    value={restoreJson}
                    onChange={(e) => setRestoreJson(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleRestoreBackup}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm"
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
    </div>
  );
}
