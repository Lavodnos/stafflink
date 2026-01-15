export type Convocatoria = {
  id: string;
  slug: string;
  titulo?: string | null;
  created_at?: string | null;
  campaign: string;
  encargados?: ConvocatoriaEncargado[] | null;
  modalidad?: string | null;
  condicion?: string | null;
  grupo?: string | null;
  periodo?: string | null;
  semana_trabajo?: number | null;
  cuotas?: number | null;
  notes?: string | null;
  hora_gestion?: string | null;
  descanso?: string | null;
  tipo_contratacion?: string | null;
  razon_social?: string | null;
  remuneracion?: number | null;
  bono_variable?: number | null;
  bono_movilidad?: number | null;
  bono_bienvenida?: number | null;
  bono_permanencia?: number | null;
  bono_asistencia?: number | null;
  cargo_contractual?: string | null;
  pago_capacitacion?: number | null;
  expires_at: string;
  estado: 'activo' | 'expirado' | 'revocado';
};

export type ConvocatoriaEncargado = {
  id: string;
  email?: string | null;
  username?: string | null;
  dni?: string | null;
};

export type ConvocatoriaPayload = Pick<Convocatoria, 'campaign' | 'slug'> & {
  titulo?: string | null;
  encargados?: ConvocatoriaEncargado[] | null;
  modalidad?: string | null;
  condicion?: string | null;
  grupo?: string | null;
  periodo?: string | null;
  semana_trabajo?: number | null;
  cuotas?: number | null;
  notes?: string | null;
  hora_gestion?: string | null;
  descanso?: string | null;
  tipo_contratacion?: string | null;
  razon_social?: string | null;
  remuneracion?: number | null;
  bono_variable?: number | null;
  bono_movilidad?: number | null;
  bono_bienvenida?: number | null;
  bono_permanencia?: number | null;
  bono_asistencia?: number | null;
  cargo_contractual?: string | null;
  pago_capacitacion?: number | null;
  expires_at?: string | null;
};

import { apiClient } from '@/lib/apiClient';
import { normalizeListResponse, type PaginatedResponse } from '@/lib/pagination';

export async function fetchConvocatorias(): Promise<Convocatoria[]> {
  const payload = await apiClient<PaginatedResponse<Convocatoria> | Convocatoria[]>(
    '/v1/convocatorias/',
  );
  return normalizeListResponse<Convocatoria>(payload);
}

export async function createConvocatoria(payload: ConvocatoriaPayload): Promise<Convocatoria> {
  return apiClient('/v1/convocatorias/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateConvocatoria(
  id: string,
  payload: Partial<ConvocatoriaPayload>,
): Promise<Convocatoria> {
  return apiClient(`/v1/convocatorias/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function setConvocatoriaStatus(
  id: string,
  action: 'expire' | 'revoke' | 'activate',
): Promise<Convocatoria> {
  return apiClient(`/v1/convocatorias/${id}/${action}/`, {
    method: 'POST',
  });
}

export async function deleteConvocatoria(id: string): Promise<void> {
  await apiClient(`/v1/convocatorias/${id}/`, {
    method: 'DELETE',
    skipJson: true,
  });
}

export async function fetchEncargados(): Promise<ConvocatoriaEncargado[]> {
  const payload = await apiClient<ConvocatoriaEncargado[] | null>(
    '/v1/iam/users/?status=ACTIVE',
  );
  return Array.isArray(payload) ? payload : [];
}
