import { InvitationData } from '../types';

const PROJECT_ID = 'sonett-app-2026-b79e5';

function parseFirestoreValue(val: Record<string, unknown>): unknown {
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('booleanValue' in val) return val.booleanValue;
  if ('doubleValue' in val) return val.doubleValue;
  if ('nullValue' in val) return null;
  if ('arrayValue' in val) {
    const arr = val.arrayValue as { values?: Record<string, unknown>[] };
    return (arr.values || []).map(parseFirestoreValue);
  }
  if ('mapValue' in val) {
    const map = val.mapValue as { fields?: Record<string, Record<string, unknown>> };
    return parseFirestoreFields(map.fields || {});
  }
  return null;
}

function parseFirestoreFields(fields: Record<string, Record<string, unknown>>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(fields)) {
    result[key] = parseFirestoreValue(val);
  }
  return result;
}

export async function loadInvitationPublic(slug: string): Promise<InvitationData | null> {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/invitations/${slug}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const doc = await res.json() as { fields?: Record<string, Record<string, unknown>> };
    if (!doc.fields) return null;
    return parseFirestoreFields(doc.fields) as unknown as InvitationData;
  } catch {
    return null;
  }
}
