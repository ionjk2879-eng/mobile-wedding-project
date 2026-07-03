import { apiFetch } from './api';
import { getOrCreateGuestToken } from '../utils/guestToken';

export interface GalleryPhoto {
  id: string;
  url: string;
  guestName: string | null;
  createdAt: string;
  mine: boolean;
}

interface GalleryIdentity {
  guestCode?: string;
}

export const fetchGalleryPhotos = (slug: string, identity: GalleryIdentity): Promise<GalleryPhoto[]> => {
  const params = new URLSearchParams();
  if (identity.guestCode) params.set('guestCode', identity.guestCode);
  else params.set('deviceToken', getOrCreateGuestToken());
  return apiFetch<GalleryPhoto[]>(`/api/gallery/${slug}?${params.toString()}`);
};

export const uploadGalleryPhoto = (
  slug: string,
  file: Blob,
  guestName: string,
  identity: GalleryIdentity,
): Promise<GalleryPhoto> => {
  const formData = new FormData();
  formData.append('file', file, 'photo.jpg');
  formData.append('guestName', guestName);
  if (identity.guestCode) formData.append('guestCode', identity.guestCode);
  else formData.append('deviceToken', getOrCreateGuestToken());
  return apiFetch<GalleryPhoto>(`/api/gallery/${slug}`, { method: 'POST', body: formData });
};

export const deleteGalleryPhoto = (slug: string, photoId: string, identity: GalleryIdentity): Promise<void> => {
  const body: Record<string, string> = {};
  if (identity.guestCode) body.guestCode = identity.guestCode;
  else body.deviceToken = getOrCreateGuestToken();
  return apiFetch(`/api/gallery/${slug}/${photoId}`, { method: 'DELETE', body: JSON.stringify(body) });
};

export const reportGalleryPhoto = (slug: string, photoId: string): Promise<void> =>
  apiFetch(`/api/gallery/${slug}/${photoId}/report`, { method: 'POST' });
