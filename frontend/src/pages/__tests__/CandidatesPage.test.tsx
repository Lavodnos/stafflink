import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { CandidatesPage } from '../CandidatesPage';

const candidateDetail = {
  id: '1',
  tipo_documento: 'dni',
  numero_documento: '12345678',
  nombres_completos: 'Postulante Test',
  email: 'postulante@test.com',
  telefono: '999999999',
  telefono_referencia: '888888888',
  sexo: 'MASCULINO',
  fecha_nacimiento: '2000-01-01',
  edad: 24,
  estado_civil: 'SOLTERO',
  numero_hijos: 0,
  nivel_academico: 'SECUNDARIA COMPLETA',
  carrera: 'NINGUNA',
  nacionalidad: 'PERUANA',
  lugar_residencia: 'LIMA METROPOLITANA',
  distrito: 'ATE',
  direccion: 'DIRECCION',
  has_callcenter_experience: true,
  callcenter_experience_type: 'EXPERIENCIA ATC CALL CENTER',
  callcenter_experience_time: '1 - 3 MESES',
  other_experience_type: 'SIN EXPERIENCIA LABORAL',
  other_experience_time: '0 MESES',
  enteraste_oferta: 'FACEBOOK',
  observacion: 'OBS',
  modalidad: 'presencial',
  condicion: 'full_time',
  hora_gestion: '202501',
  descanso: '202501',
  documents: {
    cv_entregado: false,
    dni_entregado: false,
    certificado_entregado: false,
    recibo_servicio_entregado: false,
    ficha_datos_entregado: false,
    autorizacion_datos_entregado: false,
    status: 'pendiente',
    observacion: '',
  },
  process: {
    envio_dni_at: null,
    test_psicologico_at: null,
    validacion_pc_at: null,
    evaluacion_dia0_at: null,
    inicio_capacitacion_at: null,
    fin_capacitacion_at: null,
    conexion_ojt_at: null,
    conexion_op_at: null,
    pago_capacitacion_at: null,
    estado_dia0: '',
    observaciones_dia0: '',
    estado_dia1: '',
    observaciones_dia1: '',
    windows_status: '',
    asistencia_extra: null,
    status_final: '',
    status_observacion: '',
  },
  assignment: {
    tipo_contratacion: '',
    razon_social: '',
    remuneracion: null,
    bono_variable: null,
    bono_movilidad: null,
    bono_bienvenida: null,
    bono_permanencia: null,
    bono_asistencia: null,
    cargo_contractual: '',
    regimen_pago: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'activo',
  },
};

const updateCandidateMock = vi.fn(async () => ({}));
const updateDocsMock = vi.fn(async () => ({}));
const updateProcesoMock = vi.fn(async () => ({}));
const updateContratoMock = vi.fn(async () => ({}));

vi.mock('@/features/candidates', () => {
  return {
    useCandidates: () => ({
      data: [
        {
          id: '1',
          numero_documento: candidateDetail.numero_documento,
          nombres_completos: candidateDetail.nombres_completos,
          modalidad: candidateDetail.modalidad,
          condicion: candidateDetail.condicion,
        },
      ],
      isLoading: false,
    }),
    useCandidate: () => ({
      data: candidateDetail,
      isLoading: false,
    }),
    useUpdateCandidate: () => ({ mutateAsync: updateCandidateMock }),
    useUpdateDocuments: () => ({ mutateAsync: updateDocsMock }),
    useUpdateProcess: () => ({ mutateAsync: updateProcesoMock }),
    useUpdateAssignment: () => ({ mutateAsync: updateContratoMock }),
  };
});

// Mock auth/permission hooks
vi.mock('@/modules/auth/usePermission', () => ({
  usePermission: () => true,
}));

vi.mock('@/modules/auth/useAuth', () => ({
  useAuth: () => ({
    user: null,
    logout: vi.fn(),
    hasPermission: () => true,
  }),
}));

vi.mock('../modules/auth/usePermission', () => ({
  usePermission: () => true,
}));

describe('CandidatesPage detalle', () => {
  function openModal() {
    render(
      <MemoryRouter>
        <CandidatesPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /Ver \/ Editar/i }));
  }

  it('envía datos básicos al guardar', async () => {
    openModal();
    await screen.findByText(/Detalle de candidato/i);
    fireEvent.click(screen.getByRole('button', { name: /Guardar datos/i }));
    await waitFor(() => expect(updateCandidateMock).toHaveBeenCalled());
  });

  it('envía documentos al guardar', async () => {
    openModal();
    await screen.findByText(/Detalle de candidato/i);
    fireEvent.click(screen.getByRole('button', { name: /Documentos/i }));
    fireEvent.click(screen.getByRole('button', { name: /Guardar checklist/i }));
    await waitFor(() => expect(updateDocsMock).toHaveBeenCalled());
  });

  it('envía proceso al guardar', async () => {
    openModal();
    await screen.findByText(/Detalle de candidato/i);
    fireEvent.click(screen.getByRole('button', { name: /Proceso/i }));
    fireEvent.click(screen.getByRole('button', { name: /Guardar proceso/i }));
    await waitFor(() => expect(updateProcesoMock).toHaveBeenCalled());
  });

  it('envía contrato al guardar', async () => {
    openModal();
    await screen.findByText(/Detalle de candidato/i);
    fireEvent.click(screen.getByRole('button', { name: /Contrato/i }));
    fireEvent.click(screen.getByRole('button', { name: /Guardar contrato/i }));
    await waitFor(() => expect(updateContratoMock).toHaveBeenCalled());
  });
});
