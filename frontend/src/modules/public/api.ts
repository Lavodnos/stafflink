import { apiClient } from '../../lib/apiClient';

export type PublicLink = {
  id: string;
  titulo: string;
  slug: string;
  campaign: string;
  modalidad: string;
  condicion: string;
  hora_gestion: string;
  descanso: string;
  cuotas?: number | null;
  semana_trabajo?: number | null;
  expires_at: string;
};

export type PublicCandidatePayload = {
  link_slug: string;
  tipo_documento: string;
  numero_documento: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombres_completos: string;
  telefono: string;
  telefono_referencia?: string;
  email: string;
  sexo?: string;
  fecha_nacimiento?: string;
  edad?: number;
  estado_civil?: string;
  numero_hijos?: number;
  nivel_academico?: string;
  carrera?: string;
  nacionalidad?: string;
  lugar_residencia?: string;
  distrito?: string;
  direccion?: string;
  has_callcenter_experience: boolean;
  callcenter_experience_type?: string;
  callcenter_experience_time?: string;
  other_experience_type?: string;
  other_experience_time?: string;
  enteraste_oferta?: string;
  observacion?: string;
};

export async function fetchPublicLink(slug: string): Promise<PublicLink> {
  return apiClient<PublicLink>(`/v1/public/links/${slug}`);
}

export async function createPublicCandidate(
  data: PublicCandidatePayload,
): Promise<{ id: string }> {
  return apiClient<{ id: string }>(`/v1/public/candidates`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
