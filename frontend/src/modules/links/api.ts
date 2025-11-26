import { apiFetch } from '../../lib/http';

export type Link = {
  id: string;
  campaign: string; // campaign id
  grupo?: string;
  user_id?: string | null;
  user_name?: string | null;
  periodo?: string | null;
  slug: string;
  titulo: string;
  cuotas?: number | null;
  semana_trabajo?: number | null;
  expires_at: string;
  notes?: string | null;
  modalidad: string;
  condicion: string;
  estado: string;
  hora_gestion?: string | null;
  descanso?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type LinkPayload = Omit<Link, 'id' | 'created_at' | 'updated_at'>;

export async function fetchLinks(): Promise<Link[]> {
  return apiFetch<Link[]>('/v1/links/');
}

export async function createLink(payload: LinkPayload) {
  return apiFetch<Link>('/v1/links/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateLink(id: string, payload: Partial<Link>) {
  return apiFetch<Link>(`/v1/links/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function setLinkStatus(id: string, action: 'expire' | 'revoke' | 'activate') {
  return apiFetch<Link>(`/v1/links/${id}/${action}/`, { method: 'POST' });
}
