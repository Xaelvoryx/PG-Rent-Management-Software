import React from 'react';
import { Modal } from '../ui/Modal';
import { Printer, Download, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import api from '../../lib/api';

interface ReceiptViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: any;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  isOpen,
  onClose,
  receiptData,
}) => {
  if (!receiptData) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const url = `${api.defaults.baseURL}/receipts/${receiptData.id}/pdf`;
    window.open(url, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Receipt" maxWidth="max-w-xl">
      <div className="space-y-6">
        {/* Printable Receipt Layout */}
        <div id="printable-receipt" className="border border-slate-300 rounded-xl p-6 bg-white shadow-sm space-y-5">
          {/* Receipt Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {receiptData.pgName || 'Sunshine PG & Hostel'}
              </h2>
              <p className="text-xs text-slate-500">Rent Payment Receipt</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-300">
                {receiptData.receiptNumber || 'PG-2026-000001'}
              </span>
              <p className="text-xs text-slate-500 mt-1">
                Date: {formatDate(receiptData.paymentDate || receiptData.createdAt)}
              </p>
            </div>
          </div>

          {/* Tenant Details */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 uppercase block font-semibold">Tenant Name</span>
              <span className="font-bold text-slate-900 text-sm">{receiptData.tenant?.fullName || receiptData.tenantName}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase block font-semibold">Room & Bed</span>
              <span className="font-bold text-slate-900 text-sm">
                Room {receiptData.tenant?.roomNumber || '101'} (Bed {receiptData.tenant?.bedNumber || 'A'})
              </span>
            </div>
            <div>
              <span className="text-slate-500 uppercase block font-semibold">Phone Number</span>
              <span className="font-medium text-slate-800">{receiptData.tenant?.phone || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase block font-semibold">Rent Month</span>
              <span className="font-medium text-slate-800">{receiptData.rent?.rentMonth || 'Current Month'}</span>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-800 text-white font-semibold">
                <tr>
                  <th className="p-2.5">Description</th>
                  <th className="p-2.5">Payment Method</th>
                  <th className="p-2.5 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2.5 font-medium text-slate-800">
                    Rent Payment ({receiptData.rent?.rentMonth || 'Current Month'})
                  </td>
                  <td className="p-2.5 text-slate-600">{receiptData.paymentMethod}</td>
                  <td className="p-2.5 text-right font-bold text-emerald-700 text-sm">
                    {formatCurrency(receiptData.amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Balance Summary */}
          <div className="flex justify-end pt-2">
            <div className="w-64 bg-slate-100 p-3 rounded-lg border border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Amount Billed:</span>
                <span>{formatCurrency(receiptData.rent?.amount || receiptData.amount)}</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-medium">
                <span>Amount Paid:</span>
                <span>{formatCurrency(receiptData.amount)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-300 font-bold text-sm">
                <span className="text-slate-900">Remaining Balance:</span>
                <span className={Number(receiptData.remainingAmount) > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                  {formatCurrency(receiptData.remainingAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer & Signature */}
          <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
            <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Verified Payment Transaction</span>
            </div>
            <div className="text-center">
              <div className="w-32 border-b border-slate-400 mb-1"></div>
              <span>Authorized Signature</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between no-print pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-lg"
          >
            Close
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg border border-slate-300"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
