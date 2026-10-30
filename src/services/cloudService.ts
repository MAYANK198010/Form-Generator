import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db, FirebaseUser } from '../lib/firebase';
import { Form, FormSubmission } from '../types/form';
import { normalizeForm, SAMPLE_FORMS } from '../utils/storage';

const FORMS_COLLECTION = 'forms';
const SUBMISSIONS_COLLECTION = 'submissions';

/**
 * Deeply sanitizes any object or array so it contains zero `undefined` values.
 * Firestore strictly throws FirebaseError when encountering any `undefined` field value.
 */
export function cleanForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data.map((item) => cleanForFirestore(item)) as any;
  }
  if (typeof data === 'object') {
    // Preserve Firestore serverTimestamp / FieldValue instances if any
    if (
      data &&
      (data.constructor?.name === 'FieldValue' ||
        '_methodName' in (data as any) ||
        (data as any) instanceof Date)
    ) {
      return data;
    }
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = cleanForFirestore(value);
      }
    }
    return cleaned as any;
  }
  return data;
}

/**
 * Saves a form to Firestore so it is accessible from any device and by respondents.
 */
export async function saveFormToCloud(form: Form, user?: FirebaseUser | null): Promise<void> {
  try {
    const rawPayload = {
      ...form,
      ownerUid: user ? user.uid : 'guest',
      ownerEmail: user?.email || 'creator@ecast.store',
      updatedAt: new Date().toISOString(),
    };

    const payload = cleanForFirestore(rawPayload);

    // 1. Primary write by form.id
    const formRef = doc(db, FORMS_COLLECTION, form.id);
    await setDoc(formRef, payload);

    // 2. Direct slug alias for instant O(1) respondent lookup across any device
    if (form.settings.customSlug) {
      const slugKey = 'slug_' + form.settings.customSlug.trim().toLowerCase();
      const slugRef = doc(db, FORMS_COLLECTION, slugKey);
      await setDoc(slugRef, payload);
    }
  } catch (error) {
    console.error('Failed to save form to Firestore:', error);
    throw error;
  }
}

/**
 * Fetches all surveys created by the authenticated user across any device.
 */
export async function fetchUserFormsFromCloud(user: FirebaseUser): Promise<Form[]> {
  try {
    const q = query(
      collection(db, FORMS_COLLECTION),
      where('ownerUid', '==', user.uid)
    );
    const snap = await getDocs(q);
    const forms: Form[] = [];
    const seenIds = new Set<string>();

    snap.forEach((d) => {
      const data = d.data();
      // Filter out slug_ alias documents
      if (d.id.startsWith('slug_')) return;
      if (!seenIds.has(data.id)) {
        seenIds.add(data.id);
        forms.push(normalizeForm(data));
      }
    });

    return forms;
  } catch (error) {
    console.error('Failed to fetch user forms from Firestore:', error);
    return [];
  }
}

/**
 * Fetches a survey for public respondents by either slug or form ID.
 * Works seamlessly from any device, smartphone QR scan, or shared link.
 */
export async function fetchPublicFormBySlug(slug: string): Promise<Form | null> {
  try {
    const cleanSlug = slug.trim().toLowerCase();

    // 1. Check direct slug alias (O(1) fast lookup)
    const slugRef = doc(db, FORMS_COLLECTION, 'slug_' + cleanSlug);
    const slugSnap = await getDoc(slugRef);
    if (slugSnap.exists()) {
      return normalizeForm(slugSnap.data());
    }

    // 2. Check direct form ID
    const docRef = doc(db, FORMS_COLLECTION, cleanSlug);
    const directSnap = await getDoc(docRef);
    if (directSnap.exists()) {
      return normalizeForm(directSnap.data());
    }

    // 3. Fallback query by settings.customSlug
    const q = query(
      collection(db, FORMS_COLLECTION),
      where('settings.customSlug', '==', cleanSlug)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return normalizeForm(snap.docs[0].data());
    }

    return null;
  } catch (error) {
    console.error('Failed to query public form by slug:', error);
    return null;
  }
}

export async function deleteFormFromCloud(formId: string, slug?: string): Promise<void> {
  try {
    await deleteDoc(doc(db, FORMS_COLLECTION, formId));
    if (slug) {
      await deleteDoc(doc(db, FORMS_COLLECTION, 'slug_' + slug.toLowerCase().trim()));
    }
  } catch (error) {
    console.error('Failed to delete form from Firestore:', error);
    throw error;
  }
}

/**
 * Submits response to Firestore in real-time, making it accessible in analytics across all devices.
 */
export async function submitResponseToCloud(
  formId: string,
  submission: Omit<FormSubmission, 'id'>,
  respondentUid?: string
): Promise<FormSubmission> {
  try {
    const subId = 'sub_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    const subRef = doc(db, SUBMISSIONS_COLLECTION, subId);

    const rawPayload: FormSubmission = {
      ...submission,
      id: subId,
      formId,
      submittedAt: submission.submittedAt || new Date().toISOString(),
      durationSeconds: submission.durationSeconds || 60,
      device: submission.device || 'Desktop',
      location: submission.location || 'Unknown',
      answers: submission.answers || {},
    };

    const cleanPayload = cleanForFirestore(rawPayload);

    await setDoc(subRef, {
      ...cleanPayload,
      respondentUid: respondentUid || null,
      createdAtServer: serverTimestamp(),
    });

    return rawPayload;
  } catch (error) {
    console.error('Failed to record submission in Firestore:', error);
    throw error;
  }
}

/**
 * Real-time listener for submissions so analytics dashboard updates live as respondents answer.
 */
export function subscribeToSubmissions(
  formId: string,
  onUpdate: (subs: FormSubmission[]) => void
): () => void {
  try {
    const q = query(
      collection(db, SUBMISSIONS_COLLECTION),
      where('formId', '==', formId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const subs: FormSubmission[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          subs.push({
            id: d.id,
            formId: data.formId,
            submittedAt: data.submittedAt || new Date().toISOString(),
            durationSeconds: data.durationSeconds || 60,
            answers: data.answers || {},
            device: data.device || 'Desktop',
            location: data.location || 'Unknown',
          });
        });
        // Sort descending by submission time
        subs.sort(
          (a, b) =>
            new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
        onUpdate(subs);
      },
      (error) => {
        console.warn('Real-time submissions subscription error:', error);
      }
    );
  } catch (e) {
    console.warn('Error setting up submissions subscription:', e);
    return () => {};
  }
}

export async function deleteSubmissionFromCloud(submissionId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, SUBMISSIONS_COLLECTION, submissionId));
  } catch (error) {
    console.error('Failed to delete submission from Firestore:', error);
    throw error;
  }
}
