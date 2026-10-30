import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Star,
  UploadCloud,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  Clock,
  ShieldCheck,
  Eye,
  ExternalLink
} from 'lucide-react';
import { Form, FormSubmission } from '../types/form';

interface SurveyTakerProps {
  form: Form;
  onSubmitResponse: (submission: Omit<FormSubmission, 'id'>) => void;
  onExitPreview?: () => void;
  isPreviewMode?: boolean;
}

export const SurveyTaker: React.FC<SurveyTakerProps> = ({
  form,
  onSubmitResponse,
  onExitPreview,
  isPreviewMode = false,
}) => {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [form.id]);

  const handleAnswerChange = (fieldId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleCheckboxToggle = (fieldId: string, option: string) => {
    const current: string[] = answers[fieldId] || [];
    const exists = current.includes(option);
    const next = exists ? current.filter((item) => item !== option) : [...current, option];
    handleAnswerChange(fieldId, next);
  };

  // Calculate completion percentage
  const answerableFields = form.fields.filter((f) => f.type !== 'section_header');
  const answeredCount = answerableFields.filter((f) => {
    const val = answers[f.id];
    if (val === undefined || val === null || val === '') return false;
    if (Array.isArray(val) && val.length === 0) return false;
    return true;
  }).length;
  const progressPct = answerableFields.length > 0 ? Math.round((answeredCount / answerableFields.length) * 100) : 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const newErrors: Record<string, string> = {};
    for (const f of answerableFields) {
      if (f.required) {
        const val = answers[f.id];
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          newErrors[f.id] = 'This question is required.';
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to first error
      const firstErrorId = Object.keys(newErrors)[0];
      const el = document.getElementById(`field-${firstErrorId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const durationSeconds = Math.max(12, Math.round((Date.now() - startTimeRef.current) / 1000));

    // Randomize realistic device / location for mock variety
    const devices: Array<'Desktop' | 'Mobile' | 'Tablet'> = ['Desktop', 'Mobile', 'Tablet'];
    const locations = [
      'San Francisco, US',
      'New York, US',
      'London, UK',
      'Toronto, CA',
      'Berlin, DE',
      'Tokyo, JP',
      'Sydney, AU',
      'Paris, FR',
    ];

    const randomDevice = devices[Math.floor(Math.random() * devices.length)];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];

    onSubmitResponse({
      formId: form.id,
      submittedAt: new Date().toISOString(),
      durationSeconds,
      device: randomDevice,
      location: randomLocation,
      answers,
    });

    setIsSubmitted(true);

    import('canvas-confetti')
      .then((mod) => {
        const fn = mod.default || mod;
        if (typeof fn === 'function') {
          fn({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
        }
      })
      .catch(() => {});
  };

  const handleReset = () => {
    setAnswers({});
    setErrors({});
    setIsSubmitted(false);
    startTimeRef.current = Date.now();
  };

  // Color mapping
  const accentClasses = {
    indigo: {
      bar: 'bg-indigo-600',
      text: 'text-indigo-600',
      ring: 'focus:ring-indigo-500',
      btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      borderActive: 'border-indigo-600',
      bgLight: 'bg-indigo-50',
    },
    emerald: {
      bar: 'bg-emerald-600',
      text: 'text-emerald-600',
      ring: 'focus:ring-emerald-500',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      borderActive: 'border-emerald-600',
      bgLight: 'bg-emerald-50',
    },
    violet: {
      bar: 'bg-violet-600',
      text: 'text-violet-600',
      ring: 'focus:ring-violet-500',
      btn: 'bg-violet-600 hover:bg-violet-700 text-white',
      borderActive: 'border-violet-600',
      bgLight: 'bg-violet-50',
    },
    amber: {
      bar: 'bg-amber-600',
      text: 'text-amber-600',
      ring: 'focus:ring-amber-500',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white',
      borderActive: 'border-amber-600',
      bgLight: 'bg-amber-50',
    },
    rose: {
      bar: 'bg-rose-600',
      text: 'text-rose-600',
      ring: 'focus:ring-rose-500',
      btn: 'bg-rose-600 hover:bg-rose-700 text-white',
      borderActive: 'border-rose-600',
      bgLight: 'bg-rose-50',
    },
    cyan: {
      bar: 'bg-cyan-600',
      text: 'text-cyan-600',
      ring: 'focus:ring-cyan-500',
      btn: 'bg-cyan-600 hover:bg-cyan-700 text-white',
      borderActive: 'border-cyan-600',
      bgLight: 'bg-cyan-50',
    },
    slate: {
      bar: 'bg-slate-700',
      text: 'text-slate-700',
      ring: 'focus:ring-slate-500',
      btn: 'bg-slate-800 hover:bg-slate-900 text-white',
      borderActive: 'border-slate-800',
      bgLight: 'bg-slate-100',
    },
  }[form.theme.accentColor || 'indigo'];

  if (!form.settings.isAcceptingResponses) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">{form.title}</h2>
          <p className="text-slate-600 text-sm">
            {form.settings.closedMessage || 'This survey is no longer accepting new responses.'}
          </p>
          {onExitPreview && (
            <button
              onClick={onExitPreview}
              className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900"
            >
              Return to Form Editor
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 pb-20 pt-4">
      {/* Top Banner Notice for Preview */}
      {isPreviewMode && (
        <div className="max-w-3xl mx-auto px-4 mb-4">
          <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>
                <strong>Live Respondent Preview Mode</strong> — Hosted target:{' '}
                <span className="font-mono text-indigo-300">
                  https://{form.settings.customDomain}/s/{form.settings.customSlug}
                </span>
              </span>
            </div>
            {onExitPreview && (
              <button
                type="button"
                onClick={onExitPreview}
                className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg font-medium transition-colors"
              >
                Back to Editor
              </button>
            )}
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 space-y-4">
        {/* Progress Bar Header */}
        {form.theme.showProgressBar && (
          <div className="bg-white/80 backdrop-blur rounded-xl p-3 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <span>Survey Progress</span>
              <span className="font-bold text-slate-900">{progressPct}%</span>
            </div>
            <div className="flex-1 max-w-xs h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${accentClasses.bar} transition-all duration-300`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Success Confirmation Card */}
        {isSubmitted ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900">Response Recorded!</h2>

            <p className="text-slate-600 text-sm max-w-md mx-auto">
              {form.settings.confirmationMessage || 'Thank you for your feedback! Your submission has been saved.'}
            </p>

            {form.settings.autoExport?.enabled && (
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200/60 rounded-xl px-3.5 py-2 text-xs text-indigo-700">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Automated export synced to analytics pipeline & webhook</span>
              </div>
            )}

            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3">
              {form.settings.allowMultipleSubmissions && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Submit Another Response
                </button>
              )}

              {onExitPreview && (
                <button
                  type="button"
                  onClick={onExitPreview}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold ${accentClasses.btn} transition-colors shadow-sm`}
                >
                  Return to Dashboard
                </button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className={`h-2.5 w-full ${accentClasses.bar}`} />

              {form.theme.headerBanner && (
                <div className="h-32 sm:h-44 w-full overflow-hidden">
                  <img
                    src={form.theme.headerBanner}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6 sm:p-8 space-y-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {form.title}
                </h1>
                {form.description && (
                  <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                    {form.description}
                  </p>
                )}
                <div className="pt-3 text-[11px] text-rose-500 font-medium">
                  * Indicates required question
                </div>
              </div>
            </div>

            {/* Questions List */}
            {form.fields.map((field, idx) => {
              const hasError = !!errors[field.id];

              if (field.type === 'section_header') {
                return (
                  <div
                    key={field.id}
                    className="bg-slate-800 text-white p-5 rounded-2xl shadow-sm space-y-1"
                  >
                    <h3 className="text-lg font-bold">{field.label}</h3>
                    {field.description && (
                      <p className="text-xs text-slate-300">{field.description}</p>
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={field.id}
                  id={`field-${field.id}`}
                  className={`bg-white rounded-2xl p-6 sm:p-7 border transition-all shadow-xs ${
                    hasError
                      ? 'border-rose-400 ring-2 ring-rose-100'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm sm:text-base font-semibold text-slate-900 flex items-start gap-1.5">
                        {form.settings.showQuestionNumbers && (
                          <span className="text-slate-400 font-mono font-normal">
                            {idx + 1}.
                          </span>
                        )}
                        <span>{field.label}</span>
                        {field.required && (
                          <span className="text-rose-500 font-bold">*</span>
                        )}
                      </label>
                      {field.description && (
                        <p className="text-xs text-slate-500 mt-1 pl-4 sm:pl-0">
                          {field.description}
                        </p>
                      )}
                    </div>

                    {/* Question Input Based on Type */}
                    <div className="pt-2">
                      {/* Short Text */}
                      {field.type === 'short_text' && (
                        <input
                          type="text"
                          value={answers[field.id] || ''}
                          onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                          placeholder={field.placeholder || 'Your answer...'}
                          className="w-full sm:w-96 text-sm bg-white border border-slate-200 focus:border-indigo-600 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                        />
                      )}

                      {/* Long Text */}
                      {field.type === 'long_text' && (
                        <textarea
                          rows={4}
                          value={answers[field.id] || ''}
                          onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                          placeholder={field.placeholder || 'Your detailed answer...'}
                          className="w-full text-sm bg-white border border-slate-200 focus:border-indigo-600 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                        />
                      )}

                      {/* Multiple Choice */}
                      {field.type === 'multiple_choice' && (
                        <div className="space-y-2.5">
                          {(field.options || []).map((opt) => {
                            const isChecked = answers[field.id] === opt;
                            return (
                              <label
                                key={opt}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                  isChecked
                                    ? `${accentClasses.borderActive} ${accentClasses.bgLight} font-medium`
                                    : 'border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={field.id}
                                  value={opt}
                                  checked={isChecked}
                                  onChange={() => handleAnswerChange(field.id, opt)}
                                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-xs sm:text-sm text-slate-800">
                                  {opt}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {/* Checkboxes */}
                      {field.type === 'checkboxes' && (
                        <div className="space-y-2.5">
                          {(field.options || []).map((opt) => {
                            const currentList: string[] = answers[field.id] || [];
                            const isChecked = currentList.includes(opt);
                            return (
                              <label
                                key={opt}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                  isChecked
                                    ? `${accentClasses.borderActive} ${accentClasses.bgLight} font-medium`
                                    : 'border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleCheckboxToggle(field.id, opt)}
                                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                />
                                <span className="text-xs sm:text-sm text-slate-800">
                                  {opt}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {/* Dropdown */}
                      {field.type === 'dropdown' && (
                        <select
                          value={answers[field.id] || ''}
                          onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                          className="w-full sm:w-80 text-sm bg-white border border-slate-200 focus:border-indigo-600 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                        >
                          <option value="">Select an option...</option>
                          {(field.options || []).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Star Rating */}
                      {field.type === 'rating' && (
                        <div className="flex items-center gap-2 py-1">
                          {Array.from({ length: field.ratingStars || 5 }).map((_, i) => {
                            const starValue = i + 1;
                            const isSelected = (answers[field.id] || 0) >= starValue;
                            return (
                              <button
                                type="button"
                                key={i}
                                onClick={() => handleAnswerChange(field.id, starValue)}
                                className="p-1 hover:scale-115 transition-transform focus:outline-none"
                              >
                                <Star
                                  className={`w-7 h-7 sm:w-8 sm:h-8 ${
                                    isSelected
                                      ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                                      : 'text-slate-200 hover:text-amber-200'
                                  }`}
                                />
                              </button>
                            );
                          })}
                          <span className="text-xs font-semibold text-slate-500 ml-2">
                            {answers[field.id] ? `${answers[field.id]} / ${field.ratingStars || 5}` : 'Select rating'}
                          </span>
                        </div>
                      )}

                      {/* Linear Scale */}
                      {field.type === 'linear_scale' && (
                        <div className="space-y-3 py-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {Array.from({
                              length: (field.scaleMax || 5) - (field.scaleMin || 1) + 1,
                            }).map((_, i) => {
                              const val = (field.scaleMin || 1) + i;
                              const isChecked = answers[field.id] === val;
                              return (
                                <button
                                  type="button"
                                  key={val}
                                  onClick={() => handleAnswerChange(field.id, val)}
                                  className={`w-10 h-10 rounded-xl text-sm font-semibold border transition-all ${
                                    isChecked
                                      ? `${accentClasses.bar} text-white border-transparent shadow-sm scale-105`
                                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                                  }`}
                                >
                                  {val}
                                </button>
                              );
                            })}
                          </div>
                          {(field.scaleMinLabel || field.scaleMaxLabel) && (
                            <div className="flex justify-between text-xs text-slate-500 max-w-xs font-medium">
                              <span>{field.scaleMinLabel}</span>
                              <span>{field.scaleMaxLabel}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* NPS Score (0 to 10) */}
                      {field.type === 'nps' && (
                        <div className="space-y-2.5">
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {Array.from({ length: 11 }).map((_, score) => {
                              const isChecked = answers[field.id] === score;
                              const isDetractor = score <= 6;
                              const isPassive = score === 7 || score === 8;

                              let colorStyle = 'border-slate-200 hover:bg-slate-100 text-slate-700';
                              if (isChecked) {
                                if (isDetractor) colorStyle = 'bg-rose-600 text-white border-rose-600 shadow';
                                else if (isPassive) colorStyle = 'bg-amber-500 text-white border-amber-500 shadow';
                                else colorStyle = 'bg-emerald-600 text-white border-emerald-600 shadow';
                              }

                              return (
                                <button
                                  type="button"
                                  key={score}
                                  onClick={() => handleAnswerChange(field.id, score)}
                                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-bold border transition-all ${colorStyle}`}
                                >
                                  {score}
                                </button>
                              );
                            })}
                          </div>
                          <div className="flex justify-between text-xs text-slate-500 font-medium">
                            <span className="text-rose-600">0 - Not at all likely</span>
                            <span className="text-emerald-600">10 - Extremely likely</span>
                          </div>
                        </div>
                      )}

                      {/* Date */}
                      {field.type === 'date' && (
                        <input
                          type="date"
                          value={answers[field.id] || ''}
                          onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                          className="w-full sm:w-60 text-sm bg-white border border-slate-200 focus:border-indigo-600 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        />
                      )}

                      {/* Time */}
                      {field.type === 'time' && (
                        <input
                          type="time"
                          value={answers[field.id] || ''}
                          onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                          className="w-full sm:w-48 text-sm bg-white border border-slate-200 focus:border-indigo-600 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        />
                      )}

                      {/* File Upload */}
                      {field.type === 'file_upload' && (
                        <div className="space-y-2">
                          <label className="border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/70 hover:bg-indigo-50/30 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
                            <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                            <span className="text-xs font-semibold text-slate-700">
                              {uploadedFiles[field.id] || 'Click to select or drag & drop files'}
                            </span>
                            <span className="text-[11px] text-slate-500 mt-1">
                              Supports PDF, PNG, JPG, DOCX (Max 10MB)
                            </span>
                            <input
                              type="file"
                              className="sr-only"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setUploadedFiles((prev) => ({ ...prev, [field.id]: file.name }));
                                  handleAnswerChange(field.id, `[Attached: ${file.name}]`);
                                }
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Error message */}
                    {hasError && (
                      <p className="text-xs text-rose-600 flex items-center gap-1 font-medium pt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors[field.id]}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Submit Action Bar */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="submit"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all hover:scale-101 active:scale-99 ${accentClasses.btn}`}
              >
                <span>Submit Response</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
              >
                Clear form
              </button>
            </div>
          </form>
        )}

        {/* Footer info badge */}
        <div className="pt-8 text-center text-xs text-slate-600 space-y-1">
          <p>
            Powered by <strong className="text-slate-600">Ecast Forms</strong> • Hosted on{' '}
            <span className="font-mono text-indigo-600 font-semibold">{form.settings.customDomain}</span>
          </p>
          <p className="text-[11px]">
            Never submit passwords or sensitive credentials through web forms.
          </p>
        </div>
      </div>
    </div>
  );
};
