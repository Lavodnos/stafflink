import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { PublicApplyPage } from '../PublicApplyPage';

vi.mock('../../modules/public/api', () => {
  return {
    fetchPublicConvocatoria: vi.fn(async () => ({
      titulo: 'Campaña test',
      campaign: 'Test',
      modalidad: 'presencial',
      condicion: 'full_time',
      hora_gestion: '202501',
      descanso: '202501',
      expires_at: new Date().toISOString(),
    })),
    createPublicCandidate: vi.fn(async (payload) => ({
      id: 'mock-id',
      ...payload,
    })),
  };
});

describe('PublicApplyPage', () => {
  function setup(slug = 'camp1') {
    render(
      <MemoryRouter initialEntries={[`/apply/${slug}`]}>
        <Routes>
          <Route path="/apply/:slug" element={<PublicApplyPage />} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it('incluye opción Referido en “Cómo te enteraste”', async () => {
    setup();
    await screen.findByText('Campaña test'); // espera carga de la convocatoria
    fireEvent.click(screen.getByLabelText(/¿Cómo te enteraste/i));
    const option = screen.getByRole('option', { name: /referido/i });
    expect(option).toBeInTheDocument();
  });

  it('cuando elige distrito OTRO, muestra input para especificar y envía ese valor', async () => {
    const api = await import('../../modules/public/api');
    const createSpy = api.createPublicCandidate as unknown as ReturnType<typeof vi.fn>;
    setup();
    await screen.findByText('Campaña test');

    fireEvent.change(screen.getByLabelText(/Distrito de residencia/i), { target: { value: 'OTRO' } });
    const inputOtro = await screen.findByLabelText(/Especifica el distrito/i);
    fireEvent.change(inputOtro, { target: { value: 'Mi Distrito' } });

    // completa mínimos requeridos
    fireEvent.change(screen.getByLabelText(/Nro de documento/i), { target: { value: '1234' } });
    fireEvent.change(screen.getByLabelText(/Apellido paterno/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/Apellido materno/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/Nombres completos/i), { target: { value: 'Postulante' } });
    fireEvent.change(screen.getByLabelText(/^Celular \*/i), { target: { value: '999999999' } });
    fireEvent.change(screen.getByLabelText(/Celular de referencia/i), { target: { value: '999999998' } });
    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText(/Género/i), { target: { value: 'MASCULINO' } });
    fireEvent.change(screen.getByLabelText(/Fecha de nacimiento/i), { target: { value: '2000-01-01' } });
    fireEvent.change(screen.getByLabelText(/^Edad \*/i), { target: { value: '24' } });
    fireEvent.change(screen.getByLabelText(/Estado civil/i), { target: { value: 'SOLTERO' } });
    fireEvent.change(screen.getByLabelText(/N° de hijos/i), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText(/Nivel académico/i), { target: { value: 'SECUNDARIA COMPLETA' } });
    fireEvent.change(screen.getByLabelText(/Carrera/i), { target: { value: 'NINGUNA' } });
    fireEvent.change(screen.getByLabelText(/Nacionalidad/i), { target: { value: 'PERUANA' } });
    fireEvent.change(screen.getByLabelText(/Lugar de residencia/i), { target: { value: 'LIMA METROPOLITANA' } });
    fireEvent.change(screen.getByLabelText(/Dirección de domicilio/i), { target: { value: 'DIR' } });
    fireEvent.change(screen.getByLabelText(/¿Cómo te enteraste/i), { target: { value: 'FACEBOOK' } });
    fireEvent.change(screen.getByLabelText(/Observación/i), { target: { value: 'N/A' } });
    // Al no marcar experiencia en call center, se requiere otra experiencia y tiempo
    fireEvent.change(screen.getByLabelText(/Otra experiencia laboral/i), {
      target: { value: 'SIN EXPERIENCIA LABORAL' },
    });
    fireEvent.change(screen.getAllByLabelText(/Tiempo de experiencia/i)[0], {
      target: { value: '0 MESES' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Enviar postulación/i }));

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalled();
      const payload = (createSpy as unknown as vi.Mock).mock.calls[0][0];
      expect(payload.distrito).toBe('MI DISTRITO'); // se guarda lo escrito en OTRO
    });
  });
});
