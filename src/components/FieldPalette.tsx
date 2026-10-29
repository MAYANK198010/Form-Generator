import React from 'react';
import {
  Type,
  AlignLeft,
  CircleDot,
  CheckSquare,
  ChevronDown,
  Star,
  Sliders,
  TrendingUp,
  Calendar,
  Clock,
  UploadCloud,
  Heading,
  Plus,
  GripVertical
} from 'lucide-react';
import { FieldType } from '../types/form';

export interface PaletteItem {
  type: FieldType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'text' | 'choice' | 'rating' | 'advanced';
}

export const FIELD_PALETTE_ITEMS: PaletteItem[] = [
  {
    type: 'short_text',
    label: 'Short Answer',
    description: 'Single-line text for names, emails, short responses',
    icon: Type,
    category: 'text',
  },
  {
    type: 'long_text',
    label: 'Paragraph',
    description: 'Multi-line text for feedback, comments, reviews',
    icon: AlignLeft,
    category: 'text',
  },
  {
    type: 'multiple_choice',
    label: 'Multiple Choice',
    description: 'Single-selection radio choices',
    icon: CircleDot,
    category: 'choice',
  },
  {
    type: 'checkboxes',
    label: 'Checkboxes',
    description: 'Select multiple items from a list',
    icon: CheckSquare,
    category: 'choice',
  },
  {
    type: 'dropdown',
    label: 'Dropdown',
    description: 'Compact select list for categories and roles',
    icon: ChevronDown,
    category: 'choice',
  },
  {
    type: 'rating',
    label: 'Star Rating',
    description: '5-star or 10-star visual rating',
    icon: Star,
    category: 'rating',
  },
  {
    type: 'linear_scale',
    label: 'Linear Scale',
    description: '1 to 5 or 1 to 10 numerical ranking scale',
    icon: Sliders,
    category: 'rating',
  },
  {
    type: 'nps',
    label: 'NPS Score',
    description: '0-10 Net Promoter Score with promoter index',
    icon: TrendingUp,
    category: 'rating',
  },
  {
    type: 'date',
    label: 'Date',
    description: 'Day, month, and year calendar selector',
    icon: Calendar,
    category: 'advanced',
  },
  {
    type: 'time',
    label: 'Time',
    description: 'Hours and minutes time picker',
    icon: Clock,
    category: 'advanced',
  },
  {
    type: 'file_upload',
    label: 'File Upload',
    description: 'Document, image, or resume attachments',
    icon: UploadCloud,
    category: 'advanced',
  },
  {
    type: 'section_header',
    label: 'Section Header',
    description: 'Visual divider with custom title and notes',
    icon: Heading,
    category: 'advanced',
  },
];

interface FieldPaletteProps {
  onAddField: (type: FieldType) => void;
  onDragStartField: (e: React.DragEvent, type: FieldType) => void;
}

export const FieldPalette: React.FC<FieldPaletteProps> = ({ onAddField, onDragStartField }) => {
  return (
    <aside className="w-full lg:w-72 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col h-fit sticky top-20">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div>
          <h3 className="font-bold text-slate-800 text-sm tracking-tight">Question Types</h3>
          <p className="text-xs text-slate-500">Drag into canvas or click to add</p>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
          12 Types
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
        {FIELD_PALETTE_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => onDragStartField(e, item.type)}
              onClick={() => onAddField(item.type)}
              className="group flex items-center justify-between p-2.5 rounded-xl border border-slate-200/70 hover:border-indigo-400 bg-white hover:bg-indigo-50/40 transition-all cursor-grab active:cursor-grabbing select-none text-left shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-md"
              title={`${item.label}: ${item.description}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-600 flex items-center justify-center transition-colors shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 group-hover:text-indigo-900 truncate">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-600 truncate hidden lg:block">
                    {item.description}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <Plus className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
        <span>Hosted target:</span>
        <span className="font-mono text-indigo-600 font-semibold">form.ecast.store</span>
      </div>
    </aside>
  );
};
