import React, { useState } from 'react';
import {
  Globe,
  Sparkles,
  Plus,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Form, FormField, FieldType } from '../types/form';
import { FieldEditor } from './FieldEditor';
import { FieldPalette, FIELD_PALETTE_ITEMS } from './FieldPalette';

interface FormBuilderProps {
  form: Form;
  onUpdateForm: (updated: Form) => void;
  onPreview: () => void;
  onOpenTheme: () => void;
  onOpenExport?: () => void;
  onToggleLive?: () => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  form,
  onUpdateForm,
  onPreview,
  onOpenTheme,
  onOpenExport,
  onToggleLive,
}) => {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    form.fields.length > 0 ? form.fields[0].id : null
  );
  const [draggedItemType, setDraggedItemType] = useState<FieldType | null>(null);
  const [draggedFieldIndex, setDraggedFieldIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Helper to generate a unique field
  const createField = (type: FieldType): FormField => {
    const meta = FIELD_PALETTE_ITEMS.find((item) => item.type === type);
    const id = 'f_' + Math.random().toString(36).substring(2, 9);

    const baseField: FormField = {
      id,
      type,
      label: meta ? `Untitled ${meta.label}` : 'Untitled Question',
      required: false,
    };

    if (['multiple_choice', 'checkboxes', 'dropdown'].includes(type)) {
      baseField.options = ['Option 1', 'Option 2', 'Option 3'];
    } else if (type === 'rating') {
      baseField.ratingStars = 5;
    } else if (type === 'linear_scale') {
      baseField.scaleMin = 1;
      baseField.scaleMax = 5;
      baseField.scaleMinLabel = 'Low';
      baseField.scaleMaxLabel = 'High';
    } else if (type === 'nps') {
      baseField.label = 'How likely are you to recommend us to a friend or colleague?';
      baseField.description = '0 = Not at all likely, 10 = Extremely likely';
    } else if (type === 'section_header') {
      baseField.label = 'New Section';
      baseField.description = 'Section description and instructions';
    }

    return baseField;
  };

  const handleAddField = (type: FieldType, targetIndex?: number) => {
    const newField = createField(type);
    let nextFields = [...form.fields];

    if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex <= nextFields.length) {
      nextFields.splice(targetIndex, 0, newField);
    } else {
      nextFields.push(newField);
    }

    onUpdateForm({
      ...form,
      fields: nextFields,
      updatedAt: new Date().toISOString(),
    });
    setSelectedFieldId(newField.id);
  };

  const handleUpdateField = (index: number, updated: FormField) => {
    const nextFields = [...form.fields];
    nextFields[index] = updated;
    onUpdateForm({
      ...form,
      fields: nextFields,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDuplicateField = (index: number) => {
    const source = form.fields[index];
    const duplicated: FormField = {
      ...source,
      id: 'f_' + Math.random().toString(36).substring(2, 9),
      label: `${source.label} (Copy)`,
      options: source.options ? [...source.options] : undefined,
    };

    const nextFields = [...form.fields];
    nextFields.splice(index + 1, 0, duplicated);

    onUpdateForm({
      ...form,
      fields: nextFields,
      updatedAt: new Date().toISOString(),
    });
    setSelectedFieldId(duplicated.id);
  };

  const handleDeleteField = (index: number) => {
    const nextFields = form.fields.filter((_, i) => i !== index);
    onUpdateForm({
      ...form,
      fields: nextFields,
      updatedAt: new Date().toISOString(),
    });

    if (selectedFieldId === form.fields[index]?.id) {
      setSelectedFieldId(nextFields[0]?.id || null);
    }
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= form.fields.length) return;
    const nextFields = [...form.fields];
    const [moved] = nextFields.splice(fromIndex, 1);
    nextFields.splice(toIndex, 0, moved);

    onUpdateForm({
      ...form,
      fields: nextFields,
      updatedAt: new Date().toISOString(),
    });
  };

  // Drag and drop from palette
  const handleDragStartPalette = (e: React.DragEvent, type: FieldType) => {
    e.dataTransfer.setData('text/plain', type);
    e.dataTransfer.effectAllowed = 'copy';
    setDraggedItemType(type);
  };

  // Drag and drop existing question
  const handleDragStartQuestion = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/question-index', String(index));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedFieldIndex(index);
  };

  const handleDragOverQuestion = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = draggedItemType ? 'copy' : 'move';
    setDropTargetIndex(index);
  };

  const handleDropQuestion = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDropTargetIndex(null);

    // If dropped from palette
    if (draggedItemType) {
      handleAddField(draggedItemType, targetIndex);
      setDraggedItemType(null);
      return;
    }

    // If reordering existing question
    if (draggedFieldIndex !== null && draggedFieldIndex !== targetIndex) {
      handleMove(draggedFieldIndex, targetIndex);
      setDraggedFieldIndex(null);
    }
  };

  const handleAiGenerate = () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);

    // High quality intelligent survey template generator based on keywords
    setTimeout(() => {
      const p = aiPrompt.toLowerCase();
      let generatedFields: FormField[] = [];

      if (p.includes('feedback') || p.includes('csat') || p.includes('satisfaction')) {
        generatedFields = [
          {
            id: 'ai_1',
            type: 'nps',
            label: 'How likely are you to recommend us to friends or colleagues?',
            required: true,
          },
          {
            id: 'ai_2',
            type: 'rating',
            label: 'How would you rate the responsiveness of our team?',
            required: true,
            ratingStars: 5,
          },
          {
            id: 'ai_3',
            type: 'multiple_choice',
            label: 'How often do you interact with our platform?',
            required: true,
            options: ['Daily', 'Weekly', 'Monthly', 'First time'],
          },
          {
            id: 'ai_4',
            type: 'checkboxes',
            label: 'Which areas have the greatest opportunity for improvement?',
            required: false,
            options: ['Speed & Performance', 'Feature Breadth', 'Documentation', 'Pricing'],
          },
          {
            id: 'ai_5',
            type: 'long_text',
            label: 'What is one thing we could do better?',
            required: false,
            placeholder: 'Share your honest feedback...',
          },
        ];
      } else if (p.includes('event') || p.includes('rsvp') || p.includes('conference')) {
        generatedFields = [
          {
            id: 'ai_1',
            type: 'short_text',
            label: 'Full Name',
            required: true,
            placeholder: 'Taylor Swift',
          },
          {
            id: 'ai_2',
            type: 'short_text',
            label: 'Work Email Address',
            required: true,
            placeholder: 'taylor@example.com',
          },
          {
            id: 'ai_3',
            type: 'multiple_choice',
            label: 'Attendance Type',
            required: true,
            options: ['In-Person Keynote', 'Virtual Stream'],
          },
          {
            id: 'ai_4',
            type: 'dropdown',
            label: 'Primary Industry',
            required: false,
            options: ['SaaS', 'Retail / Commerce', 'Financial Services', 'Healthcare', 'Other'],
          },
          {
            id: 'ai_5',
            type: 'checkboxes',
            label: 'Special Accommodations or Dietary Requirements',
            required: false,
            options: ['Vegetarian', 'Vegan', 'Wheelchair Access', 'None'],
          },
        ];
      } else {
        generatedFields = [
          {
            id: 'ai_1',
            type: 'short_text',
            label: 'Your Name or Organization',
            required: true,
          },
          {
            id: 'ai_2',
            type: 'rating',
            label: 'Overall Experience Rating',
            required: true,
            ratingStars: 5,
          },
          {
            id: 'ai_3',
            type: 'multiple_choice',
            label: 'Primary Reason for Choosing Ecast',
            required: true,
            options: ['Reliability', 'Ease of Customization', 'Analytics & Exports', 'Price'],
          },
          {
            id: 'ai_4',
            type: 'long_text',
            label: 'Any additional questions or comments?',
            required: false,
          },
        ];
      }

      onUpdateForm({
        ...form,
        title: aiPrompt.slice(0, 60),
        fields: [...form.fields, ...generatedFields],
        updatedAt: new Date().toISOString(),
      });
      setIsGeneratingAi(false);
      setShowAiModal(false);
      setAiPrompt('');
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Drag & Drop Palette */}
        <FieldPalette
          onAddField={(type) => handleAddField(type)}
          onDragStartField={handleDragStartPalette}
        />

        {/* Main Canvas Area */}
        <div className="flex-1 w-full space-y-4">
          {/* Top Form Header Card (Google Forms Style) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden relative">
            {/* Accent Top Border Bar */}
            <div
              className={`h-2.5 w-full ${
                form.theme.accentColor === 'indigo'
                  ? 'bg-indigo-600'
                  : form.theme.accentColor === 'emerald'
                  ? 'bg-emerald-600'
                  : form.theme.accentColor === 'violet'
                  ? 'bg-violet-600'
                  : form.theme.accentColor === 'amber'
                  ? 'bg-amber-600'
                  : form.theme.accentColor === 'rose'
                  ? 'bg-rose-600'
                  : form.theme.accentColor === 'cyan'
                  ? 'bg-cyan-600'
                  : 'bg-slate-700'
              }`}
            />

            {/* Optional Banner Image */}
            {form.theme.headerBanner && (
              <div className="h-32 sm:h-44 w-full overflow-hidden relative group">
                <img
                  src={form.theme.headerBanner}
                  alt="Form banner"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={onOpenTheme}
                  className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow backdrop-blur transition-all flex items-center gap-1.5"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Change Banner
                </button>
              </div>
            )}

            <div className="p-6 sm:p-8 space-y-4">
              <div className="space-y-2">
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    onUpdateForm({
                      ...form,
                      title: e.target.value,
                      settings: { ...form.settings, title: e.target.value },
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  placeholder="Form Title"
                  className="w-full text-2xl sm:text-3xl font-extrabold text-slate-900 placeholder-slate-300 bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-indigo-600 focus:outline-none pb-1 transition-all"
                />
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    onUpdateForm({
                      ...form,
                      description: e.target.value,
                      settings: { ...form.settings, description: e.target.value },
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  placeholder="Form description or instructions for respondents..."
                  rows={2}
                  className="w-full text-sm text-slate-600 placeholder-slate-400 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-indigo-300 focus:outline-none resize-none transition-all"
                />
              </div>

              {/* Host Domain, Live Status & Actions */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        form.settings.isLive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          form.settings.isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                        }`}
                      />
                      {form.settings.isLive ? 'Live & Accepting Responses' : 'Draft (Not Live)'}
                    </span>

                    {onToggleLive && (
                      <button
                        type="button"
                        onClick={onToggleLive}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-lg transition-colors ${
                          form.settings.isLive
                            ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                      >
                        {form.settings.isLive ? 'Pause / Draft' : '🚀 Go Live'}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-mono text-[11px] text-slate-800">
                    <Globe className="w-3 h-3 text-indigo-500 shrink-0" />
                    <span className="font-semibold text-indigo-600">form.ecast.store</span>
                    <span className="text-slate-400">/?s=</span>
                    <input
                      type="text"
                      value={form.settings.customSlug}
                      onChange={(e) => {
                        const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                        onUpdateForm({
                          ...form,
                          settings: { ...form.settings, customSlug: slug },
                          updatedAt: new Date().toISOString(),
                        });
                      }}
                      className="bg-transparent border-none text-slate-900 font-semibold focus:outline-none w-28"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAiModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Assistant
                  </button>

                  {onOpenExport && (
                    <button
                      type="button"
                      onClick={onOpenExport}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      <span>Share Link</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onPreview}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    Live Preview
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Form Questions Canvas */}
          <div
            className="space-y-4"
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = draggedItemType ? 'copy' : 'move';
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedItemType) {
                handleAddField(draggedItemType);
                setDraggedItemType(null);
              }
            }}
          >
            {form.fields.map((field, index) => (
              <React.Fragment key={field.id}>
                {dropTargetIndex === index && (
                  <div className="h-2 rounded-full bg-indigo-500 animate-pulse my-1 transition-all" />
                )}
                <FieldEditor
                  field={field}
                  index={index}
                  totalFields={form.fields.length}
                  isSelected={selectedFieldId === field.id}
                  onSelect={() => setSelectedFieldId(field.id)}
                  onUpdate={(updated) => handleUpdateField(index, updated)}
                  onDuplicate={() => handleDuplicateField(index)}
                  onDelete={() => handleDeleteField(index)}
                  onMoveUp={() => handleMove(index, index - 1)}
                  onMoveDown={() => handleMove(index, index + 1)}
                  onDragStartQuestion={handleDragStartQuestion}
                  onDragOverQuestion={handleDragOverQuestion}
                  onDropQuestion={handleDropQuestion}
                />
              </React.Fragment>
            ))}

            {/* Bottom Drop Zone / Add Card */}
            {form.fields.length === 0 ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'copy';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedItemType) {
                    handleAddField(draggedItemType);
                    setDraggedItemType(null);
                  }
                }}
                className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-300 bg-white/70 hover:bg-indigo-50/30 transition-colors flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-800">Your Survey Canvas is Empty</h4>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Drag any field from the question palette on the left, click any item, or generate questions automatically with AI.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => handleAddField('multiple_choice')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-indigo-500 shadow-sm transition-all"
                  >
                    + Multiple Choice
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddField('nps')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-indigo-500 shadow-sm transition-all"
                  >
                    + NPS Score
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddField('rating')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-indigo-500 shadow-sm transition-all"
                  >
                    + Star Rating
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center pt-2">
                <button
                  type="button"
                  onClick={() => handleAddField('multiple_choice')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50 text-indigo-700 text-xs font-semibold transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Question to End
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Survey Generator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">AI Survey Assistant</h3>
                <p className="text-xs text-slate-500">
                  Describe what kind of survey or questionnaire you want to generate.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Survey Goal or Topic</label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={3}
                placeholder="e.g., Create a 5-question customer onboarding survey for our SaaS store..."
                className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setAiPrompt('Customer satisfaction survey with NPS score and feature ratings')}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-md"
                >
                  CSAT + NPS
                </button>
                <button
                  type="button"
                  onClick={() => setAiPrompt('Tech summit conference registration with workshop tracks')}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-md"
                >
                  Conference RSVP
                </button>
                <button
                  type="button"
                  onClick={() => setAiPrompt('Product usability feedback and checkout speed evaluation')}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-md"
                >
                  Product Feedback
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!aiPrompt.trim() || isGeneratingAi}
                onClick={handleAiGenerate}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
              >
                {isGeneratingAi ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Questions
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
