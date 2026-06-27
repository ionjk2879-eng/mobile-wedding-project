import { InvitationData } from '../types';

export async function loadInvitationPublic(slug: string): Promise<InvitationData | null> {
  try {
    const res = await fetch(`/api/invitations/${slug}`);
    if (!res.ok) return null;
    return await res.json() as InvitationData;
  } catch {
    return null;
  }
}
