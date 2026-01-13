export type Link = {
  id: string;
  slug: string;
  titulo?: string | null;
  campaign: string;
  modalidad?: string | null;
  condicion?: string | null;
  grupo?: string | null;
  periodo?: string | null;
  semana_trabajo?: number | null;
  cuotas?: number | null;
  notes?: string | null;
  hora_gestion?: string | null;
  descanso?: string | null;
  expires_at: string;
  estado: 'activo' | 'expirado' | 'revocado';
};

export type LinkPayload = Pick<Link, 'campaign' | 'slug'> & {
  titulo?: string | null;
  modalidad?: string | null;
  condicion?: string | null;
  grupo?: string | null;
  periodo?: string | null;
  semana_trabajo?: number | null;
  cuotas?: number | null;
  notes?: string | null;
  hora_gestion?: string | null;
  descanso?: string | null;
  expires_at?: string | null;
};

import { apiClient } from '@/lib/apiClient';
import { normalizeListResponse, type PaginatedResponse } from '@/lib/pagination';

export async function fetchLinks(): Promise<Link[]> {
  const payload = await apiClient<PaginatedResponse<Link> | Link[]>('/v1/links/');
  return normalizeListResponse<Link>(payload);
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
