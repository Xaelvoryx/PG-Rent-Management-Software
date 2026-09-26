import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../lib/api';

interface EditTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: any;
  onSuccess: (updated: any) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const EditTenantModal: React.FC<EditTenantModalProps> = ({
  isOpen,
  onClose,
  tenant,
  onSuccess,
  showToast,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [email, setEmail] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [bedNumber, setBedNumber] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (tenant) {
      setFullName(tenant.fullName || '');
      setPhone(tenant.phone || '');
      setAlternatePhone(tenant.alternatePhone || '');
      setEmail(tenant.email || '');
      setRoomNumber(tenant.roomNumber || '');
      setBedNumber(tenant.bedNumber || 'A');
      setMonthlyRent(String(tenant.monthlyRent || ''));
      setDepositAmount(String(tenant.depositAmount || ''));
      setStatus(tenant.status || 'ACTIVE');
      setNotes(tenant.notes || '');
    }
  }, [tenant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;

    try {
      setSubmitting(true);
      const res = await api.patch(`/tenants/${tenant.id}`, {
        fullName,
        phone,
        alternatePhone: alternatePhone || undefined,
        email: email || undefined,
        roomNumber,
        bedNumber: bedNumber || undefined,
        monthlyRent: parseFloat(monthlyRent),
        depositAmount: parseFloat(depositAmount || '0'),
        status,
        notes: notes || undefined,
      });

      showToast(`Tenant "${fullName}" updated successfully!`, 'success');
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update tenant', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!tenant) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Tenant: ${tenant.fullName}`} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Room Number *
            </label>
            <input
              type="text"
              required
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Bed Number
            </label>
            <input
              type="text"
              value={bedNumber}
              onChange={(e) => setBedNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Tenant Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
            >
              <option value="ACTIVE">Active</option>
              <option value="NOTICE_PERIOD">Notice Period</option>
              <option value="CHECKED_OUT">Checked Out</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Monthly Rent (₹) *
            </label>
            <input
              type="number"
              step="100"
              required
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Deposit Amount (₹)
            </label>
            <input
              type="number"
              step="500"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
          />
        </div>

        <div className="flex items-center justify-end space-x-3 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Update Details'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
