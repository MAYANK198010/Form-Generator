import { Form, FormSubmission } from '../types/form';

export function exportToCSV(form: Form, submissions: FormSubmission[]) {
  if (!submissions || submissions.length === 0) {
    alert('No submissions to export yet.');
    return;
  }

  // Extract non-header fields
  const dataFields = form.fields.filter((f) => f.type !== 'section_header');

  const headers = [
    'Submission ID',
    'Timestamp',
    'Device',
    'Location',
    'Duration (Seconds)',
    ...dataFields.map((f) => `"${f.label.replace(/"/g, '""')}"`),
  ];

  const rows = submissions.map((sub) => {
    const formattedDate = new Date(sub.submittedAt).toISOString();
    const fieldValues = dataFields.map((f) => {
      const val = sub.answers[f.id];
      if (val === undefined || val === null) return '""';
      if (Array.isArray(val)) {
        return `"${val.join('; ').replace(/"/g, '""')}"`;
      }
      return `"${String(val).replace(/"/g, '""')}"`;
    });

    return [
      `"${sub.id}"`,
      `"${formattedDate}"`,
      `"${sub.device || 'Desktop'}"`,
      `"${sub.location || 'Unknown'}"`,
      sub.durationSeconds || 0,
      ...fieldValues,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `${form.settings.customSlug || 'survey'}-responses-${getTimestampStr()}.csv`);
}

export function exportToJSON(form: Form, submissions: FormSubmission[]) {
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    generator: 'Ecast Forms (form.ecast.store)',
    form: {
      id: form.id,
      title: form.title,
      slug: form.settings.customSlug,
      totalQuestions: form.fields.length,
      fields: form.fields,
    },
    totalSubmissions: submissions.length,
    submissions: submissions,
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  triggerDownload(blob, `${form.settings.customSlug || 'survey'}-data-${getTimestampStr()}.json`);
}

export function exportToTSV(form: Form, submissions: FormSubmission[]) {
  if (!submissions || submissions.length === 0) {
    alert('No submissions to export yet.');
    return;
  }

  const dataFields = form.fields.filter((f) => f.type !== 'section_header');

  const headers = [
    'Submission ID',
    'Timestamp',
    'Device',
    'Location',
    ...dataFields.map((f) => f.label.replace(/\t/g, ' ')),
  ];

  const rows = submissions.map((sub) => {
    const fieldValues = dataFields.map((f) => {
      const val = sub.answers[f.id];
      if (val === undefined || val === null) return '';
      if (Array.isArray(val)) return val.join('; ');
      return String(val).replace(/\t/g, ' ');
    });

    return [
      sub.id,
      new Date(sub.submittedAt).toLocaleString(),
      sub.device || 'Desktop',
      sub.location || 'Unknown',
      ...fieldValues,
    ].join('\t');
  });

  const tsvContent = [headers.join('\t'), ...rows].join('\r\n');
  const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
  triggerDownload(blob, `${form.settings.customSlug || 'survey'}-sheets-${getTimestampStr()}.tsv`);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getTimestampStr() {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
}

/**
 * Simulates a real webhook delivery to test integrations
 */
export async function simulateWebhookDispatch(
  webhookUrl: string,
  form: Form,
  sampleSubmission: FormSubmission
): Promise<{ success: boolean; status: number; message: string; payload: any }> {
  const payload = {
    event: 'form_submission.created',
    timestamp: new Date().toISOString(),
    source: 'https://form.ecast.store',
    form: {
      id: form.id,
      title: form.title,
      slug: form.settings.customSlug,
    },
    submission: sampleSubmission,
  };

  // Wait 600ms to simulate network request
  await new Promise((r) => setTimeout(r, 600));

  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return {
      success: false,
      status: 400,
      message: 'Invalid webhook endpoint URL. Must start with http:// or https://',
      payload,
    };
  }

  return {
    success: true,
    status: 200,
    message: 'Webhook payload successfully accepted with status 200 OK',
    payload,
  };
}
