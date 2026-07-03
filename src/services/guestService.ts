import { apiFetch } from './api';
import { Guest, GuestRelation } from '../types';

export const fetchGuests = async (slug: string): Promise<Guest[]> => {
  return apiFetch<Guest[]>(`/api/guests/${slug}`);
};

export const createGuest = async (slug: string, name: string, relation: GuestRelation): Promise<Guest> => {
  return apiFetch<Guest>(`/api/guests/${slug}`, { method: 'POST', body: JSON.stringify({ name, relation }) });
};

export const updateGuest = async (slug: string, code: string, name: string, relation: GuestRelation): Promise<void> => {
  await apiFetch(`/api/guests/${slug}/${code}`, { method: 'PUT', body: JSON.stringify({ name, relation }) });
};

export const deleteGuest = async (slug: string, code: string): Promise<void> => {
  await apiFetch(`/api/guests/${slug}/${code}`, { method: 'DELETE' });
};
