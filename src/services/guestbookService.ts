import { apiFetch } from './api';
import { GuestMessage } from '../types';

export const submitGuestMessage = async (
  slug: string,
  data: { name: string; content: string; password: string; side: 'groom' | 'bride' }
): Promise<void> => {
  await apiFetch(`/api/guestbook/${slug}`, { method: 'POST', body: JSON.stringify(data) });
};

export const fetchGuestMessages = async (slug: string): Promise<GuestMessage[]> => {
  return apiFetch<GuestMessage[]>(`/api/guestbook/${slug}`);
};

export const deleteGuestMessage = async (slug: string, messageId: string, inputPassword: string): Promise<boolean> => {
  try {
    await apiFetch(`/api/guestbook/${slug}/${messageId}`, {
      method: 'DELETE',
      body: JSON.stringify({ password: inputPassword }),
    });
    return true;
  } catch {
    return false;
  }
};
