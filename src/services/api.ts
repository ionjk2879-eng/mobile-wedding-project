export interface AuthUser {
  uid: string;
  name: string;
  email: string;
  photo: string;
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('sonett_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: AuthUser): void {
  localStorage.setItem('sonett_token', token);
  localStorage.setItem('sonett_user', JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem('sonett_token');
  localStorage.removeItem('sonett_user');
}

export async function apiFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('sonett_token');
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };
  if (!(init.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(path, { ...init, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error || `요청 실패: ${res.status}`);
  }
  return res.json() as Promise<T>;
}
