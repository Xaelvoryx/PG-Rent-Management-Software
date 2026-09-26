import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../lib/api';

interface TemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: any;
  onSuccess: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({
  isOpen,
  onClose,
  template,
  onSuccess,
  showToast,
}) => {
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (template) {
      setContent(template.content || '');
      setName(template.name || '');
    }
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template || !content) return;

    try {
      setSubmitting(true);
      await api.patch(`/whatsapp/templates/${template.type}`, {
        content,
        name,
      });

      showToast(`Template "${name}" updated successfully!`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update template', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!template) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit WhatsApp Template: ${template.name}`} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Template Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Template Content (Variables supported)
          </label>
          <textarea
            rows={5}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-xs leading-relaxed"
          />
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
          <span className="font-bold text-slate-800 block">Available Dynamic Variables:</span>
          <div className="flex flex-wrap gap-1 text-[11px] font-mono text-blue-700">
            <span>{"{{tenantName}}"}</span> • <span>{"{{amount}}"}</span> • <span>{"{{dueDate}}"}</span> • <span>{"{{daysOverdue}}"}</span> • <span>{"{{rentMonth}}"}</span> • <span>{"{{receiptNumber}}"}</span> • <span>{"{{remainingAmount}}"}</span> • <span>{"{{pgName}}"}</span>
          </div>
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
            {submitting ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
