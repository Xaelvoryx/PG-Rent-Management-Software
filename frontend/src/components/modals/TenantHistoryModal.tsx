import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../lib/api';
import { formatCurrency, formatDate, getRentStatusBadge } from '../../lib/utils';
import { ReceiptText, CreditCard, Phone, User, Calendar } from 'lucide-react';

interface TenantHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
}

export const TenantHistoryModal: React.FC<TenantHistoryModalProps> = ({
  isOpen,
  onClose,
  tenantId,
}) => {
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && tenantId) {
      loadHistory(tenantId);
    }
  }, [isOpen, tenantId]);

  const loadHistory = async (id: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/tenants/${id}/history`);
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tenant Financial & Rent History" maxWidth="max-w-3xl">
      {loading || !history ? (
        <div className="p-8 text-center text-slate-500 font-medium">Loading history...</div>
      ) : (
        <div className="space-y-6">
          {/* Tenant Header Info */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block uppercase font-semibold">Tenant Name</span>
              <span className="font-bold text-slate-900 text-sm">{history.tenant?.fullName}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-semibold">Room & Bed</span>
              <span className="font-bold text-slate-900 text-sm">
                Room {history.tenant?.roomNumber}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-semibold">Joining Date</span>
              <span className="font-medium text-slate-800">{formatDate(history.tenant?.joiningDate)}</span>
            </div>
          </div>

          {/* Rents History Table */}
          <div>
            <h4 className="font-bold text-sm text-slate-800 mb-2 flex items-center space-x-2">
              <ReceiptText className="w-4 h-4 text-blue-600" />
              <span>Monthly Rent Records</span>
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Month</th>
                    <th className="p-2.5">Due Date</th>
                    <th className="p-2.5 text-right">Rent Amount</th>
                    <th className="p-2.5 text-right">Paid</th>
                    <th className="p-2.5 text-right">Remaining</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {history.rents?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400">
                        No rent records found
                      </td>
                    </tr>
                  ) : (
                    history.rents?.map((r: any) => {
                      const badge = getRentStatusBadge(r.status);
                      return (
                        <tr key={r.id}>
                          <td className="p-2.5 font-bold text-slate-800">{r.rentMonth}</td>
                          <td className="p-2.5 text-slate-600">{formatDate(r.dueDate)}</td>
                          <td className="p-2.5 text-right font-semibold">{formatCurrency(r.amount)}</td>
                          <td className="p-2.5 text-right text-emerald-700 font-semibold">
                            {formatCurrency(r.paidAmount)}
                          </td>
                          <td className="p-2.5 text-right text-rose-700 font-semibold">
                            {formatCurrency(r.remainingAmount)}
                          </td>
                          <td className="p-2.5 text-center">
                            <span className={`inline-block px-2 py-0.5 text-[10px] rounded-full border ${badge.bg}`}>
                              {badge.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payments History Table */}
          <div>
            <h4 className="font-bold text-sm text-slate-800 mb-2 flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Payment Transactions</span>
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Receipt #</th>
                    <th className="p-2.5">Method</th>
                    <th className="p-2.5">Reference</th>
                    <th className="p-2.5 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {history.payments?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-400">
                        No payments recorded yet
                      </td>
                    </tr>
                  ) : (
                    history.payments?.map((p: any) => (
                      <tr key={p.id}>
                        <td className="p-2.5 font-medium text-slate-800">{formatDate(p.paymentDate)}</td>
                        <td className="p-2.5 text-blue-600 font-bold">{p.receipt?.receiptNumber || 'N/A'}</td>
                        <td className="p-2.5 text-slate-600">{p.paymentMethod}</td>
                        <td className="p-2.5 text-slate-500">{p.referenceNumber || 'N/A'}</td>
                        <td className="p-2.5 text-right font-bold text-emerald-700">{formatCurrency(p.amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
