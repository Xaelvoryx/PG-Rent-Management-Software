import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../lib/api';
import { formatCurrency } from '../../lib/utils';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentData: any) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  preselectedTenantId?: string;
  preselectedRentId?: string;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  showToast,
  preselectedTenantId,
  preselectedRentId,
}) => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState(preselectedTenantId || '');
  const [tenantRents, setTenantRents] = useState<any[]>([]);
  const [selectedRentId, setSelectedRentId] = useState(preselectedRentId || '');
  const [selectedRent, setSelectedRent] = useState<any>(null);

  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadActiveTenants();
    }
  }, [isOpen]);

  useEffect(() => {
    if (preselectedTenantId) {
      setSelectedTenantId(preselectedTenantId);
    }
  }, [preselectedTenantId]);

  useEffect(() => {
    if (preselectedRentId) {
      setSelectedRentId(preselectedRentId);
    }
  }, [preselectedRentId]);

  const loadActiveTenants = async () => {
    try {
      const res = await api.get('/tenants?limit=100');
      setTenants(res.data.data || []);
      if (!selectedTenantId && res.data.data?.length > 0) {
        setSelectedTenantId(res.data.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedTenantId) {
      loadTenantRents(selectedTenantId);
    }
  }, [selectedTenantId]);

  const loadTenantRents = async (tenantId: string) => {
    try {
      const res = await api.get(`/rents?tenantId=${tenantId}`);
      const rents = res.data.data || [];
      setTenantRents(rents);

      // Default to first pending/partial/overdue rent
      const unpaid = rents.find((r: any) => r.status !== 'PAID' && r.status !== 'WAIVED') || rents[0];
      if (unpaid) {
        setSelectedRentId(unpaid.id);
        setSelectedRent(unpaid);
        setAmount(String(unpaid.remainingAmount));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRentChange = (rentId: string) => {
    setSelectedRentId(rentId);
    const found = tenantRents.find((r) => r.id === rentId);
    if (found) {
      setSelectedRent(found);
      setAmount(String(found.remainingAmount));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId || !selectedRentId || !amount) {
      showToast('Please select tenant, rent month and payment amount', 'error');
      return;
    }

    const payNum = parseFloat(amount);
    if (isNaN(payNum) || payNum <= 0) {
      showToast('Payment amount must be greater than zero', 'error');
      return;
    }

    if (selectedRent && payNum > Number(selectedRent.remainingAmount) + 0.01) {
      showToast(
        `Payment amount (${formatCurrency(payNum)}) cannot exceed remaining rent (${formatCurrency(selectedRent.remainingAmount)})`,
        'error',
      );
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/payments', {
        tenantId: selectedTenantId,
        rentId: selectedRentId,
        amount: payNum,
        paymentDate,
        paymentMethod,
        referenceNumber: referenceNumber || undefined,
        notes: notes || undefined,
      });

      const rentStatus = res.data.rentStatus;
      showToast(
        `Payment of ${formatCurrency(payNum)} recorded successfully! Rent status: ${rentStatus}`,
        'success',
      );
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to record payment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Rent Payment" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Select Tenant */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Select Tenant *
          </label>
          <select
            id="select-payment-tenant"
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.fullName} (Room {t.roomNumber}) — Rent: {formatCurrency(t.monthlyRent)}
              </option>
            ))}
          </select>
        </div>

        {/* Select Rent Record */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Rent Month *
          </label>
          <select
            id="select-payment-rent"
            value={selectedRentId}
            onChange={(e) => handleRentChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {tenantRents.map((r) => (
              <option key={r.id} value={r.id}>
                {r.rentMonth} — Total: {formatCurrency(r.amount)} | Remaining Due:{' '}
                {formatCurrency(r.remainingAmount)} ({r.status})
              </option>
            ))}
          </select>
        </div>

        {/* Rent Summary Box */}
        {selectedRent && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 text-slate-700">
            <div className="flex justify-between">
              <span>Monthly Rent Billed:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(selectedRent.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Already Paid:</span>
              <span className="font-semibold text-emerald-700">{formatCurrency(selectedRent.paidAmount)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 font-bold">
              <span>Remaining Amount Due:</span>
              <span className="text-rose-700">{formatCurrency(selectedRent.remainingAmount)}</span>
            </div>
          </div>
        )}

        {/* Payment Amount & Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Payment Amount (₹) *
            </label>
            <input
              id="input-payment-amount"
              type="number"
              step="100"
              required
              placeholder="e.g. 8500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-emerald-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Payment Date *
            </label>
            <input
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Payment Method & Reference */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Payment Method *
            </label>
            <select
              id="select-payment-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
            >
              <option value="UPI">UPI / GPay / PhonePe</option>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
              <option value="CARD">Credit / Debit Card</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Ref / UTR / Receipt No
            </label>
            <input
              type="text"
              placeholder="e.g. UPI/129301923"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Notes</label>
          <input
            type="text"
            placeholder="Payment note..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-lg"
          >
            Cancel
          </button>
          <button
            id="btn-submit-payment"
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm disabled:opacity-50"
          >
            {submitting ? 'Recording...' : 'Record Payment & Generate Receipt'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
