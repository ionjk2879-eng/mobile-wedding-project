import { apiFetch } from './api';
import { RSVPResponse } from '../types';
import { getOrCreateGuestToken } from '../utils/guestToken';

export const submitRSVP = async (slug: string, formData: Omit<RSVPResponse, 'id' | 'createdAt'>): Promise<void> => {
  const deviceToken = getOrCreateGuestToken();
  await apiFetch(`/api/rsvp/${slug}`, { method: 'POST', body: JSON.stringify({ ...formData, deviceToken }) });
};

export const fetchRSVPResponses = async (slug: string): Promise<RSVPResponse[]> => {
  return apiFetch<RSVPResponse[]>(`/api/rsvp/${slug}`);
};
