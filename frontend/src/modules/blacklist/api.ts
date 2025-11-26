import { apiFetch } from '../../lib/http';

export type BlacklistEntry = {
  id: string;
  dni: string;
  nombres: string;
  descripcion?: string;
  estado: string;
  created_at?: string;
  updated_at?: string;
};

export async function fetchBlacklist(): Promise<BlacklistEntry[]> {
  return apiFetch<BlacklistEntry[]>('/v1/blacklist/');
}

export async function createBlacklistEntry(
  payload: Omit<BlacklistEntry, 'id' | 'created_at' | 'updated_at'>,
): Promise<BlacklistEntry> {
  return apiFetch<BlacklistEntry>('/v1/blacklist/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateBlacklistEntry(
  id: string,
  payload: Partial<BlacklistEntry>,
): Promise<BlacklistEntry> {
  return apiFetch<BlacklistEntry>(`/v1/blacklist/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteBlacklistEntry(id: string): Promise<void> {
  await apiFetch(`/v1/blacklist/${id}/`, { method: 'DELETE', skipJson: true });
}
