import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Share2,
  FileSpreadsheet,
  FileCode,
  FileText,
  Webhook,
  Mail,
  QrCode,
  Code2,
  Globe,
  Zap,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Radio,
  Lock,
  Eye
} from 'lucide-react';
import { Form, FormSubmission } from '../types/form';
import { exportToCSV, exportToJSON, exportToTSV, simulateWebhookDispatch } from '../utils/export';
import { SurveyQRCode } from '../utils/qrCode';

interface ShareExportModalProps {
  form: Form;
  submissions: FormSubmission[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateForm: (updated: Form) => void;
  onOpenRespondentView?: () => void;
}

export const ShareExportModal: React.FC<ShareExportModalProps> = ({
  form,
  submissions,
  isOpen,
  onClose,
  onUpdateForm,
  onOpenRespondentView,
}) => {
  const [activeTab, setActiveTab] = useState<'share' | 'export' | 'webhook' | 'embed'>('share');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAltLink, setCopiedAltLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookResult, setWebhookResult] = useState<{
    success: boolean;
    status: number;
    message: string;
    payload?: any;
  } | null>(null);

  if (!isOpen) return null;

  const autoExport = form.settings?.autoExport || {
    enabled: true,
    frequency: 'realtime' as const,
    format: 'csv' as const,
    webhookUrl: 'https://api.ecast.store/v1/integrations/survey-webhook',
    emailRecipients: 'insights@ecast.store',
    totalAutoDispatched: 0,
  };

  const isLive = form.settings?.isLive ?? true;
  const customSlug = form.settings?.customSlug || 'survey-2026';
  const customDomain = form.settings?.customDomain || 'form.ecast.store';

