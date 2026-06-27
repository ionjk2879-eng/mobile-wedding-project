import { apiFetch } from './api';
import { RSVPResponse } from '../types';

export const submitRSVP = async (slug: string, formData: Omit<RSVPResponse, 'id' | 'createdAt'>): Promise<void> => {
  await apiFetch(`/api/rsvp/${slug}`, { method: 'POST', body: JSON.stringify(formData) });
};

export const fetchRSVPResponses = async (slug: string): Promise<RSVPResponse[]> => {
  return apiFetch<RSVPResponse[]>(`/api/rsvp/${slug}`);
};
