import { apiFetch } from '../../lib/http';

export type Candidate = {
  id: string;
  link_id: string;
  tipo_documento: string;
  numero_documento: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombres_completos: string;
  telefono: string;
  telefono_referencia?: string | null;
  email: string;
  sexo?: string | null;
  fecha_nacimiento?: string | null;
  edad?: number | null;
  estado_civil?: string | null;
  numero_hijos?: number | null;
  nivel_academico?: string | null;
  carrera?: string | null;
  nacionalidad?: string | null;
  lugar_residencia?: string | null;
  distrito?: string | null;
  direccion?: string | null;
  has_callcenter_experience?: boolean | null;
  callcenter_experience_type?: string | null;
  callcenter_experience_time?: string | null;
  other_experience_type?: string | null;
  other_experience_time?: string | null;
  enteraste_oferta?: string | null;
  observacion?: string | null;
  modalidad?: string | null;
  condicion?: string | null;
  hora_gestion?: string | null;
  descanso?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CandidateDocuments = {
  cv_entregado?: boolean;
  dni_entregado?: boolean;
  certificado_entregado?: boolean;
  recibo_servicio_entregado?: boolean;
  ficha_datos_entregado?: boolean;
  autorizacion_datos_entregado?: boolean;
  status?: string | null;
  observacion?: string | null;
};

export type CandidateProcess = {
  envio_dni_at?: string | null;
  test_psicologico_at?: string | null;
  validacion_pc_at?: string | null;
  evaluacion_dia0_at?: string | null;
  inicio_capacitacion_at?: string | null;
  fin_capacitacion_at?: string | null;
  conexion_ojt_at?: string | null;
  conexion_op_at?: string | null;
  pago_capacitacion_at?: string | null;
  estado_dia0?: string | null;
  observaciones_dia0?: string | null;
  estado_dia1?: string | null;
  observaciones_dia1?: string | null;
  windows_status?: string | null;
  asistencia_extra?: Record<string, string> | null;
  status_final?: string | null;
  status_observacion?: string | null;
  updated_by?: string | null;
  updated_at?: string | null;
};

export type CandidateAssignment = {
  tipo_contratacion?: string | null;
  razon_social?: string | null;
  remuneracion?: number | null;
  bono_variable?: number | null;
  bono_movilidad?: number | null;
  bono_bienvenida?: number | null;
  bono_permanencia?: number | null;
  bono_asistencia?: number | null;
  cargo_contractual?: string | null;
  regimen_pago?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  estado?: string | null;
};

export type CandidateDetail = Candidate & {
  documents?: CandidateDocuments;
  process?: CandidateProcess;
  assignment?: CandidateAssignment;
};

export async function fetchCandidates(): Promise<Candidate[]> {
  return apiFetch<Candidate[]>('/v1/candidates/');
}

export async function fetchCandidate(id: string): Promise<CandidateDetail> {
  return apiFetch<CandidateDetail>(`/v1/candidates/${id}/`);
}

export async function updateCandidate(id: string, payload: Partial<Candidate>) {
  return apiFetch<CandidateDetail>(`/v1/candidates/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function updateCandidateDocuments(id: string, payload: CandidateDocuments) {
  return apiFetch<CandidateDetail>(`/v1/candidates/${id}/documents/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function updateCandidateProcess(id: string, payload: CandidateProcess) {
  return apiFetch<CandidateDetail>(`/v1/candidates/${id}/process/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function updateCandidateAssignment(id: string, payload: CandidateAssignment) {
  return apiFetch<CandidateDetail>(`/v1/candidates/${id}/assignment/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