  // Dedicated Respondent URLs (Read-Only)
  const publicProductionUrl = `https://${customDomain}/?s=${customSlug}`;
  const publicCurrentHostUrl = `${window.location.origin}/?s=${customSlug}`;
  const embedCode = `<iframe src="${publicProductionUrl}" width="100%" height="700" frameborder="0" marginheight="0" marginwidth="0" style="border-radius: 16px; border: 1px solid #e2e8f0; max-width: 800px; width: 100%;">Loading survey...</iframe>`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicProductionUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyAltLink = () => {
    navigator.clipboard.writeText(publicCurrentHostUrl);
    setCopiedAltLink(true);
    setTimeout(() => setCopiedAltLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const toggleGoLive = () => {
    const nextLive = !isLive;
    onUpdateForm({
      ...form,
      settings: {
        ...form.settings,
        isLive: nextLive,
        publishedAt: nextLive ? new Date().toISOString() : form.settings.publishedAt,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    setWebhookResult(null);

    const sampleSub = submissions[0] || {
      id: 'test_sub_preview',
      formId: form.id,
      submittedAt: new Date().toISOString(),
      durationSeconds: 120,
      device: 'Desktop',
      location: 'San Francisco, US',
      answers: {
        [form.fields[0]?.id || 'q1']: 'Sample Automated Response',
      },
    };

    const res = await simulateWebhookDispatch(
      autoExport.webhookUrl,
      form,
      sampleSub
    );

    setWebhookResult(res);
    setIsTestingWebhook(false);
  };

  const updateAutoExport = (patch: Partial<Form['settings']['autoExport']>) => {
    onUpdateForm({
      ...form,
      settings: {
        ...form.settings,
        autoExport: {
          ...autoExport,
          ...patch,
        },
      },
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isLive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Go Live & Share Respondent Link
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isLive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {isLive ? '● Live' : '○ Draft'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Share this link with respondents so they can only fill the survey without editing questions.
              </p>
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

        {/* Tab Switcher */}
        <div className="px-6 border-b border-slate-100 flex gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('share')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'share'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            Respondent Link & Go Live
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            Direct Export (CSV/JSON)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('webhook')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'webhook'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Webhook className="w-4 h-4" />
            Automated Webhook
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('embed')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'embed'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Embed iFrame
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: RESPONDENT LINK & GO LIVE */}
          {activeTab === 'share' && (
            <div className="space-y-5">
              {/* Go Live Toggle Card */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                isLive
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-amber-50/70 border-amber-200'
              }`}>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {isLive ? 'Survey is Live on the Web' : 'Survey is currently in Draft'}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                  </div>
                  <p className="text-slate-600 text-xs">
                    {isLive
                      ? 'Respondents with the link below can now fill out and submit responses.'
                      : 'Make this survey live so respondents can access and submit answers.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={toggleGoLive}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 shadow-xs ${
                    isLive
                      ? 'bg-white hover:bg-rose-50 text-rose-700 border border-slate-200 hover:border-rose-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:scale-101'
                  }`}
                >
                  {isLive ? 'Switch to Draft' : '🚀 Go Live Now'}
                </button>
              </div>

              {/* Protected Respondent Link Card */}
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-sm">
                      Public Respondent Link (Read-Only)
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    Protected: Cannot Edit Questions
                  </span>
                </div>

                <p className="text-slate-600 text-xs leading-relaxed">
                  Share this link with your audience. When opened, it only displays the survey questions. Respondents <strong>cannot edit</strong> questions, access the builder, or see your responses.
                </p>

                {/* Primary Production URL */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">
                    Production URL (for form.ecast.store):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={publicProductionUrl}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-xs text-indigo-700 font-semibold focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedLink ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                </div>

                {/* Current Host URL for immediate testing */}
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-semibold text-slate-600">
                    Current Environment Link (for immediate browser testing):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={publicCurrentHostUrl}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-xs text-slate-700 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyAltLink}
                      className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1 shrink-0"
                    >
                      {copiedAltLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedAltLink ? 'Copied' : 'Copy'}
                    </button>
                    <a
                      href={publicCurrentHostUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-slate-900 text-white rounded-xl font-semibold text-xs hover:bg-slate-800 transition-colors flex items-center gap-1 shrink-0"
                      title="Open in new tab to test respondent view"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Test as Respondent</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="border border-slate-200/90 rounded-2xl p-5 bg-white flex flex-col sm:flex-row items-center gap-6">
                <SurveyQRCode url={publicProductionUrl} size={135} />

                <div className="space-y-2 text-center sm:text-left">
                  <h5 className="font-bold text-slate-900 text-sm">Scan to Fill Survey</h5>
                  <p className="text-slate-500 text-xs max-w-xs leading-relaxed">
                    Print this QR code on flyers, packaging, menus, or slides. Respondents can scan from their phone and submit responses directly.
                  </p>
                  <div className="text-[11px] text-emerald-700 font-medium">
                    ✓ Directs to respondent mode only (no editor access)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DIRECT EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Download Survey Data</h4>
                <p className="text-slate-500 mt-0.5">
                  Export all {submissions.length} collected respondent entries in standard formats.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {/* CSV */}
                <button
                  type="button"
                  onClick={() => exportToCSV(form, submissions)}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 text-left transition-all shadow-xs group"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-800 group-hover:text-emerald-900 text-sm">
                    CSV Format
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Standard comma-separated spreadsheet for Excel, Numbers, and R
                  </div>
                </button>

                {/* JSON */}
                <button
                  type="button"
                  onClick={() => exportToJSON(form, submissions)}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 text-left transition-all shadow-xs group"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-800 group-hover:text-indigo-900 text-sm">
                    JSON Dataset
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Full structured JSON schema with questions & submission timestamps
                  </div>
                </button>

                {/* TSV */}
                <button
                  type="button"
                  onClick={() => exportToTSV(form, submissions)}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/30 text-left transition-all shadow-xs group"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-800 group-hover:text-amber-900 text-sm">
                    TSV (Sheets)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Tab-separated format optimized for instant paste into Google Sheets
                  </div>
                </button>
              </div>

              {/* Status Note */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-700">Accepting Responses</span>
                  <p className="text-slate-500 text-[11px]">
                    Turn off when survey has reached its quota or timeline.
                  </p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.settings.isAcceptingResponses}
                    onChange={(e) =>
                      onUpdateForm({
                        ...form,
                        settings: {
                          ...form.settings,
                          isAcceptingResponses: e.target.checked,
                        },
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-6 rounded-full transition-colors relative ${
                      form.settings.isAcceptingResponses ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        form.settings.isAcceptingResponses ? 'left-5' : 'left-1'
                      }`}
                    />
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: AUTOMATED WEBHOOK & SYNC */}
          {activeTab === 'webhook' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Automated Real-Time Dispatch</h4>
                  <p className="text-slate-500 mt-0.5">
                    Automatically deliver new responses directly to your webhooks, Zapier, or API endpoint.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="font-semibold text-slate-700">Auto-Export</span>
                  <input
                    type="checkbox"
                    checked={autoExport.enabled}
                    onChange={(e) => updateAutoExport({ enabled: e.target.checked })}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-6 rounded-full transition-colors relative ${
                      autoExport.enabled ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        autoExport.enabled ? 'left-5' : 'left-1'
                      }`}
                    />
                  </div>
                </label>
              </div>

              {/* Webhook URL Input */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Webhook Endpoint URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={autoExport.webhookUrl}
                    onChange={(e) => updateAutoExport({ webhookUrl: e.target.value })}
                    placeholder="https://api.ecast.store/v1/integrations/survey-webhook"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    disabled={isTestingWebhook}
                    onClick={handleTestWebhook}
                    className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {isTestingWebhook ? 'Testing...' : 'Test Webhook'}
                  </button>
                </div>
              </div>

              {/* Webhook Test Result */}
              {webhookResult && (
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                    webhookResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {webhookResult.success ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">{webhookResult.message}</div>
                    <div className="text-[11px] mt-1 font-mono text-slate-600">
                      Payload: <code>form_submission.created</code> • ID:{' '}
                      <code>{webhookResult.payload?.submission?.id}</code>
                    </div>
                  </div>
                </div>
              )}

              {/* Frequency & Email Recipient */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Sync Cadence</label>
                  <select
                    value={autoExport.frequency}
                    onChange={(e) => updateAutoExport({ frequency: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="realtime">Real-time (Instant per submission)</option>
                    <option value="daily">Daily Consolidated Batch</option>
                    <option value="weekly">Weekly Summary Report</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Notification Emails</label>
                  <input
                    type="text"
                    value={autoExport.emailRecipients}
                    onChange={(e) => updateAutoExport({ emailRecipients: e.target.value })}
                    placeholder="insights@ecast.store"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Telemetry info */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-slate-600 text-[11px] flex items-center justify-between">
                <span>Total Dispatched Submissions:</span>
                <span className="font-bold font-mono text-indigo-600">
                  {autoExport.totalAutoDispatched || 0} calls
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: EMBED IFRAME */}
          {activeTab === 'embed' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Embed Survey on Your Website</h4>
                <p className="text-slate-500 mt-0.5">
                  Paste this snippet into WordPress, Webflow, Shopify, or any HTML page.
                </p>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-900 text-indigo-200 rounded-2xl text-[11px] font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {embedCode}
                </pre>
                <button
                  type="button"
                  onClick={handleCopyEmbed}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 backdrop-blur transition-all"
                >
                  {copiedEmbed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedEmbed ? 'Copied' : 'Copy Code'}
                </button>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 text-slate-500 text-[11px]">
                Tip: Embedded surveys only render the respondent view. Visitors cannot access your editing studio or edit questions.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span className="font-semibold text-slate-700">form.ecast.store</span>
            <span>•</span>
            <span>Respondent-only link generation</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
