export type FieldType =
  | 'short_text'
  | 'long_text'
  | 'multiple_choice'
  | 'checkboxes'
  | 'dropdown'
  | 'rating'
  | 'linear_scale'
  | 'nps'
  | 'date'
  | 'time'
  | 'file_upload'
  | 'section_header';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  description?: string;
  required: boolean;
  placeholder?: string;
  options?: string[]; // for choice, checkboxes, dropdown
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
  ratingStars?: number; // 5 or 10
  acceptedFileTypes?: string;
}

export type ThemeAccent = 'indigo' | 'emerald' | 'violet' | 'amber' | 'rose' | 'cyan' | 'slate';

export interface FormTheme {
  accentColor: ThemeAccent;
  headerBanner?: string;
  fontFamily: 'sans' | 'serif' | 'mono';
  borderRadius: 'rounded-lg' | 'rounded-2xl' | 'rounded-none';
  showProgressBar: boolean;
}

export interface AutoExportSettings {
  enabled: boolean;
  frequency: 'realtime' | 'daily' | 'weekly';
  format: 'csv' | 'json' | 'tsv';
  webhookUrl: string;
  webhookSecret?: string;
  emailRecipients: string;
  lastExportAt?: string;
  totalAutoDispatched: number;
}

export interface FormSettings {
  title: string;
  description: string;
  customDomain: string; // e.g. "form.ecast.store"
  customSlug: string;   // e.g. "customer-feedback-2026"
  isAcceptingResponses: boolean;
  closedMessage: string;
  confirmationMessage: string;
  allowMultipleSubmissions: boolean;
  showQuestionNumbers: boolean;
  autoExport: AutoExportSettings;
}

export interface FormSubmission {
  id: string;
  formId: string;
  submittedAt: string; // ISO string
  durationSeconds: number;
  answers: Record<string, any>;
  device: 'Desktop' | 'Mobile' | 'Tablet';
  location: string;
}

export interface Form {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  theme: FormTheme;
  settings: FormSettings;
  createdAt: string;
  updatedAt: string;
  isTemplate?: boolean;
}
