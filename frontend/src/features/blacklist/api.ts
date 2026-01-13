import { apiClient } from '@/lib/apiClient';
import { normalizeListResponse, type PaginatedResponse } from '@/lib/pagination';

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
  const payload = await apiClient<PaginatedResponse<BlacklistEntry> | BlacklistEntry[]>(
    '/v1/blacklist/',
  );
  return normalizeListResponse<BlacklistEntry>(payload);
}

export async function createBlacklistEntry(
  payload: Omit<BlacklistEntry, 'id' | 'created_at' | 'updated_at'>,
): Promise<BlacklistEntry> {
  return apiClient<BlacklistEntry>('/v1/blacklist/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateBlacklistEntry(
  id: string,
  payload: Partial<BlacklistEntry>,
): Promise<BlacklistEntry> {
  return apiClient<BlacklistEntry>(`/v1/blacklist/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteBlacklistEntry(id: string): Promise<void> {
  await apiClient(`/v1/blacklist/${id}/`, { method: 'DELETE', skipJson: true });
}
