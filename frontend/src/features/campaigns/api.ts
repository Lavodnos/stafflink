import { apiClient } from '@/lib/apiClient';

export type Campaign = {
  id: string;
  codigo: string;
  area: string;
  nombre: string;
  sede: string;
  estado: string;
  created_at?: string;
  updated_at?: string;
};

export async function fetchCampaigns(): Promise<Campaign[]> {
  return apiClient<Campaign[]>('/v1/campaigns/');
}

export async function createCampaign(payload: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>) {
  return apiClient<Campaign>('/v1/campaigns/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCampaign(id: string, payload: Partial<Campaign>) {
  return apiClient<Campaign>(`/v1/campaigns/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
