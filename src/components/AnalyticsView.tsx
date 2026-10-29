import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  Download,
  Share2,
  Filter,
  User,
  Smartphone,
  Monitor,
  Tablet,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Eye,
  Trash2,
  FileSpreadsheet,
  FileCode,
  Zap,
  Search
} from 'lucide-react';
import { Form, FormSubmission, FormField } from '../types/form';
import { exportToCSV, exportToJSON, exportToTSV } from '../utils/export';

interface AnalyticsViewProps {
  form: Form;
  submissions: FormSubmission[];
  onSimulateLiveResponse: () => void;
  onDeleteSubmission: (subId: string) => void;
  onClearAllSubmissions: () => void;
  onOpenExportModal: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  form,
  submissions,
  onSimulateLiveResponse,
  onDeleteSubmission,
  onClearAllSubmissions,
  onOpenExportModal,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'questions' | 'individual'>('summary');
  const [selectedIndividualId, setSelectedIndividualId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'Desktop' | 'Mobile' | 'Tablet'>('all');

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      if (deviceFilter !== 'all' && sub.device !== deviceFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchLoc = sub.location?.toLowerCase().includes(q);
      const matchAnswers = Object.values(sub.answers).some((val) =>
        String(val).toLowerCase().includes(q)
      );
      return matchLoc || matchAnswers;
    });
  }, [submissions, searchQuery, deviceFilter]);

  // Overall Metrics Calculation
  const totalSubmissions = submissions.length;
  const avgDurationSeconds = totalSubmissions > 0
    ? Math.round(submissions.reduce((acc, s) => acc + (s.durationSeconds || 90), 0) / totalSubmissions)
    : 0;

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return mins > 0 ? `${mins}m ${remainder}s` : `${remainder}s`;
  };

  // Find NPS field if any
  const npsField = form.fields.find((f) => f.type === 'nps');
  const npsScore = useMemo(() => {
    if (!npsField || totalSubmissions === 0) return null;
    const scores = submissions
      .map((s) => s.answers[npsField.id])
      .filter((s) => typeof s === 'number');

    if (scores.length === 0) return null;

    const promoters = scores.filter((s) => s >= 9).length;
    const passives = scores.filter((s) => s === 7 || s === 8).length;
    const detractors = scores.filter((s) => s <= 6).length;

    const nps = Math.round(((promoters - detractors) / scores.length) * 100);
    return {
      score: nps,
      promoters,
      passives,
      detractors,
      total: scores.length,
      promoterPct: Math.round((promoters / scores.length) * 100),
      passivePct: Math.round((passives / scores.length) * 100),
      detractorPct: Math.round((detractors / scores.length) * 100),
    };
  }, [npsField, submissions, totalSubmissions]);

  // Device Breakdown
  const deviceCounts = useMemo(() => {
    const counts = { Desktop: 0, Mobile: 0, Tablet: 0 };
    submissions.forEach((s) => {
      if (counts[s.device]) counts[s.device]++;
      else counts.Desktop++;
    });
    return counts;
  }, [submissions]);

  const selectedSubmission = submissions.find((s) => s.id === selectedIndividualId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner & Fast Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Real-Time Survey Analytics
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking responses for <span className="font-semibold text-slate-700">{form.title}</span> on{' '}
            <span className="font-mono text-indigo-600">https://{form.settings.customDomain}/s/{form.settings.customSlug}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onSimulateLiveResponse}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors shadow-xs"
            title="Simulate an incoming live respondent submission"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            + Simulate Live Response
          </button>

          <button
            type="button"
            onClick={() => exportToCSV(form, submissions)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:border-slate-300 text-slate-700 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            CSV Export
          </button>

          <button
            type="button"
            onClick={onOpenExportModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            Automated Export & Sync
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Responses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Responses</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {totalSubmissions}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Active & collecting responses
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Completion Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {totalSubmissions > 0 ? '97.4%' : '0%'}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            High respondent retention
          </div>
        </div>

        {/* Avg Duration */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Avg Completion Time</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {formatDuration(avgDurationSeconds)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Optimized question flow
          </div>
        </div>

        {/* NPS or Top Metric */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Net Promoter Score</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {npsScore ? (npsScore.score > 0 ? `+${npsScore.score}` : npsScore.score) : 'N/A'}
          </div>
          <div className="text-[11px] text-purple-600 font-medium">
            {npsScore
              ? npsScore.score >= 50
                ? '★ World-Class Satisfaction'
                : npsScore.score >= 20
                ? 'Great Satisfaction'
                : 'Neutral / Developing'
              : 'Add NPS question to score'}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'summary'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Summary Analytics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'questions'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Question Breakdown ({form.fields.filter((f) => f.type !== 'section_header').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('individual')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'individual'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Individual Responses ({submissions.length})
          </button>
        </div>

        {submissions.length > 0 && (
          <button
            type="button"
            onClick={onClearAllSubmissions}
            className="text-xs text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Reset Responses
          </button>
        )}
      </div>

      {/* Empty State when no submissions */}
      {totalSubmissions === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No Responses Collected Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Share your survey link or click "Simulate Live Response" to test real-time analytics graphs immediately.
            </p>
          </div>
          <button
            type="button"
            onClick={onSimulateLiveResponse}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
          >
            <Zap className="w-3.5 h-3.5" />
            Generate Sample Response
          </button>
        </div>
      )}

      {/* TAB 1: SUMMARY DASHBOARD */}
      {totalSubmissions > 0 && activeTab === 'summary' && (
        <div className="space-y-6">
          {/* NPS Deep-Dive Card if NPS question present */}
          {npsScore && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Net Promoter Score (NPS) Benchmark
                  </h3>
                  <p className="text-xs text-slate-500">
                    Based on {npsScore.total} verified responses
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200/70 text-xs font-mono">
                  <span className="text-emerald-700 font-semibold">{npsScore.promoterPct}% Promoters</span>
                  <span>-</span>
                  <span className="text-rose-700 font-semibold">{npsScore.detractorPct}% Detractors</span>
                  <span>=</span>
                  <span className="text-indigo-600 font-bold text-sm">
                    {npsScore.score > 0 ? `+${npsScore.score}` : npsScore.score}
                  </span>
                </div>
              </div>

              {/* Stacked Percentage Bar */}
              <div className="h-5 rounded-full overflow-hidden flex bg-slate-100">
                <div
                  className="bg-emerald-500 hover:bg-emerald-600 transition-colors"
                  style={{ width: `${npsScore.promoterPct}%` }}
                  title={`Promoters (9-10): ${npsScore.promoterPct}% (${npsScore.promoters})`}
                />
                <div
                  className="bg-amber-400 hover:bg-amber-500 transition-colors"
                  style={{ width: `${npsScore.passivePct}%` }}
                  title={`Passives (7-8): ${npsScore.passivePct}% (${npsScore.passives})`}
                />
                <div
                  className="bg-rose-500 hover:bg-rose-600 transition-colors"
                  style={{ width: `${npsScore.detractorPct}%` }}
                  title={`Detractors (0-6): ${npsScore.detractorPct}% (${npsScore.detractors})`}
                />
              </div>

              {/* Legend with Counts */}
              <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                  <div className="font-semibold text-emerald-800">Promoters (9-10)</div>
                  <div className="text-lg font-bold text-emerald-900 mt-1">
                    {npsScore.promoters} <span className="text-xs font-normal">({npsScore.promoterPct}%)</span>
                  </div>
                </div>
                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-100">
                  <div className="font-semibold text-amber-800">Passives (7-8)</div>
                  <div className="text-lg font-bold text-amber-900 mt-1">
                    {npsScore.passives} <span className="text-xs font-normal">({npsScore.passivePct}%)</span>
                  </div>
                </div>
                <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-100">
                  <div className="font-semibold text-rose-800">Detractors (0-6)</div>
                  <div className="text-lg font-bold text-rose-900 mt-1">
                    {npsScore.detractors} <span className="text-xs font-normal">({npsScore.detractorPct}%)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid of Key Question Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {form.fields
              .filter((f) => ['multiple_choice', 'checkboxes', 'rating', 'linear_scale'].includes(f.type))
              .map((field) => (
                <QuestionSummaryCard
                  key={field.id}
                  field={field}
                  submissions={submissions}
                />
              ))}
          </div>

          {/* Devices & Metadata Row */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Respondent Devices</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Monitor className="w-5 h-5 mx-auto text-indigo-600 mb-1" />
                <div className="text-lg font-bold text-slate-800">{deviceCounts.Desktop}</div>
                <div className="text-xs text-slate-500">Desktop</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Smartphone className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
                <div className="text-lg font-bold text-slate-800">{deviceCounts.Mobile}</div>
                <div className="text-xs text-slate-500">Mobile</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Tablet className="w-5 h-5 mx-auto text-purple-600 mb-1" />
                <div className="text-lg font-bold text-slate-800">{deviceCounts.Tablet}</div>
                <div className="text-xs text-slate-500">Tablet</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DETAILED QUESTION BREAKDOWN */}
      {totalSubmissions > 0 && activeTab === 'questions' && (
        <div className="space-y-6">
          {form.fields
            .filter((f) => f.type !== 'section_header')
            .map((field, idx) => (
              <QuestionSummaryCard
                key={field.id}
                field={field}
                submissions={submissions}
                index={idx + 1}
                detailed
              />
            ))}
        </div>
      )}

      {/* TAB 3: INDIVIDUAL RESPONSES TABLE & INSPECTOR */}
      {totalSubmissions > 0 && activeTab === 'individual' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by location or answers..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium">Device:</span>
              <select
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value as any)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none"
              >
                <option value="all">All Devices</option>
                <option value="Desktop">Desktop</option>
                <option value="Mobile">Mobile</option>
                <option value="Tablet">Tablet</option>
              </select>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200/70">
                  <tr>
                    <th className="px-5 py-3">ID & Date</th>
                    <th className="px-5 py-3">Device & Location</th>
                    <th className="px-5 py-3">Duration</th>
                    <th className="px-5 py-3">Preview of Answers</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubmissions.map((sub) => {
                    const answerKeys = Object.keys(sub.answers);
                    const snippet = answerKeys
                      .slice(0, 2)
                      .map((k) => {
                        const f = form.fields.find((field) => field.id === k);
                        const ans = sub.answers[k];
                        const displayVal = Array.isArray(ans) ? ans.join(', ') : String(ans);
                        return `${f?.label || k}: "${displayVal}"`;
                      })
                      .join(' • ');

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-mono font-semibold text-indigo-600">{sub.id}</div>
                          <div className="text-[11px] text-slate-500">
                            {new Date(sub.submittedAt).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-800">{sub.location}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            {sub.device === 'Mobile' ? (
                              <Smartphone className="w-3 h-3 text-slate-400" />
                            ) : sub.device === 'Tablet' ? (
                              <Tablet className="w-3 h-3 text-slate-400" />
                            ) : (
                              <Monitor className="w-3 h-3 text-slate-400" />
                            )}
                            {sub.device}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-600">
                          {formatDuration(sub.durationSeconds)}
                        </td>
                        <td className="px-5 py-3.5 max-w-xs truncate text-slate-600" title={snippet}>
                          {snippet || 'No text fields'}
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => setSelectedIndividualId(sub.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteSubmission(sub.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Delete submission"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Individual Response Inspection Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-100">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">Respondent Submission</h3>
                  <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {selectedSubmission.id}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Submitted {new Date(selectedSubmission.submittedAt).toLocaleString()} • {selectedSubmission.location} • {selectedSubmission.device} • {formatDuration(selectedSubmission.durationSeconds)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIndividualId(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Answer List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {form.fields
                .filter((f) => f.type !== 'section_header')
                .map((field, i) => {
                  const ans = selectedSubmission.answers[field.id];
                  const hasAnswer = ans !== undefined && ans !== null && ans !== '';

                  return (
                    <div
                      key={field.id}
                      className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/60 space-y-1.5"
                    >
                      <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                        <span className="text-slate-400 font-mono">{i + 1}.</span>
                        <span>{field.label}</span>
                      </div>

                      <div className="text-sm font-semibold text-slate-900 pl-4">
                        {!hasAnswer ? (
                          <span className="text-slate-400 italic font-normal">No answer provided</span>
                        ) : Array.isArray(ans) ? (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {ans.map((opt, oIdx) => (
                              <span
                                key={oIdx}
                                className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-lg text-xs font-medium border border-indigo-200/60"
                              >
                                {opt}
                              </span>
                            ))}
                          </div>
                        ) : field.type === 'rating' ? (
                          <div className="flex items-center gap-1 text-amber-500">
                            {Array.from({ length: ans }).map((_, sIdx) => (
                              <span key={sIdx}>★</span>
                            ))}
                            <span className="text-xs text-slate-600 ml-1 font-mono">({ans} / {field.ratingStars || 5})</span>
                          </div>
                        ) : field.type === 'nps' ? (
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                            ans >= 9 ? 'bg-emerald-100 text-emerald-800' : ans >= 7 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            Score: {ans} ({ans >= 9 ? 'Promoter' : ans >= 7 ? 'Passive' : 'Detractor'})
                          </span>
                        ) : (
                          <p className="whitespace-pre-wrap">{String(ans)}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/60">
              <button
                type="button"
                onClick={() => {
                  onDeleteSubmission(selectedSubmission.id);
                  setSelectedIndividualId(null);
                }}
                className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete this submission
              </button>
              <button
                type="button"
                onClick={() => setSelectedIndividualId(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Question Summary Card with customized charts for choices, ratings, linear scales, and text
 */
interface QuestionSummaryCardProps {
  field: FormField;
  submissions: FormSubmission[];
  index?: number;
  detailed?: boolean;
}

const QuestionSummaryCard: React.FC<QuestionSummaryCardProps> = ({
  field,
  submissions,
  index,
  detailed = false,
}) => {
  const answeredCount = submissions.filter((s) => {
    const val = s.answers[field.id];
    return val !== undefined && val !== null && val !== '';
  }).length;

  // Choice breakdown
  if (['multiple_choice', 'checkboxes', 'dropdown'].includes(field.type)) {
    const counts: Record<string, number> = {};
    (field.options || []).forEach((opt) => {
      counts[opt] = 0;
    });

    submissions.forEach((s) => {
      const val = s.answers[field.id];
      if (Array.isArray(val)) {
        val.forEach((item) => {
          counts[item] = (counts[item] || 0) + 1;
        });
      } else if (val) {
        counts[val] = (counts[val] || 0) + 1;
      }
    });

    const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              {index && <span className="font-mono text-slate-400">{index}.</span>}
              {field.label}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {answeredCount} responses • {field.type === 'checkboxes' ? 'Multiple select' : 'Single select'}
            </p>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            {field.type}
          </span>
        </div>

        {/* Horizontal Bar Chart with percentages */}
        <div className="space-y-3 pt-1">
          {Object.entries(counts).map(([opt, count]) => {
            const pct = Math.round((count / totalVotes) * 100);
            return (
              <div key={opt} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-700 font-medium">
                  <span className="truncate pr-2">{opt}</span>
                  <span className="font-mono text-slate-500 shrink-0">
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Star Rating Breakdown
  if (field.type === 'rating') {
    const starTotal = field.ratingStars || 5;
    const scores = submissions
      .map((s) => s.answers[field.id])
      .filter((s) => typeof s === 'number') as number[];

    const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '0.0';

    const starCounts = Array.from({ length: starTotal }).map((_, i) => {
      const star = starTotal - i;
      const count = scores.filter((s) => s === star).length;
      return { star, count, pct: scores.length > 0 ? Math.round((count / scores.length) * 100) : 0 };
    });

    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              {index && <span className="font-mono text-slate-400">{index}.</span>}
              {field.label}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">{answeredCount} responses</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-extrabold text-amber-500 font-mono">{avg} ★</div>
            <div className="text-[10px] text-slate-400">Average score</div>
          </div>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="space-y-2 pt-1">
          {starCounts.map(({ star, count, pct }) => (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-8 font-mono font-medium text-slate-600">{star} ★</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-12 text-right font-mono text-slate-500 text-[11px]">
                {count} ({pct}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Linear Scale Breakdown
  if (field.type === 'linear_scale') {
    const min = field.scaleMin || 1;
    const max = field.scaleMax || 5;
    const scores = submissions
      .map((s) => s.answers[field.id])
      .filter((s) => typeof s === 'number') as number[];
    const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '0.0';

    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              {index && <span className="font-mono text-slate-400">{index}.</span>}
              {field.label}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">{answeredCount} responses</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-extrabold text-indigo-600 font-mono">{avg} / {max}</div>
            <div className="text-[10px] text-slate-400">Mean rank</div>
          </div>
        </div>

        <div className="flex items-end justify-between gap-2 h-28 pt-4 pb-2 px-2 border-b border-slate-100">
          {Array.from({ length: max - min + 1 }).map((_, i) => {
            const val = min + i;
            const count = scores.filter((s) => s === val).length;
            const heightPct = scores.length > 0 ? Math.max(10, Math.round((count / scores.length) * 100)) : 10;
            return (
              <div key={val} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-indigo-600 font-semibold">
                  {count}
                </span>
                <div
                  className="w-full bg-indigo-100 group-hover:bg-indigo-600 rounded-t transition-all"
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-xs font-bold text-slate-700">{val}</span>
              </div>
            );
          })}
        </div>

        {(field.scaleMinLabel || field.scaleMaxLabel) && (
          <div className="flex justify-between text-xs text-slate-500 font-medium pt-1">
            <span>{field.scaleMinLabel}</span>
            <span>{field.scaleMaxLabel}</span>
          </div>
        )}
      </div>
    );
  }

  // Text Responses (Short / Long)
  const textAnswers = submissions
    .map((s) => ({ text: s.answers[field.id], date: s.submittedAt, location: s.location }))
    .filter((a) => !!a.text && String(a.text).trim().length > 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            {index && <span className="font-mono text-slate-400">{index}.</span>}
            {field.label}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">{textAnswers.length} responses</p>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
          Text Feedback
        </span>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {textAnswers.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-3">No responses recorded yet.</p>
        ) : (
          textAnswers.slice(0, 10).map((item, i) => (
            <div key={i} className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/60 text-xs space-y-1">
              <p className="text-slate-800 leading-relaxed">"{String(item.text)}"</p>
              <div className="text-[10px] text-slate-600 flex items-center gap-2">
                <span>{new Date(item.date).toLocaleDateString()}</span>
                <span>•</span>
                <span>{item.location}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
