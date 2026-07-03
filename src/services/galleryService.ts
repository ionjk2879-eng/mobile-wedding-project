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

export interface GalleryAdminPhoto {
  id: string;
  url: string;
  guestName: string | null;
  createdAt: string;
  hiddenAt: string | null;
}

export interface GalleryAdminList {
  photos: GalleryAdminPhoto[];
  total: number;
  limit: number;
}

// 관리 페이지 전용 — 숨김 처리된 사진까지 전부 포함, 로그인한 청첩장 소유자만 호출 가능
export const fetchGalleryAdminList = (slug: string): Promise<GalleryAdminList> =>
  apiFetch<GalleryAdminList>(`/api/gallery/${slug}/admin`);

export const unhideGalleryPhoto = (slug: string, photoId: string): Promise<void> =>
  apiFetch(`/api/gallery/${slug}/${photoId}/unhide`, { method: 'POST' });

// 관리자 삭제는 Authorization 헤더(청첩장 소유자 인증)만으로 처리되며, 하객 식별값을 보내지 않는다
export const adminDeleteGalleryPhoto = (slug: string, photoId: string): Promise<void> =>
  apiFetch(`/api/gallery/${slug}/${photoId}`, { method: 'DELETE', body: JSON.stringify({}) });
