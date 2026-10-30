/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Form, FormSubmission } from './types/form';
import {
  loadStoredForms,
  saveStoredForms,
  loadSubmissions,
  saveSubmissions,
  addSubmission,
  loadActiveFormId,
  saveActiveFormId,
  SAMPLE_FORMS,
  normalizeForm,
} from './utils/storage';
import {
  auth,
  onAuthStateChanged,
  FirebaseUser,
} from './lib/firebase';
import {
  saveFormToCloud,
  fetchUserFormsFromCloud,
  fetchPublicFormBySlug,
  submitResponseToCloud,
  subscribeToSubmissions,
  deleteFormFromCloud,
} from './services/cloudService';
import { Header } from './components/Header';
import { FormBuilder } from './components/FormBuilder';
import { AnalyticsView } from './components/AnalyticsView';
import { SurveyTaker } from './components/SurveyTaker';
import { ShareExportModal } from './components/ShareExportModal';
import { ThemeModal } from './components/ThemeModal';
import { FormsListModal } from './components/FormsListModal';
import { AuthModal } from './components/AuthModal';
import {
  CheckCircle2,
  Zap,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface RouteState {
  isRespondentView: boolean;
  slug: string | null;
}

function parseCurrentRoute(): RouteState {
  try {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash || '';
    const path = window.location.pathname || '';

    // 1. Query parameter: ?s=slug or ?form=slug or ?respond=slug
    const querySlug = params.get('s') || params.get('form') || params.get('respond');
    if (querySlug) {
      return { isRespondentView: true, slug: querySlug.trim().toLowerCase() };
    }

    // 2. Path: /s/slug
    const pathMatch = path.match(/^\/s\/([a-zA-Z0-9_-]+)/);
    if (pathMatch) {
      return { isRespondentView: true, slug: pathMatch[1].trim().toLowerCase() };
    }

    // 3. Hash: #/s/slug or #s=slug
    const hashMatch = hash.match(/#\/?s\/?=?([a-zA-Z0-9_-]+)/);
    if (hashMatch) {
      return { isRespondentView: true, slug: hashMatch[1].trim().toLowerCase() };
    }
  } catch (e) {
    console.warn('Error parsing route:', e);
  }

  return { isRespondentView: false, slug: null };
}

export default function App() {
  const [forms, setForms] = useState<Form[]>(() => {
    const loaded = loadStoredForms();
    return loaded && loaded.length > 0 ? loaded : SAMPLE_FORMS;
  });
  const [activeFormId, setActiveFormId] = useState<string>(() => loadActiveFormId());
  const [submissionsMap, setSubmissionsMap] = useState<Record<string, FormSubmission[]>>(() =>
    loadSubmissions()
  );
  const [currentMode, setCurrentMode] = useState<'builder' | 'analytics' | 'preview'>('builder');
  const [routeState, setRouteState] = useState<RouteState>(() => parseCurrentRoute());

  // Authentication & Cloud Sync State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Respondent View Cloud Fetching
  const [publicCloudForm, setPublicCloudForm] = useState<Form | null>(null);
  const [isPublicLoading, setIsPublicLoading] = useState(false);
  const [publicFetchAttempted, setPublicFetchAttempted] = useState(false);

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isFormSwitcherOpen, setIsFormSwitcherOpen] = useState(false);
  const [liveToast, setLiveToast] = useState<string | null>(null);

  // Listen to popstate / url changes
  useEffect(() => {
    const handleUrlChange = () => {
      setRouteState(parseCurrentRoute());
      setPublicFetchAttempted(false);
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const cloudForms = await fetchUserFormsFromCloud(user);
          if (cloudForms && cloudForms.length > 0) {
            setForms((prev) => {
              const map = new Map<string, Form>();
              cloudForms.forEach((f) => map.set(f.id, f));
              prev.forEach((f) => {
                if (!map.has(f.id)) map.set(f.id, f);
              });
              return Array.from(map.values());
            });
          }
        } catch (e) {
          console.warn('Failed to fetch user forms on login:', e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Persist forms to local storage
  useEffect(() => {
    saveStoredForms(forms);
  }, [forms]);

  // Persist active form id
  useEffect(() => {
    saveActiveFormId(activeFormId);
  }, [activeFormId]);

  // Persist submissions locally
  useEffect(() => {
    saveSubmissions(submissionsMap);
  }, [submissionsMap]);

  // Active Form resolution - always normalized
  const rawForm = forms.find((f) => f.id === activeFormId) || forms[0] || SAMPLE_FORMS[0];
  const currentForm = normalizeForm(rawForm);
  const activeSubmissions = submissionsMap[currentForm.id] || [];

  // Automatically sync active form to cloud so it is immediately accessible from QR codes or any device
  useEffect(() => {
    if (currentForm) {
      saveFormToCloud(currentForm, currentUser).catch((e) => {
        // Silent background sync
      });
    }
  }, [currentForm.id, currentForm.settings.customSlug, currentForm.settings.isLive]);

  // Real-time Firestore Submissions Listener
  useEffect(() => {
    if (!currentForm?.id) return;
    const unsubscribe = subscribeToSubmissions(currentForm.id, (subs) => {
      if (subs && subs.length > 0) {
        setSubmissionsMap((prev) => ({
          ...prev,
          [currentForm.id]: subs,
        }));
      }
    });
    return () => unsubscribe();
  }, [currentForm?.id]);

  // Public Respondent View: Query Firestore if not present locally (fixes "in other device not found")
  useEffect(() => {
    if (routeState.isRespondentView && routeState.slug) {
      const slug = routeState.slug.toLowerCase().trim();
      const local = forms.find(
        (f) =>
          f.settings.customSlug.toLowerCase() === slug ||
          f.id.toLowerCase() === slug
      );

      if (local) {
        setPublicCloudForm(normalizeForm(local));
        setIsPublicLoading(false);
        setPublicFetchAttempted(true);
      } else {
        setIsPublicLoading(true);
        fetchPublicFormBySlug(slug)
          .then((cloudForm) => {
            if (cloudForm) {
              setPublicCloudForm(cloudForm);
            } else {
              setPublicCloudForm(null);
            }
          })
          .catch((err) => {
            console.error('Error fetching public form from Firestore:', err);
            setPublicCloudForm(null);
          })
          .finally(() => {
            setIsPublicLoading(false);
            setPublicFetchAttempted(true);
          });
      }
    }
  }, [routeState.isRespondentView, routeState.slug, forms]);

  const handleUpdateCurrentForm = (updated: Form) => {
    setForms((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    saveFormToCloud(updated, currentUser).catch((e) => {
      console.warn('Auto-save to cloud warning:', e);
    });
  };

  const handleSelectForm = (formId: string) => {
    setActiveFormId(formId);
  };

  const handleToggleGoLive = () => {
    const nextLive = !currentForm.settings.isLive;
    const updated: Form = {
      ...currentForm,
      settings: {
        ...currentForm.settings,
        isLive: nextLive,
        publishedAt: nextLive ? new Date().toISOString() : currentForm.settings.publishedAt,
      },
      updatedAt: new Date().toISOString(),
    };

    handleUpdateCurrentForm(updated);

    if (nextLive) {
      setLiveToast(`🚀 Survey is now LIVE! Your public respondent link is ready to share.`);
      setIsExportModalOpen(true);
      import('canvas-confetti').then((mod) => {
        const fn = mod.default || mod;
        if (typeof fn === 'function') {
          fn({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        }
      }).catch(() => {});
    } else {
      setLiveToast(`Survey switched to Draft. Public respondents can no longer access it.`);
    }

    setTimeout(() => setLiveToast(null), 4500);
  };

  const handleCreateNewForm = (templateType: 'csat' | 'event' | 'product' | 'blank' = 'blank') => {
    const newId = 'form_' + Math.random().toString(36).substring(2, 9);
    let newForm: Form;

    if (templateType === 'csat') {
      newForm = {
        ...SAMPLE_FORMS[0],
        id: newId,
        title: 'Customer Satisfaction Survey (CSAT)',
        settings: {
          ...SAMPLE_FORMS[0].settings,
          customSlug: 'csat-' + Math.floor(Math.random() * 900 + 100),
          isLive: true,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else if (templateType === 'event') {
      newForm = {
        ...SAMPLE_FORMS[1],
        id: newId,
        title: 'Event RSVP & Workshop Registration',
        settings: {
          ...SAMPLE_FORMS[1].settings,
          customSlug: 'rsvp-' + Math.floor(Math.random() * 900 + 100),
          isLive: true,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else if (templateType === 'product') {
      newForm = {
        id: newId,
        title: 'Product Usability & Feature Feedback',
        description: 'Help us shape the future roadmap by rating your daily experience.',
        theme: {
          accentColor: 'violet',
          fontFamily: 'sans',
          borderRadius: 'rounded-xl' as any,
          showProgressBar: true,
        },
        settings: {
          title: 'Product Usability & Feature Feedback',
          description: 'Help us shape the future roadmap by rating your daily experience.',
          customDomain: 'form.ecast.store',
          customSlug: 'product-feedback-' + Math.floor(Math.random() * 900 + 100),
          isLive: true,
          publishedAt: new Date().toISOString(),
          isAcceptingResponses: true,
          closedMessage: 'Responses closed.',
          confirmationMessage: 'Thank you for helping us build better products!',
          allowMultipleSubmissions: true,
          showQuestionNumbers: true,
          autoExport: {
            enabled: true,
            frequency: 'realtime',
            format: 'csv',
            webhookUrl: 'https://api.ecast.store/v1/integrations/product-pulse',
            emailRecipients: 'product@ecast.store',
            totalAutoDispatched: 0,
          },
        },
        fields: [
          {
            id: 'q_role',
            type: 'dropdown',
            label: 'What is your primary role?',
            required: true,
            options: ['Software Engineer', 'Product Designer', 'Manager', 'Analyst', 'Founder'],
          },
          {
            id: 'q_speed',
            type: 'rating',
            label: 'How would you rate the speed and performance?',
            required: true,
            ratingStars: 5,
          },
          {
            id: 'q_nps',
            type: 'nps',
            label: 'Likelihood of recommending to other teams?',
            required: true,
          },
          {
            id: 'q_wishlist',
            type: 'long_text',
            label: 'What feature should we build next?',
            required: false,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Blank
      newForm = {
        id: newId,
        title: 'Untitled Survey',
        description: '',
        theme: {
          accentColor: 'indigo',
          fontFamily: 'sans',
          borderRadius: 'rounded-xl' as any,
          showProgressBar: true,
        },
        settings: {
          title: 'Untitled Survey',
          description: '',
          customDomain: 'form.ecast.store',
          customSlug: 'form-' + Math.random().toString(36).substring(2, 8),
          isLive: false,
          isAcceptingResponses: true,
          closedMessage: 'This survey is no longer accepting responses.',
          confirmationMessage: 'Your response has been recorded. Thank you!',
          allowMultipleSubmissions: true,
          showQuestionNumbers: true,
          autoExport: {
            enabled: true,
            frequency: 'realtime',
            format: 'csv',
            webhookUrl: 'https://api.ecast.store/v1/integrations/surveys',
            emailRecipients: 'insights@ecast.store',
            totalAutoDispatched: 0,
          },
        },
        fields: [
          {
            id: 'q_welcome',
            type: 'short_text',
            label: 'What is your full name?',
            required: true,
            placeholder: 'e.g. Alex Morgan',
          },
          {
            id: 'q_rating',
            type: 'rating',
            label: 'How would you rate your overall experience?',
            required: true,
            ratingStars: 5,
          },
          {
            id: 'q_feedback',
            type: 'long_text',
            label: 'Any comments or suggestions for improvement?',
            required: false,
            placeholder: 'Type your feedback here...',
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    setForms((prev) => [newForm, ...prev]);
    setActiveFormId(newId);
    saveFormToCloud(newForm, currentUser).catch(() => {});
  };

  const handleDuplicateForm = (formId: string) => {
    const source = forms.find((f) => f.id === formId);
    if (!source) return;

    const newId = 'form_' + Math.random().toString(36).substring(2, 9);
    const cloned: Form = {
      ...source,
      id: newId,
      title: `${source.title} (Clone)`,
      settings: {
        ...source.settings,
        customSlug: `${source.settings.customSlug}-copy`,
        isLive: false, // clones start as draft
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setForms((prev) => [cloned, ...prev]);
    setActiveFormId(newId);
    saveFormToCloud(cloned, currentUser).catch(() => {});
  };

  const handleDeleteForm = (formId: string) => {
    if (forms.length <= 1) {
      alert('You must have at least one survey.');
      return;
    }
    const target = forms.find((f) => f.id === formId);
    const nextForms = forms.filter((f) => f.id !== formId);
    setForms(nextForms);
    if (activeFormId === formId) {
      setActiveFormId(nextForms[0].id);
    }
    deleteFormFromCloud(formId, target?.settings?.customSlug).catch(() => {});
  };

  const handleSubmitResponse = async (
    submission: Omit<FormSubmission, 'id'>,
    targetFormId?: string
  ) => {
    const fId = targetFormId || currentForm.id;
    // 1. Local storage immediate fallback
    const saved = addSubmission(fId, submission);
    setSubmissionsMap(loadSubmissions());

    // 2. Cloud Firestore submission for multi-device sync
    try {
      await submitResponseToCloud(fId, submission, currentUser?.uid);
    } catch (e) {
      console.warn('Cloud submission sync fallback:', e);
    }

    setLiveToast(`New response received from ${submission.location} (${submission.device})`);
    setTimeout(() => setLiveToast(null), 4000);
  };

  const handleDeleteSubmission = (subId: string) => {
    const currentSubs = submissionsMap[currentForm.id] || [];
    const updated = currentSubs.filter((s) => s.id !== subId);
    const nextMap = { ...submissionsMap, [currentForm.id]: updated };
    setSubmissionsMap(nextMap);
  };

  const handleClearAllSubmissions = () => {
    if (confirm(`Are you sure you want to clear all ${activeSubmissions.length} responses for this survey?`)) {
      const nextMap = { ...submissionsMap, [currentForm.id]: [] };
      setSubmissionsMap(nextMap);
    }
  };

  // Simulate a live respondent submission
  const handleSimulateLiveResponse = () => {
    const simulatedAnswers: Record<string, any> = {};

    currentForm.fields.forEach((field) => {
      if (field.type === 'section_header') return;

      if (field.type === 'nps') {
        const roll = Math.random();
        simulatedAnswers[field.id] = roll > 0.35 ? (roll > 0.6 ? 10 : 9) : roll > 0.15 ? 8 : 6;
      } else if (field.type === 'rating') {
        const stars = field.ratingStars || 5;
        simulatedAnswers[field.id] = Math.random() > 0.3 ? stars : stars - 1;
      } else if (field.type === 'multiple_choice' || field.type === 'dropdown') {
        if (field.options && field.options.length > 0) {
          simulatedAnswers[field.id] =
            field.options[Math.floor(Math.random() * field.options.length)];
        }
      } else if (field.type === 'checkboxes') {
        if (field.options && field.options.length > 0) {
          const sampleCount = Math.floor(Math.random() * 2) + 1;
          simulatedAnswers[field.id] = [...field.options]
            .sort(() => 0.5 - Math.random())
            .slice(0, sampleCount);
        }
      } else if (field.type === 'linear_scale') {
        const min = field.scaleMin || 1;
        const max = field.scaleMax || 5;
        simulatedAnswers[field.id] = Math.floor(Math.random() * (max - min + 1)) + min;
      } else if (field.type === 'short_text') {
        simulatedAnswers[field.id] =
          Math.random() > 0.5 ? 'feedback.lead@ecast.store' : 'Jordan Taylor';
      } else if (field.type === 'long_text') {
        const feedbackQuotes = [
          'The real-time analytics updates are lightning fast and the visual design looks top tier.',
          'Super clean drag-and-drop experience. Creating a 10-question survey took under 2 minutes.',
          'Love having both direct CSV export and automated webhook sync built into form.ecast.store.',
          'Excellent UX on both mobile and desktop. Highly recommend!',
        ];
        simulatedAnswers[field.id] =
          feedbackQuotes[Math.floor(Math.random() * feedbackQuotes.length)];
      }
    });

    const locations = [
      'San Francisco, US',
      'Seattle, US',
      'Austin, US',
      'London, UK',
      'Amsterdam, NL',
      'Tokyo, JP',
      'Sydney, AU',
      'Toronto, CA',
    ];
    const devices: Array<'Desktop' | 'Mobile' | 'Tablet'> = ['Desktop', 'Mobile', 'Tablet'];

    handleSubmitResponse({
      formId: currentForm.id,
      submittedAt: new Date().toISOString(),
      durationSeconds: Math.floor(Math.random() * 70) + 50,
      device: devices[Math.floor(Math.random() * devices.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      answers: simulatedAnswers,
    });
  };

  const handleExitRespondentView = () => {
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.pushState({}, '', cleanUrl);
    setRouteState({ isRespondentView: false, slug: null });
    setPublicCloudForm(null);
  };

  /* =======================================================================
     PUBLIC RESPONDENT VIEW (Read-Only Questionnaire)
     When a respondent opens the shared link or scans the QR code:
     - No editor toolbar
     - No question modifying
     - No dashboard or analytics access
     - Works from ANY device, smartphone, or tablet
     ======================================================================= */
  if (routeState.isRespondentView && routeState.slug) {
    if (isPublicLoading) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md text-center max-w-sm w-full space-y-4">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Loading Survey...</h3>
              <p className="text-xs text-slate-400 mt-1">
                Fetching questions for <code className="font-mono text-indigo-600 font-semibold">{routeState.slug}</code>
              </p>
            </div>
          </div>
        </div>
      );
    }

    const matched =
      publicCloudForm ||
      forms.find(
        (f) =>
          f.settings.customSlug.toLowerCase() === routeState.slug?.toLowerCase() ||
          f.id.toLowerCase() === routeState.slug?.toLowerCase()
      );

    if (!matched && publicFetchAttempted) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Survey Not Found</h2>
            <p className="text-slate-500 text-xs">
              No live survey was found matching <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono font-semibold">"{routeState.slug}"</code>.
            </p>
            <p className="text-slate-400 text-[11px]">
              Please check that the survey was set to <strong>Go Live</strong> by the creator, or verify the URL link.
            </p>
            <button
              type="button"
              onClick={handleExitRespondentView}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Go to Form Studio
            </button>
          </div>
        </div>
      );
    }

    if (matched) {
      const normalizedMatched = normalizeForm(matched);

      return (
        <div className="min-h-screen bg-slate-100/70 flex flex-col justify-between">
          <SurveyTaker
            form={normalizedMatched}
            isPreviewMode={false}
            onSubmitResponse={(sub) => handleSubmitResponse(sub, normalizedMatched.id)}
          />

          {/* Small discreet footer for creator access */}
          <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/50 bg-white/40">
            <div className="max-w-md mx-auto px-4 flex items-center justify-between">
              <span className="font-mono text-[11px] text-slate-400">Powered by form.ecast.store</span>
              <button
                type="button"
                onClick={handleExitRespondentView}
                className="text-[11px] text-indigo-600 font-semibold hover:underline flex items-center gap-1"
              >
                <span>Creator Studio</span>
                <ArrowLeft className="w-3 h-3 rotate-180" />
              </button>
            </div>
          </footer>
        </div>
      );
    }
  }

  /* =======================================================================
     CREATOR STUDIO VIEW (Authenticated or Local Builder)
     ======================================================================= */
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Application Bar */}
      <Header
        currentForm={currentForm}
        allForms={forms}
        currentMode={currentMode}
        responseCount={activeSubmissions.length}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSelectMode={setCurrentMode}
        onOpenTheme={() => setIsThemeModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenFormSwitcher={() => setIsFormSwitcherOpen(true)}
        onNewForm={() => handleCreateNewForm('blank')}
        onToggleLive={handleToggleGoLive}
        onOpenPublicLink={() => {
          const url = `${window.location.origin}/?s=${currentForm.settings.customSlug}`;
          window.open(url, '_blank');
        }}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 pb-16">
        {currentMode === 'builder' && (
          <FormBuilder
            form={currentForm}
            onUpdateForm={handleUpdateCurrentForm}
            onPreview={() => setCurrentMode('preview')}
            onOpenTheme={() => setIsThemeModalOpen(true)}
            onOpenExport={() => setIsExportModalOpen(true)}
            onToggleLive={handleToggleGoLive}
          />
        )}

        {currentMode === 'analytics' && (
          <AnalyticsView
            form={currentForm}
            submissions={activeSubmissions}
            onSimulateLiveResponse={handleSimulateLiveResponse}
            onDeleteSubmission={handleDeleteSubmission}
            onClearAllSubmissions={handleClearAllSubmissions}
            onOpenExportModal={() => setIsExportModalOpen(true)}
          />
        )}

        {currentMode === 'preview' && (
          <SurveyTaker
            form={currentForm}
            isPreviewMode={true}
            onExitPreview={() => setCurrentMode('builder')}
            onSubmitResponse={(sub) => handleSubmitResponse(sub, currentForm.id)}
          />
        )}
      </main>

      {/* Toast Notification */}
      {liveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom duration-300 border border-slate-700">
          <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{liveToast}</span>
        </div>
      )}

      {/* Share, Export & Webhooks Modal */}
      <ShareExportModal
        form={currentForm}
        submissions={activeSubmissions}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onUpdateForm={handleUpdateCurrentForm}
      />

      {/* Styling & Theme Modal */}
      <ThemeModal
        form={currentForm}
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        onUpdateForm={handleUpdateCurrentForm}
      />

      {/* Surveys & Templates Switcher Modal */}
      <FormsListModal
        forms={forms}
        currentFormId={currentForm.id}
        isOpen={isFormSwitcherOpen}
        onClose={() => setIsFormSwitcherOpen(false)}
        onSelectForm={handleSelectForm}
        onCreateNew={() => handleCreateNewForm('blank')}
        onDuplicateForm={handleDuplicateForm}
        onDeleteForm={handleDeleteForm}
        onSelectTemplate={handleCreateNewForm}
      />

      {/* Authentication & Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
