import React from 'react';
import {
  GripVertical,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  X,
  Star,
  CircleDot,
  CheckSquare,
  HelpCircle
} from 'lucide-react';
import { FormField, FieldType } from '../types/form';
import { FIELD_PALETTE_ITEMS } from './FieldPalette';

interface FieldEditorProps {
  field: FormField;
  index: number;
  totalFields: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updated: FormField) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  // Drag and drop ordering
  onDragStartQuestion: (e: React.DragEvent, index: number) => void;
  onDragOverQuestion: (e: React.DragEvent, index: number) => void;
  onDropQuestion: (e: React.DragEvent, index: number) => void;
}

export const FieldEditor: React.FC<FieldEditorProps> = ({
  field,
  index,
  totalFields,
  isSelected,
  onSelect,
  onUpdate,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDragStartQuestion,
  onDragOverQuestion,
  onDropQuestion,
}) => {
  const currentPaletteMeta = FIELD_PALETTE_ITEMS.find((item) => item.type === field.type);
  const Icon = currentPaletteMeta?.icon || CircleDot;

  const handleOptionChange = (optIdx: number, newText: string) => {
    const nextOptions = [...(field.options || [])];
    nextOptions[optIdx] = newText;
    onUpdate({ ...field, options: nextOptions });
  };

  const handleAddOption = () => {
    const nextOptions = [...(field.options || [])];
    nextOptions.push(`Option ${nextOptions.length + 1}`);
    onUpdate({ ...field, options: nextOptions });
  };

  const handleRemoveOption = (optIdx: number) => {
    const nextOptions = (field.options || []).filter((_, i) => i !== optIdx);
    onUpdate({ ...field, options: nextOptions });
  };

  return (
    <div
      onClick={onSelect}
      onDragOver={(e) => onDragOverQuestion(e, index)}
      onDrop={(e) => onDropQuestion(e, index)}
      className={`group relative bg-white rounded-2xl transition-all duration-200 border ${
        isSelected
          ? 'border-indigo-600 shadow-lg ring-4 ring-indigo-50/70 -translate-y-0.5'
          : 'border-slate-200/90 hover:border-slate-300 shadow-sm'
      }`}
    >
      {/* Top Drag Handle Bar */}
      <div
        draggable
        onDragStart={(e) => onDragStartQuestion(e, index)}
        className="w-full flex items-center justify-center py-1.5 cursor-grab active:cursor-grabbing hover:bg-slate-50/80 rounded-t-2xl select-none"
        title="Drag to reorder question"
      >
        <GripVertical className="w-5 h-4 text-slate-300 group-hover:text-slate-400 rotate-90" />
      </div>

      <div className="p-5 pt-1 space-y-4">
        {/* Header row: Question Label Input & Type Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-1 w-full">
            <span className="text-xs font-bold text-slate-400 font-mono w-5 shrink-0 text-center">
              {index + 1}.
            </span>
            <input
              type="text"
              value={field.label}
              onChange={(e) => onUpdate({ ...field, label: e.target.value })}
              placeholder={field.type === 'section_header' ? 'Section Title...' : 'Enter your question...'}
              className="w-full text-base font-semibold text-slate-900 placeholder-slate-400 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-indigo-600 focus:outline-none pb-1 transition-colors"
            />
          </div>

          {/* Question Type Selector */}
          <div className="relative shrink-0 w-full sm:w-auto">
            <select
              value={field.type}
              onChange={(e) => {
                const nextType = e.target.value as FieldType;
                let extra: Partial<FormField> = {};
                if (['multiple_choice', 'checkboxes', 'dropdown'].includes(nextType) && (!field.options || field.options.length === 0)) {
                  extra.options = ['Option 1', 'Option 2', 'Option 3'];
                }
                if (nextType === 'rating') extra.ratingStars = 5;
                if (nextType === 'linear_scale') {
                  extra.scaleMin = 1;
                  extra.scaleMax = 5;
                  extra.scaleMinLabel = 'Low';
                  extra.scaleMaxLabel = 'High';
                }
                onUpdate({ ...field, type: nextType, ...extra });
              }}
              className="w-full sm:w-auto appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-1.5 pr-8 text-xs font-medium text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {FIELD_PALETTE_ITEMS.map((item) => (
                <option key={item.type} value={item.type}>
                  {item.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Optional Description / Help Text */}
        {(isSelected || field.description) && (
          <div className="pl-7">
            <input
              type="text"
              value={field.description || ''}
              onChange={(e) => onUpdate({ ...field, description: e.target.value })}
              placeholder="Add optional description or instructions for respondent..."
              className="w-full text-xs text-slate-500 placeholder-slate-400 bg-transparent border-b border-slate-100 focus:border-indigo-300 focus:outline-none pb-1"
            />
          </div>
        )}

        {/* Field Type Specific Controls */}
        <div className="pl-7">
          {/* Multiple Choice, Checkboxes, Dropdown */}
          {['multiple_choice', 'checkboxes', 'dropdown'].includes(field.type) && (
            <div className="space-y-2 pt-1">
              {(field.options || ['Option 1']).map((option, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2.5">
                  {field.type === 'multiple_choice' && (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                  )}
                  {field.type === 'checkboxes' && (
                    <div className="w-4 h-4 rounded border-2 border-slate-300 shrink-0" />
                  )}
                  {field.type === 'dropdown' && (
                    <span className="text-xs text-slate-400 font-mono w-4 shrink-0 text-center">
                      {optIdx + 1}.
                    </span>
                  )}

                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(optIdx, e.target.value)}
                    placeholder={`Option ${optIdx + 1}`}
                    className="flex-1 text-xs text-slate-700 bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-transparent focus:border-indigo-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
                  />

                  {(field.options?.length || 0) > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(optIdx)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors"
                      title="Remove option"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/70 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add Option
                </button>
              </div>
            </div>
          )}

          {/* Star Rating */}
          {field.type === 'rating' && (
            <div className="py-2 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                {Array.from({ length: field.ratingStars || 5 }).map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
                <span>Scale:</span>
                <button
                  type="button"
                  onClick={() => onUpdate({ ...field, ratingStars: 5 })}
                  className={`px-2 py-0.5 rounded font-medium ${
                    (field.ratingStars || 5) === 5
                      ? 'bg-indigo-600 text-white'
                      : 'hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  5 Stars
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ ...field, ratingStars: 10 })}
                  className={`px-2 py-0.5 rounded font-medium ${
                    field.ratingStars === 10
                      ? 'bg-indigo-600 text-white'
                      : 'hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  10 Stars
                </button>
              </div>
            </div>
          )}

          {/* Linear Scale */}
          {field.type === 'linear_scale' && (
            <div className="space-y-3 py-1">
              <div className="flex items-center gap-2">
                {Array.from({ length: (field.scaleMax || 5) - (field.scaleMin || 1) + 1 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700"
                  >
                    {(field.scaleMin || 1) + i}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium block mb-1">
                    Label for minimum ({(field.scaleMin || 1)}):
                  </span>
                  <input
                    type="text"
                    value={field.scaleMinLabel || ''}
                    onChange={(e) => onUpdate({ ...field, scaleMinLabel: e.target.value })}
                    placeholder="e.g. Strongly Disagree"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-medium block mb-1">
                    Label for maximum ({(field.scaleMax || 5)}):
                  </span>
                  <input
                    type="text"
                    value={field.scaleMaxLabel || ''}
                    onChange={(e) => onUpdate({ ...field, scaleMaxLabel: e.target.value })}
                    placeholder="e.g. Strongly Agree"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* NPS 0-10 */}
          {field.type === 'nps' && (
            <div className="py-2 space-y-2">
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: 11 }).map((_, score) => {
                  const isDetractor = score <= 6;
                  const isPassive = score === 7 || score === 8;
                  return (
                    <div
                      key={score}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center border ${
                        isDetractor
                          ? 'border-rose-200 bg-rose-50/60 text-rose-700'
                          : isPassive
                          ? 'border-amber-200 bg-amber-50/60 text-amber-700'
                          : 'border-emerald-200 bg-emerald-50/60 text-emerald-700'
                      }`}
                    >
                      {score}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                <span className="text-rose-600">0 = Not at all likely (Detractor)</span>
                <span className="text-amber-600">7-8 = Passive</span>
                <span className="text-emerald-600">9-10 = Promoter</span>
              </div>
            </div>
          )}

          {/* Short Text */}
          {field.type === 'short_text' && (
            <div className="py-1">
              <input
                type="text"
                disabled
                placeholder={field.placeholder || 'Respondent short answer text...'}
                className="w-full sm:w-80 text-xs bg-slate-50 border-b border-slate-200 text-slate-400 py-2 cursor-not-allowed"
              />
            </div>
          )}

          {/* Long Text */}
          {field.type === 'long_text' && (
            <div className="py-1">
              <div className="w-full text-xs bg-slate-50 border-b border-slate-200 text-slate-400 py-3.5 px-2 rounded-t cursor-not-allowed">
                Respondent long paragraph answer...
              </div>
            </div>
          )}

          {/* Date & Time */}
          {field.type === 'date' && (
            <div className="py-1 text-xs text-slate-400 flex items-center gap-2">
              <span className="border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50">
                Month, Day, Year 📅
              </span>
            </div>
          )}

          {field.type === 'time' && (
            <div className="py-1 text-xs text-slate-400 flex items-center gap-2">
              <span className="border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50">
                --:-- AM / PM ⏰
              </span>
            </div>
          )}

          {/* File Upload */}
          {field.type === 'file_upload' && (
            <div className="py-1 text-xs text-slate-500 border-2 border-dashed border-slate-200 rounded-xl p-3 bg-slate-50/50 flex items-center justify-center gap-2">
              <span>Respondents will upload files (PDF, JPG, PNG, DOCX up to 10MB)</span>
            </div>
          )}

          {/* Section Header */}
          {field.type === 'section_header' && (
            <div className="py-1 text-xs text-slate-500 italic">
              Section dividers split your survey into distinct visual stages for respondents.
            </div>
          )}
        </div>

        {/* Footer Actions Bar (Google Forms style) */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp();
              }}
              disabled={index === 0}
              className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded-lg hover:bg-slate-100 transition-colors"
              title="Move Up"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown();
              }}
              disabled={index === totalFields - 1}
              className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded-lg hover:bg-slate-100 transition-colors"
              title="Move Down"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Required switch */}
            {field.type !== 'section_header' && (
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="text-xs font-medium text-slate-600">Required</span>
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => onUpdate({ ...field, required: e.target.checked })}
                  className="sr-only"
                />
                <div
                  className={`w-9 h-5 rounded-full transition-colors relative ${
                    field.required ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      field.required ? 'left-4.5' : 'left-0.5'
                    }`}
                  />
                </div>
              </label>
            )}

            <div className="h-4 w-px bg-slate-200" />

            {/* Duplicate */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Duplicate question"
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              title="Delete question"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
