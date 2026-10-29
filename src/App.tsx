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
} from './utils/storage';
import { Header } from './components/Header';
import { FormBuilder } from './components/FormBuilder';
import { AnalyticsView } from './components/AnalyticsView';
import { SurveyTaker } from './components/SurveyTaker';
import { ShareExportModal } from './components/ShareExportModal';
import { ThemeModal } from './components/ThemeModal';
import { FormsListModal } from './components/FormsListModal';
import { CheckCircle2, Zap } from 'lucide-react';

export default function App() {
  const [forms, setForms] = useState<Form[]>(() => loadStoredForms());
  const [activeFormId, setActiveFormId] = useState<string>(() => loadActiveFormId());
  const [submissionsMap, setSubmissionsMap] = useState<Record<string, FormSubmission[]>>(() =>
    loadSubmissions()
  );
  const [currentMode, setCurrentMode] = useState<'builder' | 'analytics' | 'preview'>('builder');

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isFormSwitcherOpen, setIsFormSwitcherOpen] = useState(false);
  const [liveToast, setLiveToast] = useState<string | null>(null);

  // Active Form resolution
  const currentForm = forms.find((f) => f.id === activeFormId) || forms[0] || SAMPLE_FORMS[0];
  const activeSubmissions = submissionsMap[currentForm.id] || [];

  // Persist forms
  useEffect(() => {
    saveStoredForms(forms);
  }, [forms]);

  // Persist active form id
  useEffect(() => {
    saveActiveFormId(activeFormId);
  }, [activeFormId]);

  // Persist submissions
  useEffect(() => {
    saveSubmissions(submissionsMap);
  }, [submissionsMap]);

  const handleUpdateCurrentForm = (updated: Form) => {
    setForms((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  const handleSelectForm = (formId: string) => {
    setActiveFormId(formId);
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
          customSlug: 'survey-' + Math.floor(Math.random() * 9000 + 1000),
          isAcceptingResponses: true,
          closedMessage: 'This survey is no longer accepting responses.',
          confirmationMessage: 'Thank you for your response!',
          allowMultipleSubmissions: true,
          showQuestionNumbers: true,
          autoExport: {
            enabled: false,
            frequency: 'realtime',
            format: 'csv',
            webhookUrl: '',
            emailRecipients: '',
            totalAutoDispatched: 0,
          },
        },
        fields: [
          {
            id: 'f_' + Math.random().toString(36).substring(2, 7),
            type: 'multiple_choice',
            label: 'Untitled Question',
            required: false,
            options: ['Option 1', 'Option 2', 'Option 3'],
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    setForms((prev) => [newForm, ...prev]);
    setActiveFormId(newId);
    setCurrentMode('builder');
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
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setForms((prev) => [cloned, ...prev]);
    setActiveFormId(newId);
  };

  const handleDeleteForm = (formId: string) => {
    if (forms.length <= 1) {
      alert('You must have at least one survey.');
      return;
    }
    const nextForms = forms.filter((f) => f.id !== formId);
    setForms(nextForms);
    if (activeFormId === formId) {
      setActiveFormId(nextForms[0].id);
    }
  };

  const handleSubmitResponse = (submission: Omit<FormSubmission, 'id'>) => {
    const saved = addSubmission(currentForm.id, submission);
    setSubmissionsMap(loadSubmissions());

    // Show quick toast notification
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
        // High likelihood of promoters / passives
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

    const newSub = addSubmission(currentForm.id, {
      formId: currentForm.id,
      submittedAt: new Date().toISOString(),
      durationSeconds: Math.floor(Math.random() * 70) + 50,
      device: devices[Math.floor(Math.random() * devices.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      answers: simulatedAnswers,
    });

    setSubmissionsMap(loadSubmissions());
    setLiveToast(`Live incoming response recorded: ID ${newSub.id.slice(0, 10)}`);
    setTimeout(() => setLiveToast(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col">
      {/* Global Header */}
      {currentMode !== 'preview' && (
        <Header
          currentForm={currentForm}
          allForms={forms}
          currentMode={currentMode}
          responseCount={activeSubmissions.length}
          onSelectMode={setCurrentMode}
          onOpenTheme={() => setIsThemeModalOpen(true)}
          onOpenExport={() => setIsExportModalOpen(true)}
          onOpenFormSwitcher={() => setIsFormSwitcherOpen(true)}
          onNewForm={() => handleCreateNewForm('blank')}
        />
      )}

      {/* Main Content Body */}
      <main className="flex-1">
        {currentMode === 'builder' && (
          <FormBuilder
            form={currentForm}
            onUpdateForm={handleUpdateCurrentForm}
            onPreview={() => setCurrentMode('preview')}
            onOpenTheme={() => setIsThemeModalOpen(true)}
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
            onSubmitResponse={handleSubmitResponse}
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
    </div>
  );
}
