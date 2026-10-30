import { Form, FormSubmission, FormField } from '../types/form';

const STORAGE_KEY_FORMS = 'ecast_forms_data_v1';
const STORAGE_KEY_ACTIVE_ID = 'ecast_forms_active_id_v1';
const STORAGE_KEY_SUBMISSIONS = 'ecast_forms_submissions_v1';

export const SAMPLE_FORMS: Form[] = [
  {
    id: 'csat-survey-2026',
    title: 'Customer Satisfaction & Experience Survey 2026',
    description: 'We value your opinion! Please take 2 minutes to share your honest thoughts about our services and digital platform.',
    theme: {
      accentColor: 'indigo',
      fontFamily: 'sans',
      borderRadius: 'rounded-xl' as any,
      showProgressBar: true,
      headerBanner: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
    },
    settings: {
      title: 'Customer Satisfaction & Experience Survey 2026',
      description: 'We value your opinion! Please take 2 minutes to share your honest thoughts about our services and digital platform.',
      customDomain: 'form.ecast.store',
      customSlug: 'csat-2026',
      isLive: true,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      isAcceptingResponses: true,
      closedMessage: 'This survey is no longer accepting responses. Thank you for your interest.',
      confirmationMessage: 'Thank you for your feedback! Your insights help us improve every day.',
      allowMultipleSubmissions: true,
      showQuestionNumbers: true,
      autoExport: {
        enabled: true,
        frequency: 'realtime',
        format: 'csv',
        webhookUrl: 'https://api.ecast.store/v1/integrations/survey-webhook',
        emailRecipients: 'insights@ecast.store, analytics@ecast.store',
        lastExportAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
        totalAutoDispatched: 24,
      },
    },
    fields: [
      {
        id: 'f_nps',
        type: 'nps',
        label: 'How likely are you to recommend Ecast Store to a colleague or friend?',
        description: '0 = Not at all likely, 10 = Extremely likely',
        required: true,
      },
      {
        id: 'f_overall_satisfaction',
        type: 'rating',
        label: 'Overall, how satisfied are you with our product quality?',
        description: 'Rate your overall experience from 1 to 5 stars',
        required: true,
        ratingStars: 5,
      },
      {
        id: 'f_favorite_features',
        type: 'checkboxes',
        label: 'Which features do you find most valuable?',
        description: 'Select all that apply',
        required: false,
        options: [
          'Fast Checkout & Order Tracking',
          'Automated Reporting & Exports',
          'Responsive Customer Support',
          'Clean & Intuitive User Interface',
          'Integrations & Webhook Sync',
        ],
      },
      {
        id: 'f_frequency',
        type: 'multiple_choice',
        label: 'How frequently do you use our services?',
        description: 'Choose the option that best matches your routine',
        required: true,
        options: ['Daily', 'Several times a week', 'Once a month', 'First time today'],
      },
      {
        id: 'f_ease_of_use',
        type: 'linear_scale',
        label: 'How easy was it to navigate and find what you needed?',
        description: 'Scale from 1 (Very Difficult) to 5 (Effortless)',
        required: true,
        scaleMin: 1,
        scaleMax: 5,
        scaleMinLabel: 'Very Difficult',
        scaleMaxLabel: 'Effortless',
      },
      {
        id: 'f_department',
        type: 'dropdown',
        label: 'What best describes your industry or role?',
        required: false,
        options: [
          'Technology & Software',
          'E-Commerce & Retail',
          'Marketing & Creative',
          'Education & Non-profit',
          'Other / Independent',
        ],
      },
      {
        id: 'f_feedback_text',
        type: 'long_text',
        label: 'What could we do to make your experience even better?',
        description: 'Any thoughts, feature suggestions, or constructive critique are welcome.',
        required: false,
        placeholder: 'Tell us how we can improve...',
      },
      {
        id: 'f_contact_email',
        type: 'short_text',
        label: 'Email address (Optional)',
        description: 'If you would like us to follow up regarding your feedback',
        required: false,
        placeholder: 'you@example.com',
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 'event-reg-2026',
    title: 'Global Tech Summit 2026 RSVP & Workshop Preferences',
    description: 'Join us for 3 days of design systems, cloud architecture, and AI engineering. Register your attendee profile below.',
    theme: {
      accentColor: 'emerald',
      fontFamily: 'sans',
      borderRadius: 'rounded-xl' as any,
      showProgressBar: true,
    },
    settings: {
      title: 'Global Tech Summit 2026 RSVP & Workshop Preferences',
      description: 'Join us for 3 days of design systems, cloud architecture, and AI engineering.',
      customDomain: 'form.ecast.store',
      customSlug: 'tech-summit-2026',
      isLive: true,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      isAcceptingResponses: true,
      closedMessage: 'Registrations are now closed for this event.',
      confirmationMessage: 'Your registration has been confirmed! Check your email for pass details.',
      allowMultipleSubmissions: false,
      showQuestionNumbers: true,
      autoExport: {
        enabled: false,
        frequency: 'daily',
        format: 'csv',
        webhookUrl: '',
        emailRecipients: '',
        totalAutoDispatched: 0,
      },
    },
    fields: [
      {
        id: 'f_name',
        type: 'short_text',
        label: 'Full Name',
        required: true,
        placeholder: 'Alex Morgan',
      },
      {
        id: 'f_work_email',
        type: 'short_text',
        label: 'Work Email Address',
        required: true,
        placeholder: 'alex@company.com',
      },
      {
        id: 'f_attendance_mode',
        type: 'multiple_choice',
        label: 'How will you be joining the summit?',
        required: true,
        options: ['In-Person (San Francisco Hall)', 'Virtual Live Stream (Interactive)'],
      },
      {
        id: 'f_breakouts',
        type: 'checkboxes',
        label: 'Select Workshop Tracks of Interest',
        required: true,
        options: [
          'Mastering Real-time Reactive Architectures',
          'Design Systems at Enterprise Scale',
          'AI Agent Workflows & Tool Grounding',
          'Next-gen Cloud Security & Data Governance',
        ],
      },
      {
        id: 'f_dietary',
        type: 'dropdown',
        label: 'Dietary Preferences (For In-Person Guests)',
        required: false,
        options: ['None / Standard', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Halal / Kosher'],
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
];

export const SAMPLE_SUBMISSIONS: Record<string, FormSubmission[]> = {
  'csat-survey-2026': [
    {
      id: 'sub_1',
      formId: 'csat-survey-2026',
      submittedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      durationSeconds: 110,
      device: 'Desktop',
      location: 'San Francisco, US',
      answers: {
        f_nps: 10,
        f_overall_satisfaction: 5,
        f_favorite_features: ['Fast Checkout & Order Tracking', 'Automated Reporting & Exports', 'Clean & Intuitive User Interface'],
        f_frequency: 'Daily',
        f_ease_of_use: 5,
        f_department: 'Technology & Software',
        f_feedback_text: 'The form creation velocity is astounding. Instant CSV export and webhook automation are game changers for our workflow.',
        f_contact_email: 'sarah.c@techcorp.io',
      },
    },
    {
      id: 'sub_2',
      formId: 'csat-survey-2026',
      submittedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      durationSeconds: 95,
      device: 'Mobile',
      location: 'London, UK',
      answers: {
        f_nps: 9,
        f_overall_satisfaction: 4,
        f_favorite_features: ['Clean & Intuitive User Interface', 'Responsive Customer Support'],
        f_frequency: 'Several times a week',
        f_ease_of_use: 4,
        f_department: 'Marketing & Creative',
        f_feedback_text: 'Love the drag-and-drop ease. It feels faster and cleaner than Google Forms.',
        f_contact_email: 'oliver@designstudio.co.uk',
      },
    },
    {
      id: 'sub_3',
      formId: 'csat-survey-2026',
      submittedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      durationSeconds: 140,
      device: 'Desktop',
      location: 'Tokyo, JP',
      answers: {
        f_nps: 10,
        f_overall_satisfaction: 5,
        f_favorite_features: ['Automated Reporting & Exports', 'Integrations & Webhook Sync'],
        f_frequency: 'Daily',
        f_ease_of_use: 5,
        f_department: 'Technology & Software',
        f_feedback_text: 'Very fast analytics updates and the custom domain form.ecast.store looks so professional!',
      },
    },
    {
      id: 'sub_4',
      formId: 'csat-survey-2026',
      submittedAt: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
      durationSeconds: 165,
      device: 'Mobile',
      location: 'Berlin, DE',
      answers: {
        f_nps: 8,
        f_overall_satisfaction: 4,
        f_favorite_features: ['Fast Checkout & Order Tracking'],
        f_frequency: 'Once a month',
        f_ease_of_use: 4,
        f_department: 'E-Commerce & Retail',
        f_feedback_text: 'Adding more conditional logic down the road would be fantastic, but the core is solid.',
        f_contact_email: 'hannah.k@berlinretail.de',
      },
    },
    {
      id: 'sub_5',
      formId: 'csat-survey-2026',
      submittedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      durationSeconds: 190,
      device: 'Tablet',
      location: 'Sydney, AU',
      answers: {
        f_nps: 9,
        f_overall_satisfaction: 5,
        f_favorite_features: ['Clean & Intuitive User Interface', 'Responsive Customer Support', 'Automated Reporting & Exports'],
        f_frequency: 'Several times a week',
        f_ease_of_use: 5,
        f_department: 'Education & Non-profit',
        f_feedback_text: 'Our students and staff picked it up instantly without any training.',
      },
    },
  ],
};

/**
 * Normalizes any form data ensuring all properties, settings, themes, and fields
 * have bulletproof defaults. This completely prevents null/undefined crashes.
 */
export function normalizeForm(raw: any): Form {
  const defaultForm = SAMPLE_FORMS[0];
  if (!raw || typeof raw !== 'object') return defaultForm;

  const id = typeof raw.id === 'string' && raw.id ? raw.id : 'form_' + Math.random().toString(36).substring(2, 8);
  const title = typeof raw.title === 'string' ? raw.title : 'Untitled Survey';
  const description = typeof raw.description === 'string' ? raw.description : '';

  const theme = {
    accentColor: raw.theme?.accentColor || 'indigo',
    headerBanner: raw.theme?.headerBanner || undefined,
    fontFamily: raw.theme?.fontFamily || 'sans',
    borderRadius: raw.theme?.borderRadius || 'rounded-xl',
    showProgressBar: raw.theme?.showProgressBar ?? true,
  };

  const settings = {
    title: raw.settings?.title || title,
    description: raw.settings?.description || description,
    customDomain: raw.settings?.customDomain || 'form.ecast.store',
    customSlug: raw.settings?.customSlug || 'survey-2026',
    isLive: typeof raw.settings?.isLive === 'boolean' ? raw.settings.isLive : true,
    publishedAt: raw.settings?.publishedAt || undefined,
    isAcceptingResponses: raw.settings?.isAcceptingResponses ?? true,
    closedMessage: raw.settings?.closedMessage || 'This survey is no longer accepting responses.',
    confirmationMessage: raw.settings?.confirmationMessage || 'Thank you for your feedback!',
    allowMultipleSubmissions: raw.settings?.allowMultipleSubmissions ?? true,
    showQuestionNumbers: raw.settings?.showQuestionNumbers ?? true,
    autoExport: {
      enabled: raw.settings?.autoExport?.enabled ?? true,
      frequency: raw.settings?.autoExport?.frequency || 'realtime',
      format: raw.settings?.autoExport?.format || 'csv',
      webhookUrl: raw.settings?.autoExport?.webhookUrl || 'https://api.ecast.store/v1/integrations/survey-webhook',
      emailRecipients: raw.settings?.autoExport?.emailRecipients || 'insights@ecast.store',
      lastExportAt: raw.settings?.autoExport?.lastExportAt || undefined,
      totalAutoDispatched: raw.settings?.autoExport?.totalAutoDispatched || 0,
    },
  };

  const fields: FormField[] = Array.isArray(raw.fields)
    ? raw.fields.map((f: any, idx: number) => ({
        id: typeof f?.id === 'string' && f.id ? f.id : `f_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        type: f?.type || 'short_text',
        label: typeof f?.label === 'string' ? f.label : `Question ${idx + 1}`,
        description: typeof f?.description === 'string' ? f.description : '',
        required: !!f?.required,
        placeholder: typeof f?.placeholder === 'string' ? f.placeholder : '',
        options: Array.isArray(f?.options) ? f.options : undefined,
        scaleMin: typeof f?.scaleMin === 'number' ? f.scaleMin : undefined,
        scaleMax: typeof f?.scaleMax === 'number' ? f.scaleMax : undefined,
        scaleMinLabel: f?.scaleMinLabel,
        scaleMaxLabel: f?.scaleMaxLabel,
        ratingStars: f?.ratingStars || (f?.type === 'rating' ? 5 : undefined),
      }))
    : defaultForm.fields;

  return {
    id,
    title,
    description,
    theme,
    settings,
    fields,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

export function loadStoredForms(): Form[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FORMS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeForm);
      }
    }
  } catch (e) {
    console.warn('Error reading stored forms, recovering with defaults:', e);
  }
  // Initialize with sample forms
  saveStoredForms(SAMPLE_FORMS);
  return SAMPLE_FORMS;
}

export function saveStoredForms(forms: Form[]) {
  try {
    localStorage.setItem(STORAGE_KEY_FORMS, JSON.stringify(forms));
  } catch (e) {
    console.error('Error saving forms:', e);
  }
}

export function loadSubmissions(): Record<string, FormSubmission[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const cleaned: Record<string, FormSubmission[]> = {};
        for (const [formId, subList] of Object.entries(parsed)) {
          if (Array.isArray(subList)) {
            cleaned[formId] = subList.map((s: any) => ({
              id: s?.id || 'sub_' + Math.random().toString(36).substring(2, 8),
              formId: formId,
              submittedAt: s?.submittedAt || new Date().toISOString(),
              durationSeconds: typeof s?.durationSeconds === 'number' ? s.durationSeconds : 90,
              answers: s?.answers && typeof s.answers === 'object' ? s.answers : {},
              device: s?.device || 'Desktop',
              location: s?.location || 'San Francisco, US',
            }));
          }
        }
        return cleaned;
      }
    }
  } catch (e) {
    console.warn('Error reading stored submissions:', e);
  }
  saveSubmissions(SAMPLE_SUBMISSIONS);
  return SAMPLE_SUBMISSIONS;
}

export function saveSubmissions(subs: Record<string, FormSubmission[]>) {
  try {
    localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(subs));
  } catch (e) {
    console.error('Error saving submissions:', e);
  }
}

export function addSubmission(formId: string, submission: Omit<FormSubmission, 'id'>): FormSubmission {
  const current = loadSubmissions();
  const formSubmissions = current[formId] || [];
  const newSubmission: FormSubmission = {
    ...submission,
    answers: submission.answers || {},
    id: 'sub_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36),
  };
  current[formId] = [newSubmission, ...formSubmissions];
  saveSubmissions(current);

  // Check automated export dispatch
  try {
    const forms = loadStoredForms();
    const form = forms.find((f) => f.id === formId);
    if (form && form.settings?.autoExport?.enabled) {
      form.settings.autoExport.totalAutoDispatched = (form.settings.autoExport.totalAutoDispatched || 0) + 1;
      form.settings.autoExport.lastExportAt = new Date().toISOString();
      saveStoredForms(forms);
    }
  } catch (e) {
    console.warn('Auto export notification failed:', e);
  }

  return newSubmission;
}

export function loadActiveFormId(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (saved) return saved;
  } catch (e) {
    // fallback
  }
  return SAMPLE_FORMS[0].id;
}

export function saveActiveFormId(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  } catch (e) {
    // ignore
  }
}
