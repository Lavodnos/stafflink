export type Link = {
  id: string;
  slug: string;
  titulo?: string | null;
  campaign: string;
  modalidad?: string | null;
  condicion?: string | null;
  grupo?: string | null;
  expires_at: string;
  estado: 'activo' | 'expirado' | 'revocado';
};

export type LinkPayload = Pick<Link, 'campaign' | 'slug'> & {
  titulo?: string | null;
  modalidad?: string | null;
  condicion?: string | null;
  grupo?: string | null;
  expires_at?: string | null;
};

import { apiClient } from '@/lib/apiClient';

export async function fetchLinks(): Promise<Link[]> {
  return apiClient('/v1/links/');
}

export async function createLink(payload: LinkPayload): Promise<Link> {
  return apiClient('/v1/links/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateLink(id: string, payload: Partial<LinkPayload>): Promise<Link> {
  return apiClient(`/v1/links/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function setLinkStatus(id: string, action: 'expire' | 'revoke' | 'activate'): Promise<Link> {
  return apiClient(`/v1/links/${id}/${action}/`, {
    method: 'POST',
  });
}
