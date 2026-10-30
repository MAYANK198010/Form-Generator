import React from 'react';
import { X, Palette, Check, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Form, ThemeAccent } from '../types/form';

interface ThemeModalProps {
  form: Form;
  isOpen: boolean;
  onClose: () => void;
  onUpdateForm: (updated: Form) => void;
}

const ACCENT_OPTIONS: Array<{ key: ThemeAccent; label: string; bgClass: string }> = [
  { key: 'indigo', label: 'Indigo', bgClass: 'bg-indigo-600' },
  { key: 'emerald', label: 'Emerald', bgClass: 'bg-emerald-600' },
  { key: 'violet', label: 'Violet', bgClass: 'bg-violet-600' },
  { key: 'amber', label: 'Amber', bgClass: 'bg-amber-500' },
  { key: 'rose', label: 'Rose', bgClass: 'bg-rose-600' },
  { key: 'cyan', label: 'Cyan', bgClass: 'bg-cyan-600' },
  { key: 'slate', label: 'Minimal Slate', bgClass: 'bg-slate-800' },
];

const BANNER_PRESETS = [
  {
    name: 'Modern Abstract',
    url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Tech & Architecture',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Conference & Workshop',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Minimal Gradient',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  },
];

export const ThemeModal: React.FC<ThemeModalProps> = ({
  form,
  isOpen,
  onClose,
  onUpdateForm,
}) => {
  if (!isOpen) return null;

  const updateTheme = (patch: Partial<Form['theme']>) => {
    onUpdateForm({
      ...form,
      theme: { ...form.theme, ...patch },
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Form Styling & Theme</h3>
              <p className="text-xs text-slate-500">Customize brand colors and header banner</p>
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
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Accent Color */}
          <div className="space-y-2">
            <label className="font-bold text-slate-900 text-xs">Theme Accent Color</label>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {ACCENT_OPTIONS.map((opt) => {
                const isSelected = form.theme.accentColor === opt.key;
                return (
                  <button
                    type="button"
                    key={opt.key}
                    onClick={() => updateTheme({ accentColor: opt.key })}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${opt.bgClass}`} />
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Banner Presets */}
          <div className="space-y-2">
            <label className="font-bold text-slate-900 text-xs">Header Banner Image</label>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {BANNER_PRESETS.map((preset) => {
                const isSelected = form.theme.headerBanner === preset.url;
                return (
                  <button
                    type="button"
                    key={preset.name}
                    onClick={() => updateTheme({ headerBanner: preset.url })}
                    className={`relative rounded-xl overflow-hidden border h-20 text-left transition-all group ${
                      isSelected ? 'ring-2 ring-indigo-600 border-indigo-600' : 'border-slate-200'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 p-2 flex flex-col justify-end text-white text-[11px] font-semibold">
                      <span>{preset.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {form.theme.headerBanner && (
              <button
                type="button"
                onClick={() => {
                  const updatedTheme = { ...form.theme };
                  delete updatedTheme.headerBanner;
                  onUpdateForm({
                    ...form,
                    theme: updatedTheme,
                    updatedAt: new Date().toISOString(),
                  });
                }}
                className="text-xs text-rose-600 hover:underline pt-1 block"
              >
                Remove Header Banner
              </button>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">Show Progress Bar</span>
                <p className="text-[11px] text-slate-500">Displays completion % at top of survey</p>
              </div>
              <input
                type="checkbox"
                checked={form.theme.showProgressBar}
                onChange={(e) => updateTheme({ showProgressBar: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
          >
            Apply Styling
          </button>
        </div>
      </div>
    </div>
  );
};
