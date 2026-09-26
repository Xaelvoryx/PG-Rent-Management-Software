import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../lib/api';
import { MessageSquare, Send, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface WhatsAppPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: any;
  rent?: any;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const WhatsAppPreviewModal: React.FC<WhatsAppPreviewModalProps> = ({
  isOpen,
  onClose,
  tenant,
  rent,
  showToast,
}) => {
  const [templateType, setTemplateType] = useState('DUE_REMINDER');
  const [templates, setTemplates] = useState<any[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      // Auto pick OVERDUE_REMINDER if status is OVERDUE
      if (rent?.status === 'OVERDUE') {
        setTemplateType('OVERDUE_REMINDER');
      } else {
        setTemplateType('DUE_REMINDER');
      }
    }
  }, [isOpen, rent]);

  const loadTemplates = async () => {
    try {
      const res = await api.get('/whatsapp/templates');
      setTemplates(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (templates.length > 0) {
      const tmpl = templates.find((t) => t.type === templateType);
      if (tmpl) {
        renderPreview(tmpl.content);
      }
    }
  }, [templateType, templates, customMessage, tenant, rent]);

  const renderPreview = (content: string) => {
    let text = content;
    const amountVal = rent ? (rent.remainingAmount > 0 ? rent.remainingAmount : rent.amount) : tenant?.monthlyRent || 0;
    const replacements: Record<string, string> = {
      tenantName: tenant?.fullName || 'Tenant',
      amount: `₹${Number(amountVal).toLocaleString('en-IN')}`,
      dueDate: rent?.dueDate ? new Date(rent.dueDate).toLocaleDateString('en-IN') : '1st of month',
      daysOverdue: rent ? '3' : '0',
      rentMonth: rent?.rentMonth || 'Current Month',
      receiptNumber: 'PG-2026-000001',
      remainingAmount: `₹${Number(rent?.remainingAmount || 0).toLocaleString('en-IN')}`,
      pgName: 'Sunshine Luxury PG',
      checkoutDate: tenant?.expectedCheckoutDate ? new Date(tenant.expectedCheckoutDate).toLocaleDateString('en-IN') : 'N/A',
      customMessage: customMessage || '[Custom text]',
    };

    for (const [k, v] of Object.entries(replacements)) {
      const regex = new RegExp(`{{\\s*${k}\\s*}}`, 'g');
      text = text.replace(regex, v);
    }
    setPreviewText(text);
  };

  const handleSend = async () => {
    if (!tenant) return;
    try {
      setSending(true);
      const res = await api.post('/whatsapp/send', {
        tenantId: tenant.id,
        templateType,
        rentId: rent?.id,
        customMessage: customMessage || undefined,
      });

      showToast(`WhatsApp reminder sent to ${tenant.fullName}! (${res.data.mode} mode)`, 'success');
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to send WhatsApp message', 'error');
    } finally {
      setSending(false);
    }
  };

  if (!tenant) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="WhatsApp Reminder Workflow" maxWidth="max-w-lg">
      <div className="space-y-4">
        {/* Recipient Details Banner */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 uppercase block font-semibold">Recipient</span>
            <span className="font-bold text-slate-900 text-sm">{tenant.fullName}</span>
            <span className="text-slate-500 block">{tenant.phone} • Room {tenant.roomNumber}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 uppercase block font-semibold">Rent Status</span>
            <span className="inline-block px-2.5 py-0.5 bg-rose-100 text-rose-800 font-bold rounded-full">
              {rent?.status || 'PENDING'}
            </span>
          </div>
        </div>

        {/* Select Message Template */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Select Message Template *
          </label>
          <select
            id="select-whatsapp-template"
            value={templateType}
            onChange={(e) => setTemplateType(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {templates.map((t) => (
              <option key={t.id} value={t.type}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {templateType === 'MANUAL' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Custom Message Text
            </label>
            <textarea
              rows={2}
              placeholder="Enter custom announcement text..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            />
          </div>
        )}

        {/* WhatsApp Message Preview Box */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center space-x-1">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Message Body Preview</span>
          </label>
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-slate-900 text-sm font-normal leading-relaxed relative font-sans shadow-inner">
            <p className="whitespace-pre-line">{previewText}</p>
            <div className="mt-2 text-[10px] text-emerald-700 text-right font-medium">
              Simulated WhatsApp Message • Ready to Dispatch
            </div>
          </div>
        </div>

        {/* Duplicate Safeguard Banner */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center space-x-2 text-xs text-blue-900">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Duplicate Safeguard Active: Prevents sending identical messages within 12 hours.</span>
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
            id="btn-confirm-send-whatsapp"
            onClick={handleSend}
            disabled={sending}
            className="flex items-center space-x-2 px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{sending ? 'Sending...' : 'Send WhatsApp Reminder'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
