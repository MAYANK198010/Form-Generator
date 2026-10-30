import React, { useState } from 'react';
import {
  FileText,
  Palette,
  Eye,
  Share2,
  FolderOpen,
  Plus,
  Sparkles,
  BarChart2,
  Sliders,
  ChevronDown,
  Layers,
  Radio,
  Globe,
  Check,
  Copy,
  ExternalLink,
  ShieldAlert,
  User as UserIcon,
  Cloud,
} from 'lucide-react';
import { Form } from '../types/form';
import { FirebaseUser } from '../lib/firebase';

interface HeaderProps {
  currentForm: Form;
  allForms: Form[];
  currentMode: 'builder' | 'analytics' | 'preview';
  responseCount: number;
  currentUser: FirebaseUser | null;
  onOpenAuthModal: () => void;
  onSelectMode: (mode: 'builder' | 'analytics' | 'preview') => void;
  onOpenTheme: () => void;
  onOpenExport: () => void;
  onOpenFormSwitcher: () => void;
  onNewForm: () => void;
  onToggleLive: () => void;
  onOpenPublicLink: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentForm,
  allForms,
  currentMode,
  responseCount,
  currentUser,
  onOpenAuthModal,
  onSelectMode,
  onOpenTheme,
  onOpenExport,
  onOpenFormSwitcher,
  onNewForm,
  onToggleLive,
  onOpenPublicLink,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const isLive = currentForm.settings.isLive;

  const handleCopyRespondentLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const respondentUrl = `${window.location.origin}/?s=${currentForm.settings.customSlug}`;
    navigator.clipboard.writeText(respondentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          {/* Brand & Form Selector */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <FileText className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenFormSwitcher}
                className="group flex items-center gap-1.5 text-left rounded-lg py-1 px-1.5 -ml-1.5 hover:bg-slate-100 transition-colors"
                title="Switch or create surveys"
              >
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                    <span>Ecast Studio</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-mono lowercase">form.ecast.store</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm font-bold text-slate-900 truncate max-w-[140px] sm:max-w-[220px]">
                      {currentForm.title || 'Untitled Survey'}
                    </h1>
                    {/* Live/Draft Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        isLive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                        }`}
                      />
                      {isLive ? 'Live' : 'Draft'}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
              </button>
            </div>
          </div>

          {/* Center Tabs: Builder vs Analytics */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => onSelectMode('builder')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentMode === 'builder'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Questions
            </button>
            <button
              type="button"
              onClick={() => onSelectMode('analytics')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentMode === 'analytics'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Responses</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  currentMode === 'analytics'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {responseCount}
              </span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mobile Tab Toggle */}
            <div className="flex md:hidden items-center bg-slate-100 p-0.5 rounded-lg mr-1">
              <button
                type="button"
                onClick={() => onSelectMode('builder')}
                className={`px-2 py-1 rounded text-[11px] font-bold ${
                  currentMode === 'builder' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onSelectMode('analytics')}
                className={`px-2 py-1 rounded text-[11px] font-bold ${
                  currentMode === 'analytics' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Stats ({responseCount})
              </button>
            </div>

            {/* Theme / Style */}
            <button
              type="button"
              onClick={onOpenTheme}
              className="p-2 text-slate-500 hover:text-indigo-600 rounded-xl hover:bg-slate-100 transition-colors"
              title="Customize theme styling"
            >
              <Palette className="w-4 h-4" />
            </button>

            {/* Preview Form as Respondent */}
            <button
              type="button"
              onClick={() => onSelectMode('preview')}
              className="p-2 text-slate-500 hover:text-indigo-600 rounded-xl hover:bg-slate-100 transition-colors hidden sm:flex items-center gap-1 text-xs font-semibold"
              title="Preview live respondent view"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>

            {/* "Go Live" Primary Action Toggle */}
            <button
              type="button"
              onClick={onToggleLive}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                isLive
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:scale-101 active:scale-99'
              }`}
              title={
                isLive
                  ? 'Survey is Live! Click to pause or switch back to Draft'
                  : 'Click to make this survey LIVE for respondents'
              }
            >
              <Radio className={`w-3.5 h-3.5 ${isLive ? 'text-emerald-600 animate-pulse' : 'text-white'}`} />
              <span>{isLive ? 'Live & Active' : 'Go Live 🚀'}</span>
            </button>

            {/* Share / Export CTA Button */}
            <button
              type="button"
              onClick={onOpenExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm hover:shadow"
              title="Get public respondent link, QR code, or export data"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share Link</span>
              <span className="sm:hidden">Share</span>
            </button>

            {/* Cloud Account & Multi-Device Sync Button */}
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-700 transition-all"
              title={currentUser ? `Logged in as ${currentUser.email || 'Creator'} (Synced)` : 'Sign in to sync surveys across devices'}
            >
              {currentUser ? (
                <>
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : currentUser.email ? currentUser.email[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden md:inline max-w-[100px] truncate text-[11px] font-medium">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                </>
              ) : (
                <>
                  <UserIcon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline text-xs font-bold text-indigo-600">Sign In</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
