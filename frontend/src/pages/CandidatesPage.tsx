import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToastStore } from '../components/common/Toast';
import { Card, Field, Input, SectionHeader, Select, Textarea } from '../components/ui';
import { ApiError } from '../lib/apiError';
import { usePermission } from '../modules/auth/usePermission';
import type { Candidate, CandidateAssignment, CandidateDocuments, CandidateProcess } from '../modules/candidates/api';
import {
  useCandidate,
  useCandidates,
  useUpdateAssignment,
  useUpdateCandidate,
  useUpdateDocuments,
  useUpdateProcess,
} from '../modules/candidates/hooks';

type Tab = 'datos' | 'documentos' | 'proceso' | 'contrato';

export function CandidatesPage() {
  const canRead = usePermission('candidates.read');
  const canEditDatos = usePermission('candidates.manage');
  const canEditDocs = usePermission('candidates.process');
  const canEditProceso = usePermission('candidates.process');
  const canEditContrato = usePermission('candidates.contract');
  const addToast = useToastStore((s) => s.add);

  const { data: list = [], isLoading: listLoading } = useCandidates(canRead);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('datos');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const { data: detail, isLoading: detailLoading } = useCandidate(canRead ? selectedId ?? undefined : undefined);

  const { register: registerDatos, handleSubmit: submitDatos, reset: resetDatos, formState: datosState, setValue: setDatos } =
    useForm<Candidate>({
      defaultValues: {},
    });
  const {
    register: registerDocs,
    handleSubmit: submitDocs,
    reset: resetDocs,
    formState: docsState,
  } = useForm<CandidateDocuments>();
  const {
    register: registerProceso,
    handleSubmit: submitProceso,
    reset: resetProceso,
    formState: procesoState,
  } = useForm<CandidateProcess>();
  const {
    register: registerContrato,
    handleSubmit: submitContrato,
    reset: resetContrato,
    formState: contratoState,
  } = useForm<CandidateAssignment>();

  useEffect(() => {
    if (detail) {
      resetDatos(detail);
      resetDocs(detail.documents ?? {});
      resetProceso(detail.process ?? {});
      resetContrato(detail.assignment ?? {});
    }
  }, [detail, resetDatos, resetDocs, resetProceso, resetContrato]);

  const updateCandidate = useUpdateCandidate();
  const updateDocs = useUpdateDocuments();
  const updateProceso = useUpdateProcess();
  const updateContrato = useUpdateAssignment();

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return term
      ? list.filter((c) =>
          [c.nombres_completos, c.numero_documento, c.modalidad, c.condicion].some((v) =>
            v?.toLowerCase().includes(term),
          ),
        )
      : list;
  }, [list, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const onSubmitDatos = async (data: Candidate) => {
    if (!selectedId || !canEditDatos) throw new ApiError('Sin permiso para actualizar datos', 403);
    await updateCandidate.mutateAsync({ id: selectedId, payload: data });
    addToast({ type: 'success', message: 'Datos actualizados' });
  };

  const onSubmitDocs = async (data: CandidateDocuments) => {
    if (!selectedId || !canEditDocs) throw new ApiError('Sin permiso para actualizar documentos', 403);
    await updateDocs.mutateAsync({ id: selectedId, payload: data });
    addToast({ type: 'success', message: 'Checklist actualizado' });
  };

  const onSubmitProceso = async (data: CandidateProcess) => {
    if (!selectedId || !canEditProceso) throw new ApiError('Sin permiso para actualizar proceso', 403);
    await updateProceso.mutateAsync({ id: selectedId, payload: data });
    addToast({ type: 'success', message: 'Proceso actualizado' });
  };

  const onSubmitContrato = async (data: CandidateAssignment) => {
    if (!selectedId || !canEditContrato) throw new ApiError('Sin permiso para actualizar contrato', 403);
    await updateContrato.mutateAsync({ id: selectedId, payload: data });
    addToast({ type: 'success', message: 'Contrato actualizado' });
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Candidatos"
        subtitle="Ficha, checklist y proceso. Selecciona un candidato para ver/editar."
      />

      <Card className="space-y-3">
        <SectionHeader title="Listado" actions={listLoading ? <span className="pill">Cargando…</span> : null} />
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Buscar por nombre, documento, modalidad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar candidatos"
            className="max-w-sm"
          />
        </div>
        {!canRead && <p className="text-sm text-gray-500">No tienes permiso para ver candidatos.</p>}
        {!listLoading && canRead && filtered.length === 0 && (
          <p className="text-sm text-gray-500">Sin candidatos.</p>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          {canRead &&
            paged.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`rounded-2xl border p-4 text-left shadow-theme-sm transition ${
                  selectedId === c.id
                    ? 'border-brand-500/50 bg-brand-50 dark:border-brand-500/40 dark:bg-brand-500/10'
                    : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900'
                }`}
                onClick={() => {
                  setSelectedId(c.id);
                  setTab('datos');
                }}
              >
                <p className="text-xs uppercase text-gray-500">{c.numero_documento}</p>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{c.nombres_completos}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {c.apellido_paterno} {c.apellido_materno}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Modalidad: {c.modalidad || '—'} · Cond: {c.condicion || '—'}
                </p>
              </button>
            ))}
        </div>
        {canRead && filtered.length > pageSize && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500">
              Página {page} de {Math.max(1, Math.ceil(filtered.length / pageSize))} · {filtered.length} candidatos
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-secondary px-3 py-1 text-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </button>
              <button
                type="button"
                className="btn-secondary px-3 py-1 text-sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </Card>

      {detailLoading && selectedId && <p className="text-sm text-gray-500">Cargando detalle…</p>}

      {detail && (
        <Card className="space-y-4">
          <SectionHeader
            title={detail.nombres_completos}
            subtitle={`${detail.tipo_documento} ${detail.numero_documento}`}
            actions={<span className="pill">{detail.modalidad || 'sin modalidad'}</span>}
          />

          <div className="flex flex-wrap gap-2">
            {(['datos', 'documentos', 'proceso', 'contrato'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                className={`pill ${tab === t ? 'bg-brand-600 text-white dark:bg-brand-500' : ''}`}
                onClick={() => setTab(t)}
              >
                {t === 'datos' && 'Datos'}
                {t === 'documentos' && 'Documentos'}
                {t === 'proceso' && 'Proceso'}
                {t === 'contrato' && 'Contrato'}
              </button>
            ))}
          </div>

          {tab === 'datos' && (
            <form className="grid gap-4 md:grid-cols-2" onSubmit={submitDatos(onSubmitDatos)}>
              <Field label="Tipo de documento">
                <Select
                  {...registerDatos('tipo_documento')}
                  defaultValue={detail.tipo_documento}
                    disabled={!canEditDatos}
                  >
                    <option value="DNI">DNI</option>
                    <option value="CE">CE</option>
                  </Select>
                </Field>
                <Field label="Número documento">
                  <Input
                    {...registerDatos('numero_documento', {
                      onChange: (e) =>
                        setDatos('numero_documento', e.target.value.toUpperCase(), { shouldValidate: false }),
                    })}
                    disabled={!canEditDatos}
                    defaultValue={detail.numero_documento}
                  />
                </Field>
                <Field label="Apellidos y nombres">
                  <Input
                    {...registerDatos('nombres_completos')}
                    defaultValue={detail.nombres_completos}
                    disabled={!canEditDatos}
                  />
                </Field>
                <Field label="Correo">
                  <Input {...registerDatos('email')} defaultValue={detail.email} disabled={!canEditDatos} />
                </Field>
                <Field label="Teléfono">
                  <Input {...registerDatos('telefono')} defaultValue={detail.telefono} disabled={!canEditDatos} />
                </Field>
                <Field label="Teléfono referencia">
                  <Input
                    {...registerDatos('telefono_referencia')}
                    defaultValue={detail.telefono_referencia ?? ''}
                    disabled={!canEditDatos}
                  />
                </Field>
                <Field label="Estado civil">
                  <Input {...registerDatos('estado_civil')} defaultValue={detail.estado_civil ?? ''} disabled={!canEditDatos} />
                </Field>
                <Field label="Nivel académico">
                  <Input
                    {...registerDatos('nivel_academico')}
                    defaultValue={detail.nivel_academico ?? ''}
                    disabled={!canEditDatos}
                  />
                </Field>
                <Field label="Modalidad (copia)">
                  <Input {...registerDatos('modalidad')} defaultValue={detail.modalidad ?? ''} disabled={!canEditDatos} />
                </Field>
                <Field label="Condición (copia)">
                  <Input {...registerDatos('condicion')} defaultValue={detail.condicion ?? ''} disabled={!canEditDatos} />
                </Field>
                <Field label="Hora de gestión">
                  <Input {...registerDatos('hora_gestion')} defaultValue={detail.hora_gestion ?? ''} disabled={!canEditDatos} />
                </Field>
                <Field label="Descanso">
                  <Input {...registerDatos('descanso')} defaultValue={detail.descanso ?? ''} disabled={!canEditDatos} />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Observación">
                    <Textarea
                      {...registerDatos('observacion')}
                      defaultValue={detail.observacion ?? ''}
                      disabled={!canEditDatos}
                    />
                  </Field>
                </div>
                {datosState.errors.root && (
                  <p className="text-sm text-error-500 md:col-span-2">{datosState.errors.root.message}</p>
                )}
                <div className="flex gap-3 md:col-span-2">
                  <button type="submit" className="btn-primary" disabled={datosState.isSubmitting || !canEditDatos}>
                    Guardar datos
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => resetDatos(detail)}
                    disabled={!canEditDatos}
                  >
                    Deshacer
                  </button>
                </div>
                {!canEditDatos && (
                  <p className="text-xs text-gray-500 md:col-span-2">
                    Sin permiso para editar los datos del candidato.
                  </p>
                )}
              </form>
          )}

          {tab === 'documentos' && (
              <form className="grid gap-4 md:grid-cols-3" onSubmit={submitDocs(onSubmitDocs)}>
                <Field label="CV entregado">
                  <Select
                    {...registerDocs('cv_entregado')}
                    defaultValue={String(detail.documents?.cv_entregado ?? '')}
                    disabled={!canEditDocs}
                  >
                    <option value="">—</option>
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </Select>
                </Field>
                <Field label="DNI entregado">
                  <Select
                    {...registerDocs('dni_entregado')}
                    defaultValue={String(detail.documents?.dni_entregado ?? '')}
                    disabled={!canEditDocs}
                  >
                    <option value="">—</option>
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </Select>
                </Field>
                <Field label="Certificado">
                  <Select
                    {...registerDocs('certificado_entregado')}
                    defaultValue={String(detail.documents?.certificado_entregado ?? '')}
                    disabled={!canEditDocs}
                  >
                    <option value="">—</option>
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </Select>
                </Field>
                <Field label="Recibo servicio">
                  <Select
                    {...registerDocs('recibo_servicio_entregado')}
                    defaultValue={String(detail.documents?.recibo_servicio_entregado ?? '')}
                    disabled={!canEditDocs}
                  >
                    <option value="">—</option>
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </Select>
                </Field>
                <Field label="Ficha de datos">
                  <Select
                    {...registerDocs('ficha_datos_entregado')}
                    defaultValue={String(detail.documents?.ficha_datos_entregado ?? '')}
                    disabled={!canEditDocs}
                  >
                    <option value="">—</option>
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </Select>
                </Field>
                <Field label="Autorización de datos">
                  <Select
                    {...registerDocs('autorizacion_datos_entregado')}
                    defaultValue={String(detail.documents?.autorizacion_datos_entregado ?? '')}
                    disabled={!canEditDocs}
                  >
                    <option value="">—</option>
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </Select>
                </Field>
                <Field label="Estado checklist">
                  <Input {...registerDocs('status')} defaultValue={detail.documents?.status ?? ''} disabled={!canEditDocs} />
                </Field>
                <div className="md:col-span-3">
                  <Field label="Observación">
                    <Textarea
                      {...registerDocs('observacion')}
                      defaultValue={detail.documents?.observacion ?? ''}
                      disabled={!canEditDocs}
                    />
                  </Field>
                </div>
                {docsState.errors.root && (
                  <p className="text-sm text-error-500 md:col-span-3">{docsState.errors.root.message}</p>
                )}
                <div className="flex gap-3 md:col-span-3">
                  <button type="submit" className="btn-primary" disabled={docsState.isSubmitting || !canEditDocs}>
                    Guardar checklist
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => resetDocs(detail.documents ?? {})}
                    disabled={!canEditDocs}
                  >
                    Deshacer
                  </button>
                </div>
                {!canEditDocs && (
                  <p className="text-xs text-gray-500 md:col-span-3">Sin permiso para actualizar documentos.</p>
                )}
              </form>
          )}

          {tab === 'proceso' && (
              <form className="grid gap-4 md:grid-cols-2" onSubmit={submitProceso(onSubmitProceso)}>
                <Field label="Envío DNI">
                  <Input
                    type="datetime-local"
                    {...registerProceso('envio_dni_at')}
                    defaultValue={detail.process?.envio_dni_at ?? ''}
                    disabled={!canEditProceso}
                  />
                </Field>
                <Field label="Test psicológico">
                  <Input
                    type="datetime-local"
                    {...registerProceso('test_psicologico_at')}
                    defaultValue={detail.process?.test_psicologico_at ?? ''}
                    disabled={!canEditProceso}
                  />
                </Field>
                <Field label="Validación PC">
                  <Input
                    type="datetime-local"
                    {...registerProceso('validacion_pc_at')}
                    defaultValue={detail.process?.validacion_pc_at ?? ''}
                    disabled={!canEditProceso}
                  />
                </Field>
                <Field label="Evaluación día 0">
                  <Input
                    type="datetime-local"
                    {...registerProceso('evaluacion_dia0_at')}
                    defaultValue={detail.process?.evaluacion_dia0_at ?? ''}
                    disabled={!canEditProceso}
                  />
                </Field>
                <Field label="Inicio capacitación">
                  <Input
                    type="datetime-local"
                    {...registerProceso('inicio_capacitacion_at')}
                    defaultValue={detail.process?.inicio_capacitacion_at ?? ''}
                    disabled={!canEditProceso}
                  />
                </Field>
                <Field label="Fin capacitación">
                  <Input
                    type="datetime-local"
                    {...registerProceso('fin_capacitacion_at')}
                    defaultValue={detail.process?.fin_capacitacion_at ?? ''}
                    disabled={!canEditProceso}
                  />
                </Field>
                <Field label="Conexión OJT">
                  <Input
                    type="datetime-local"
                    {...registerProceso('conexion_ojt_at')}
                    defaultValue={detail.process?.conexion_ojt_at ?? ''}
                    disabled={!canEditProceso}
                  />
                </Field>
                <Field label="Conexión OP">
                  <Input
                    type="datetime-local"
                    {...registerProceso('conexion_op_at')}
                    defaultValue={detail.process?.conexion_op_at ?? ''}
                    disabled={!canEditProceso}
                  />
                </Field>
                <Field label="Pago capacitación">
                  <Input
                    type="datetime-local"
                    {...registerProceso('pago_capacitacion_at')}
                    defaultValue={detail.process?.pago_capacitacion_at ?? ''}
                    disabled={!canEditProceso}
                  />
                </Field>
                <Field label="Estado día 0">
                  <Input {...registerProceso('estado_dia0')} defaultValue={detail.process?.estado_dia0 ?? ''} disabled={!canEditProceso} />
                </Field>
                <Field label="Obs día 0">
                  <Textarea
                    {...registerProceso('observaciones_dia0')}
                    defaultValue={detail.process?.observaciones_dia0 ?? ''}
                    disabled={!canEditProceso}
                  />
                </Field>
                <Field label="Estado día 1">
                  <Input {...registerProceso('estado_dia1')} defaultValue={detail.process?.estado_dia1 ?? ''} disabled={!canEditProceso} />
                </Field>
                <Field label="Obs día 1">
                  <Textarea
                    {...registerProceso('observaciones_dia1')}
                    defaultValue={detail.process?.observaciones_dia1 ?? ''}
                    disabled={!canEditProceso}
                  />
                </Field>
                <Field label="Windows status">
                  <Input {...registerProceso('windows_status')} defaultValue={detail.process?.windows_status ?? ''} disabled={!canEditProceso} />
                </Field>
                <Field label="Estado final">
                  <Input {...registerProceso('status_final')} defaultValue={detail.process?.status_final ?? ''} disabled={!canEditProceso} />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Observación final">
                    <Textarea
                      {...registerProceso('status_observacion')}
                      defaultValue={detail.process?.status_observacion ?? ''}
                      disabled={!canEditProceso}
                    />
                  </Field>
                </div>
                {procesoState.errors.root && (
                  <p className="text-sm text-error-500 md:col-span-2">{procesoState.errors.root.message}</p>
                )}
                <div className="flex gap-3 md:col-span-2">
                  <button type="submit" className="btn-primary" disabled={procesoState.isSubmitting || !canEditProceso}>
                    Guardar proceso
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => resetProceso(detail.process ?? {})}
                    disabled={!canEditProceso}
                  >
                    Deshacer
                  </button>
                </div>
                {!canEditProceso && (
                  <p className="text-xs text-gray-500 md:col-span-2">Sin permiso para actualizar el proceso.</p>
                )}
              </form>
          )}

          {tab === 'contrato' && (
              <form className="grid gap-4 md:grid-cols-2" onSubmit={submitContrato(onSubmitContrato)}>
                <Field label="Tipo de contratación">
                  <Input
                    {...registerContrato('tipo_contratacion')}
                    defaultValue={detail.assignment?.tipo_contratacion ?? ''}
                    disabled={!canEditContrato}
                  />
                </Field>
                <Field label="Razón social">
                  <Input
                    {...registerContrato('razon_social')}
                    defaultValue={detail.assignment?.razon_social ?? ''}
                    disabled={!canEditContrato}
                  />
                </Field>
                <Field label="Remuneración">
                  <Input
                    type="number"
                    step="0.01"
                    {...registerContrato('remuneracion', { valueAsNumber: true })}
                    disabled={!canEditContrato}
                    defaultValue={detail.assignment?.remuneracion ?? ''}
                  />
                </Field>
                <Field label="Bono variable">
                  <Input
                    type="number"
                    step="0.01"
                    {...registerContrato('bono_variable', { valueAsNumber: true })}
                    disabled={!canEditContrato}
                    defaultValue={detail.assignment?.bono_variable ?? ''}
                  />
                </Field>
                <Field label="Bono movilidad">
                  <Input
                    type="number"
                    step="0.01"
                    {...registerContrato('bono_movilidad', { valueAsNumber: true })}
                    disabled={!canEditContrato}
                    defaultValue={detail.assignment?.bono_movilidad ?? ''}
                  />
                </Field>
                <Field label="Bono bienvenida">
                  <Input
                    type="number"
                    step="0.01"
                    {...registerContrato('bono_bienvenida', { valueAsNumber: true })}
                    disabled={!canEditContrato}
                    defaultValue={detail.assignment?.bono_bienvenida ?? ''}
                  />
                </Field>
                <Field label="Bono permanencia">
                  <Input
                    type="number"
                    step="0.01"
                    {...registerContrato('bono_permanencia', { valueAsNumber: true })}
                    disabled={!canEditContrato}
                    defaultValue={detail.assignment?.bono_permanencia ?? ''}
                  />
                </Field>
                <Field label="Bono asistencia">
                  <Input
                    type="number"
                    step="0.01"
                    {...registerContrato('bono_asistencia', { valueAsNumber: true })}
                    disabled={!canEditContrato}
                    defaultValue={detail.assignment?.bono_asistencia ?? ''}
                  />
                </Field>
                <Field label="Cargo contractual">
                  <Input
                    {...registerContrato('cargo_contractual')}
                    defaultValue={detail.assignment?.cargo_contractual ?? ''}
                    disabled={!canEditContrato}
                  />
                </Field>
                <Field label="Régimen de pago">
                  <Input
                    {...registerContrato('regimen_pago')}
                    defaultValue={detail.assignment?.regimen_pago ?? ''}
                    disabled={!canEditContrato}
                  />
                </Field>
                <Field label="Fecha inicio">
                  <Input
                    type="date"
                    {...registerContrato('fecha_inicio')}
                    defaultValue={detail.assignment?.fecha_inicio ?? ''}
                    disabled={!canEditContrato}
                  />
                </Field>
                <Field label="Fecha fin">
                  <Input
                    type="date"
                    {...registerContrato('fecha_fin')}
                    defaultValue={detail.assignment?.fecha_fin ?? ''}
                    disabled={!canEditContrato}
                  />
                </Field>
                <Field label="Estado">
                  <Input {...registerContrato('estado')} defaultValue={detail.assignment?.estado ?? ''} disabled={!canEditContrato} />
                </Field>
                {contratoState.errors.root && (
                  <p className="text-sm text-error-500 md:col-span-2">{contratoState.errors.root.message}</p>
                )}
                <div className="flex gap-3 md:col-span-2">
                  <button type="submit" className="btn-primary" disabled={contratoState.isSubmitting || !canEditContrato}>
                    Guardar contrato
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => resetContrato(detail.assignment ?? {})}
                    disabled={!canEditContrato}
                  >
                    Deshacer
                  </button>
                </div>
                {!canEditContrato && (
                  <p className="text-xs text-gray-500 md:col-span-2">Sin permiso para actualizar contrato.</p>
                )}
              </form>
          )}
        </Card>
      )}
    </div>
  );
}
