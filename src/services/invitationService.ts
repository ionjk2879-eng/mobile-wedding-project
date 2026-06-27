import { apiFetch } from './api';
import { getCurrentUser } from './auth';
import { InvitationData } from '../types';

export const saveInvitation = async (slug: string, data: InvitationData): Promise<void> => {
  if (!getCurrentUser()) throw new Error('로그인이 필요합니다.');
  await apiFetch(`/api/invitations/${slug}`, { method: 'PUT', body: JSON.stringify(data) });
};

export const loadInvitation = async (slug: string): Promise<InvitationData | null> => {
  try {
    return await apiFetch<InvitationData>(`/api/invitations/${slug}`);
  } catch {
    return null;
  }
};

export const checkSlugAvailable = async (slug: string): Promise<boolean> => {
  const res = await apiFetch<{ available: boolean }>(`/api/invitations/${slug}/available`);
  return res.available;
};

export const deleteInvitation = async (slug: string): Promise<void> => {
  await apiFetch(`/api/invitations/${slug}`, { method: 'DELETE' });
};

export const fetchMyInvitations = async (): Promise<{ slug: string; data: InvitationData }[]> => {
  if (!getCurrentUser()) return [];
  return apiFetch<{ slug: string; data: InvitationData }[]>('/api/invitations');
};

export const changeSlug = async (oldSlug: string, newSlug: string): Promise<void> => {
  await apiFetch(`/api/invitations/${oldSlug}/change-slug`, { method: 'POST', body: JSON.stringify({ newSlug }) });
};

export const activatePaidInvitation = async (slug: string, weddingDateISO: string): Promise<void> => {
  await apiFetch(`/api/invitations/${slug}/activate`, { method: 'POST', body: JSON.stringify({ weddingDateISO }) });
};
