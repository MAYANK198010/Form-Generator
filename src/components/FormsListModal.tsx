import React from 'react';
import {
  X,
  Plus,
  FileText,
  Copy,
  Trash2,
  Calendar,
  Sparkles,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Form } from '../types/form';

interface FormsListModalProps {
  forms: Form[];
  currentFormId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectForm: (formId: string) => void;
  onCreateNew: () => void;
  onDuplicateForm: (formId: string) => void;
  onDeleteForm: (formId: string) => void;
  onSelectTemplate: (templateType: 'csat' | 'event' | 'product' | 'blank') => void;
}

export const FormsListModal: React.FC<FormsListModalProps> = ({
  forms,
  currentFormId,
  isOpen,
  onClose,
  onSelectForm,
  onCreateNew,
  onDuplicateForm,
  onDeleteForm,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Your Surveys & Templates</h3>
              <p className="text-xs text-slate-500">Manage existing forms or spin up from ready templates</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Quick Starter Templates */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
                Start with a Template
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onSelectTemplate('blank');
                  onClose();
                }}
                className="p-3.5 rounded-xl border border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/40 text-left transition-all group flex flex-col justify-between h-24"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-600 flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="font-bold text-slate-800 text-xs">Blank Form</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTemplate('csat');
                  onClose();
                }}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-left transition-all group flex flex-col justify-between h-24"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-xs">CSAT & NPS</div>
                  <div className="text-[10px] text-slate-500">8 questions</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTemplate('event');
                  onClose();
                }}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all group flex flex-col justify-between h-24"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-xs">Event RSVP</div>
                  <div className="text-[10px] text-slate-500">5 questions</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTemplate('product');
                  onClose();
                }}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/40 text-left transition-all group flex flex-col justify-between h-24"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-xs">Product Pulse</div>
                  <div className="text-[10px] text-slate-500">6 questions</div>
                </div>
              </button>
            </div>
          </div>

          {/* List of Existing Forms */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
              Your Saved Surveys ({forms.length})
            </h4>

            <div className="space-y-2">
              {forms.map((f) => {
                const isActive = f.id === currentFormId;
                return (
                  <div
                    key={f.id}
                    onClick={() => {
                      onSelectForm(f.id);
                      onClose();
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isActive
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm truncate">
                          {f.title}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>{f.fields.length} questions</span>
                        <span>•</span>
                        <span className="font-mono text-indigo-600">
                          form.ecast.store/s/{f.settings.customSlug}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onDuplicateForm(f.id)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Duplicate survey"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {forms.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteForm(f.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete survey"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <span className="text-slate-500 text-[11px]">Surveys stored in local storage</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
