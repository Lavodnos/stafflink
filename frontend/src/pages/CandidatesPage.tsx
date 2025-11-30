import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  Card,
  Field,
  Input,
  SectionHeader,
  Select,
  Textarea,
  ErrorText,
} from "../components/ui";
import { ApiError } from "../lib/apiError";
import { usePermission } from "../modules/auth/usePermission";
import type {
  Candidate,
  CandidateAssignment,
  CandidateDocuments,
  CandidateProcess,
} from "@/features/candidates";
import {
  useCandidate,
  useCandidates,
  useUpdateAssignment,
  useUpdateCandidate,
  useUpdateDocuments,
  useUpdateProcess,
} from "@/features/candidates";

type Tab = "datos" | "documentos" | "proceso" | "contrato";

type Mode = "list" | "create";

const datosSchema = z.object({
  nombres_completos: z.string().trim().min(1, "Requerido"),
  numero_documento: z.string().trim().min(4, "Requerido"),
  tipo_documento: z.string().trim().min(1, "Requerido"),
  email: z.string().trim().email("Email inválido"),
  telefono: z.string().trim().min(5, "Teléfono requerido"),
  sexo: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
  edad: z.coerce.number().optional().nullable(),
  estado_civil: z.string().optional(),
  numero_hijos: z.coerce.number().optional().nullable(),
  nivel_academico: z.string().optional(),
  carrera: z.string().optional(),
  nacionalidad: z.string().optional(),
  lugar_residencia: z.string().optional(),
  distrito: z.string().optional(),
  direccion: z.string().optional(),
  has_callcenter_experience: z.boolean().optional().nullable(),
  callcenter_experience_type: z.string().optional(),
  callcenter_experience_time: z.string().optional(),
  other_experience_type: z.string().optional(),
  other_experience_time: z.string().optional(),
  enteraste_oferta: z.string().optional(),
  observacion: z.string().optional(),
  modalidad: z.string().optional(),
  condicion: z.string().optional(),
  hora_gestion: z.string().optional(),
  descanso: z.string().optional(),
});

const docsSchema = z.object({
  cv_entregado: z.boolean().optional(),
  dni_entregado: z.boolean().optional(),
  certificado_entregado: z.boolean().optional(),
  recibo_servicio_entregado: z.boolean().optional(),
  ficha_datos_entregado: z.boolean().optional(),
  autorizacion_datos_entregado: z.boolean().optional(),
  status: z.string().optional().nullable(),
  observacion: z.string().optional().nullable(),
});

const procesoSchema = z.object({
  envio_dni_at: z.string().optional().nullable(),
  test_psicologico_at: z.string().optional().nullable(),
  validacion_pc_at: z.string().optional().nullable(),
  evaluacion_dia0_at: z.string().optional().nullable(),
  inicio_capacitacion_at: z.string().optional().nullable(),
  fin_capacitacion_at: z.string().optional().nullable(),
  conexion_ojt_at: z.string().optional().nullable(),
  conexion_op_at: z.string().optional().nullable(),
  pago_capacitacion_at: z.string().optional().nullable(),
  estado_dia0: z.string().optional().nullable(),
  observaciones_dia0: z.string().optional().nullable(),
  estado_dia1: z.string().optional().nullable(),
  observaciones_dia1: z.string().optional().nullable(),
  windows_status: z.string().optional().nullable(),
  asistencia_extra: z.record(z.string(), z.string()).optional().nullable(),
  status_final: z.string().optional().nullable(),
  status_observacion: z.string().optional().nullable(),
  updated_by: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
});

const contratoSchema = z.object({
  tipo_contratacion: z.string().optional().nullable(),
  razon_social: z.string().optional().nullable(),
  remuneracion: z.coerce.number().optional().nullable(),
  bono_variable: z.coerce.number().optional().nullable(),
  bono_movilidad: z.coerce.number().optional().nullable(),
  bono_bienvenida: z.coerce.number().optional().nullable(),
  bono_permanencia: z.coerce.number().optional().nullable(),
  bono_asistencia: z.coerce.number().optional().nullable(),
  cargo_contractual: z.string().optional().nullable(),
  regimen_pago: z.string().optional().nullable(),
  fecha_inicio: z.string().optional().nullable(),
  fecha_fin: z.string().optional().nullable(),
  estado: z.string().optional().nullable(),
});
export function CandidatesPage({ mode = "list" }: { mode?: Mode }) {
  const navigate = useNavigate();
  const canRead = usePermission("candidates.read");
  const canEditDatos = usePermission("candidates.manage");
  const canEditDocs = usePermission("candidates.process");
  const canEditProceso = usePermission("candidates.process");
  const canEditContrato = usePermission("candidates.contract");

  const [searchParams] = useSearchParams();
  const linkFilterId = searchParams.get("link_id") ?? undefined;
  const linkFilterSlug = searchParams.get("link_slug") ?? undefined;
  const linkFilterTitle = searchParams.get("link_title") ?? undefined;

  const { data: list = [], isLoading: listLoading } = useCandidates(
    canRead,
    linkFilterId,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [tab, setTab] = useState<Tab>("datos");
  const [search, setSearch] = useState("");

  const { data: detail, isLoading: detailLoading } = useCandidate(
    canRead ? (selectedId ?? undefined) : undefined,
  );

  const {
    register: registerDatos,
    handleSubmit: submitDatos,
    reset: resetDatos,
    formState: datosState,
    setValue: setDatos,
  } = useForm<Candidate>({
    defaultValues: {},
    resolver: zodResolver(datosSchema),
  });
  const {
    register: registerDocs,
    handleSubmit: submitDocs,
    reset: resetDocs,
    formState: docsState,
  } = useForm<CandidateDocuments>({
    defaultValues: {},
    resolver: zodResolver(docsSchema),
  });
  const {
    register: registerProceso,
    handleSubmit: submitProceso,
    reset: resetProceso,
    formState: procesoState,
  } = useForm<CandidateProcess>({
    defaultValues: {},
    resolver: zodResolver(procesoSchema),
  });
  const {
    register: registerContrato,
    handleSubmit: submitContrato,
    reset: resetContrato,
    formState: contratoState,
  } = useForm<CandidateAssignment>({
    defaultValues: {},
    resolver: zodResolver(contratoSchema),
  });

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

  const filteredList = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return list;
    return list.filter((c) =>
      [c.nombres_completos, c.numero_documento, c.modalidad, c.condicion]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term)),
    );
  }, [list, search]);

  useEffect(() => {
    // Debug modal visibility
    if (showDetail) {
      console.log("[Candidates] showDetail ON, selectedId:", selectedId);
    }
  }, [showDetail, selectedId]);

  const onSubmitDatos = async (data: Candidate) => {
    if (!selectedId || !canEditDatos)
      throw new ApiError("Sin permiso para actualizar datos", 403);
    await updateCandidate.mutateAsync({ id: selectedId, payload: data });
  };

  const onSubmitDocs = async (data: CandidateDocuments) => {
    if (!selectedId || !canEditDocs)
      throw new ApiError("Sin permiso para actualizar documentos", 403);
    await updateDocs.mutateAsync({ id: selectedId, payload: data });
  };

  const onSubmitProceso = async (data: CandidateProcess) => {
    if (!selectedId || !canEditProceso)
      throw new ApiError("Sin permiso para actualizar proceso", 403);
    await updateProceso.mutateAsync({ id: selectedId, payload: data });
  };

  const onSubmitContrato = async (data: CandidateAssignment) => {
    if (!selectedId || !canEditContrato)
      throw new ApiError("Sin permiso para actualizar contrato", 403);
    await updateContrato.mutateAsync({ id: selectedId, payload: data });
  };

  useEffect(() => {
    if (!showDetail) return;
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [showDetail]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 dark:bg-gray-900 dark:text-white">
      <div className="mx-auto max-w-(--breakpoint-2xl) space-y-6">
        <header className="flex flex-col gap-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">Candidatos</p>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Ficha, checklist y proceso
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Selecciona un candidato para ver/editar sus datos.
          </p>
          {linkFilterId && (
            <div className="mt-2 flex flex-wrap items-center gap-3 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
              <span>
                Filtrado por link:{" "}
                <strong>
                  {linkFilterSlug || linkFilterTitle || linkFilterId}
                </strong>
              </span>
              <button
                type="button"
                className="btn-secondary px-3 py-1 text-xs"
                onClick={() => navigate("/candidates")}
              >
                Ver todos
              </button>
            </div>
          )}
        </header>

        {mode === "list" && (
          <Card className="space-y-3">
            <SectionHeader
              title="Listado"
              actions={
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn-secondary px-3 py-2 text-sm"
                    aria-label="Exportar candidatos"
                    onClick={() => {
                      // TODO: export real
                    }}
                  >
                    Exportar
                  </button>
                  <button
                    type="button"
                    className="btn-primary px-4 py-2 text-sm"
                    disabled={!canRead}
                    onClick={() => navigate("/candidates/new")}
                  >
                    + Crear candidato
                  </button>
                </div>
              }
            />
            {!canRead && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No tienes permiso para ver candidatos.
              </p>
            )}
            {!listLoading && canRead && filteredList.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sin candidatos.
              </p>
            )}

            {mode === "list" && canRead && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    Mostrar
                    <select className="input w-20" disabled>
                      <option>10</option>
                    </select>
                    entradas
                  </label>
                  <div className="relative">
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar..."
                      className="input w-56 pl-9"
                      aria-label="Buscar candidatos"
                    />
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                      🔍
                    </span>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
                  <table className="min-w-full text-left text-sm text-gray-700 dark:text-gray-200">
                    <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase dark:bg-gray-800 dark:text-gray-300">
                      <tr>
                        <th className="px-4 py-3">Documento</th>
                        <th className="px-4 py-3">Nombre</th>
                        <th className="px-4 py-3">Modalidad</th>
                        <th className="px-4 py-3">Condición</th>
                        <th className="px-4 py-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                      {filteredList.map((c) => (
                        <tr
                          key={c.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/80"
                        >
                          <td className="px-4 py-3 text-xs text-gray-500 uppercase dark:text-gray-400">
                            {c.numero_documento}
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                            {c.nombres_completos}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                            {c.modalidad || "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                            {c.condicion || "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              className="btn-secondary px-3 py-1 text-sm"
                              onClick={() => {
                                console.log(
                                  "[Candidates] click Ver/Editar",
                                  c.id,
                                );
                                setSelectedId(c.id);
                                setTab("datos");
                                setShowDetail(true);
                              }}
                            >
                              Ver / Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </Card>
        )}

        {detailLoading && selectedId && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cargando detalle…
          </p>
        )}

        {showDetail &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 px-4 py-8 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              onClick={() => {
                setShowDetail(false);
                setSelectedId(null);
              }}
            >
              <div
                className="max-h-[85vh] w-full max-w-[1000px] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <Card className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl lg:p-10 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4 dark:border-slate-800">
                    <div className="space-y-1">
                      <p className="text-xs tracking-wide text-gray-400 uppercase dark:text-slate-500">
                        Detalle de candidato
                      </p>
                      <h3 className="text-2xl font-semibold text-gray-900 dark:text-slate-50">
                        {detail ? detail.nombres_completos : "Candidato"}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        {detail
                          ? `${detail.tipo_documento} ${detail.numero_documento}`
                          : "Selecciona un candidato"}
                      </p>
                      {detail && (
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600 dark:text-slate-300">
                          <span className="pill">
                            {detail.modalidad || "sin modalidad"}
                          </span>
                          {detail.condicion && (
                            <span className="pill">{detail.condicion}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn-secondary h-9 w-9 rounded-full text-base"
                      onClick={() => {
                        setShowDetail(false);
                        setSelectedId(null);
                      }}
                      aria-label="Cerrar detalle"
                    >
                      ✕
                    </button>
                  </div>

                  {detailLoading && (
                    <div className="flex h-40 items-center justify-center text-sm text-gray-500 dark:text-slate-300">
                      Cargando detalle…
                    </div>
                  )}

                  {!detailLoading && !detail && (
                    <div className="text-sm text-gray-600 dark:text-slate-300">
                      No se pudo cargar el detalle del candidato.
                    </div>
                  )}

                  {detail && !detailLoading && (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {(
                          [
                            "datos",
                            "documentos",
                            "proceso",
                            "contrato",
                          ] as Tab[]
                        ).map((t) => (
                          <button
                            key={t}
                            type="button"
                            className={`pill ${tab === t ? "bg-brand-500 text-white dark:bg-brand-400 dark:text-slate-950" : "dark:bg-slate-800 dark:text-slate-200"}`}
                            onClick={() => setTab(t)}
                          >
                            {t === "datos" && "Datos"}
                            {t === "documentos" && "Documentos"}
                            {t === "proceso" && "Proceso"}
                            {t === "contrato" && "Contrato"}
                          </button>
                        ))}
                      </div>

                      {tab === "datos" && (
                        <form
                          className="grid gap-4 md:grid-cols-2"
                          onSubmit={submitDatos(onSubmitDatos)}
                        >
                          <Field label="Tipo de documento">
                            <Select
                              {...registerDatos("tipo_documento")}
                              defaultValue={detail.tipo_documento}
                              disabled={!canEditDatos}
                            >
                              <option value="DNI">DNI</option>
                              <option value="CE">CE</option>
                            </Select>
                          </Field>
                          <Field label="Número documento">
                            <Input
                              {...registerDatos("numero_documento", {
                                onChange: (e) =>
                                  setDatos(
                                    "numero_documento",
                                    e.target.value.toUpperCase(),
                                    { shouldValidate: false },
                                  ),
                              })}
                              disabled={!canEditDatos}
                              defaultValue={detail.numero_documento}
                            />
                            <ErrorText message={datosState.errors.numero_documento?.message} />
                          </Field>
                          <Field label="Apellidos y nombres">
                            <Input
                              {...registerDatos("nombres_completos")}
                              defaultValue={detail.nombres_completos}
                              disabled={!canEditDatos}
                            />
                            <ErrorText message={datosState.errors.nombres_completos?.message} />
                          </Field>
                          <Field label="Correo">
                            <Input
                              {...registerDatos("email")}
                              defaultValue={detail.email}
                              disabled={!canEditDatos}
                            />
                            <ErrorText message={datosState.errors.email?.message} />
                          </Field>
                          <Field label="Teléfono">
                            <Input
                              {...registerDatos("telefono")}
                              defaultValue={detail.telefono}
                              disabled={!canEditDatos}
                            />
                            <ErrorText message={datosState.errors.telefono?.message} />
                          </Field>
                          <Field label="Teléfono referencia">
                            <Input
                              {...registerDatos("telefono_referencia")}
                              defaultValue={detail.telefono_referencia ?? ""}
                              disabled={!canEditDatos}
                            />
                          </Field>
                          <Field label="Estado civil">
                            <Input
                              {...registerDatos("estado_civil")}
                              defaultValue={detail.estado_civil ?? ""}
                              disabled={!canEditDatos}
                            />
                          </Field>
                          <Field label="Nivel académico">
                            <Input
                              {...registerDatos("nivel_academico")}
                              defaultValue={detail.nivel_academico ?? ""}
                              disabled={!canEditDatos}
                            />
                          </Field>
                          <Field label="Modalidad (copia)">
                            <Input
                              {...registerDatos("modalidad")}
                              defaultValue={detail.modalidad ?? ""}
                              disabled={!canEditDatos}
                            />
                          </Field>
                          <Field label="Condición (copia)">
                            <Input
                              {...registerDatos("condicion")}
                              defaultValue={detail.condicion ?? ""}
                              disabled={!canEditDatos}
                            />
                          </Field>
                          <Field label="Hora de gestión">
                            <Input
                              {...registerDatos("hora_gestion")}
                              defaultValue={detail.hora_gestion ?? ""}
                              disabled={!canEditDatos}
                            />
                          </Field>
                          <Field label="Descanso">
                            <Input
                              {...registerDatos("descanso")}
                              defaultValue={detail.descanso ?? ""}
                              disabled={!canEditDatos}
                            />
                          </Field>
                          <div className="md:col-span-2">
                            <Field label="Observación">
                              <Textarea
                                {...registerDatos("observacion")}
                                defaultValue={detail.observacion ?? ""}
                                disabled={!canEditDatos}
                              />
                            </Field>
                          </div>
                          {datosState.errors.root && (
                            <p className="text-sm text-red-600 md:col-span-2">
                              {datosState.errors.root.message}
                            </p>
                          )}
                          <div className="flex gap-3 md:col-span-2">
                            <button
                              type="submit"
                              className="btn-primary"
                              disabled={
                                datosState.isSubmitting || !canEditDatos
                              }
                            >
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
                            <p className="text-xs text-gray-500 md:col-span-2 dark:text-gray-400">
                              Sin permiso para editar los datos del candidato.
                            </p>
                          )}
                        </form>
                      )}

                      {tab === "documentos" && (
                        <form
                          className="grid gap-4 md:grid-cols-3"
                          onSubmit={submitDocs(onSubmitDocs)}
                        >
                          <Field label="CV entregado">
                            <Select
                              {...registerDocs("cv_entregado")}
                              defaultValue={String(
                                detail.documents?.cv_entregado ?? "",
                              )}
                              disabled={!canEditDocs}
                            >
                              <option value="">—</option>
                              <option value="true">Sí</option>
                              <option value="false">No</option>
                            </Select>
                          </Field>
                          <Field label="DNI entregado">
                            <Select
                              {...registerDocs("dni_entregado")}
                              defaultValue={String(
                                detail.documents?.dni_entregado ?? "",
                              )}
                              disabled={!canEditDocs}
                            >
                              <option value="">—</option>
                              <option value="true">Sí</option>
                              <option value="false">No</option>
                            </Select>
                          </Field>
                          <Field label="Certificado">
                            <Select
                              {...registerDocs("certificado_entregado")}
                              defaultValue={String(
                                detail.documents?.certificado_entregado ?? "",
                              )}
                              disabled={!canEditDocs}
                            >
                              <option value="">—</option>
                              <option value="true">Sí</option>
                              <option value="false">No</option>
                            </Select>
                          </Field>
                          <Field label="Recibo servicio">
                            <Select
                              {...registerDocs("recibo_servicio_entregado")}
                              defaultValue={String(
                                detail.documents?.recibo_servicio_entregado ??
                                  "",
                              )}
                              disabled={!canEditDocs}
                            >
                              <option value="">—</option>
                              <option value="true">Sí</option>
                              <option value="false">No</option>
                            </Select>
                          </Field>
                          <Field label="Ficha de datos">
                            <Select
                              {...registerDocs("ficha_datos_entregado")}
                              defaultValue={String(
                                detail.documents?.ficha_datos_entregado ?? "",
                              )}
                              disabled={!canEditDocs}
                            >
                              <option value="">—</option>
                              <option value="true">Sí</option>
                              <option value="false">No</option>
                            </Select>
                          </Field>
                          <Field label="Autorización de datos">
                            <Select
                              {...registerDocs("autorizacion_datos_entregado")}
                              defaultValue={String(
                                detail.documents
                                  ?.autorizacion_datos_entregado ?? "",
                              )}
                              disabled={!canEditDocs}
                            >
                              <option value="">—</option>
                              <option value="true">Sí</option>
                              <option value="false">No</option>
                            </Select>
                          </Field>
                          <Field label="Estado checklist">
                            <Input
                              {...registerDocs("status")}
                              defaultValue={detail.documents?.status ?? ""}
                              disabled={!canEditDocs}
                            />
                          </Field>
                          <div className="md:col-span-3">
                            <Field label="Observación">
                              <Textarea
                                {...registerDocs("observacion")}
                                defaultValue={
                                  detail.documents?.observacion ?? ""
                                }
                                disabled={!canEditDocs}
                              />
                            </Field>
                            <ErrorText message={docsState.errors.observacion?.message} />
                          </div>
                          {docsState.errors.root && (
                            <p className="text-sm text-red-600 md:col-span-3">
                              {docsState.errors.root.message}
                            </p>
                          )}
                          <div className="flex gap-3 md:col-span-3">
                            <button
                              type="submit"
                              className="btn-primary"
                              disabled={docsState.isSubmitting || !canEditDocs}
                            >
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
                            <p className="text-xs text-gray-500 md:col-span-3 dark:text-gray-400">
                              Sin permiso para actualizar documentos.
                            </p>
                          )}
                        </form>
                      )}

                      {tab === "proceso" && (
                        <form
                          className="grid gap-4 md:grid-cols-2"
                          onSubmit={submitProceso(onSubmitProceso)}
                        >
                          <Field label="Envío DNI">
                            <Input
                              type="datetime-local"
                              {...registerProceso("envio_dni_at")}
                              defaultValue={detail.process?.envio_dni_at ?? ""}
                              disabled={!canEditProceso}
                            />
                          </Field>
                          <Field label="Test psicológico">
                            <Input
                              type="datetime-local"
                              {...registerProceso("test_psicologico_at")}
                              defaultValue={
                                detail.process?.test_psicologico_at ?? ""
                              }
                              disabled={!canEditProceso}
                            />
                            <ErrorText message={procesoState.errors.test_psicologico_at?.message as string | undefined} />
                          </Field>
                          <Field label="Validación PC">
                            <Input
                              type="datetime-local"
                              {...registerProceso("validacion_pc_at")}
                              defaultValue={
                                detail.process?.validacion_pc_at ?? ""
                              }
                              disabled={!canEditProceso}
                            />
                            <ErrorText message={procesoState.errors.validacion_pc_at?.message as string | undefined} />
                          </Field>
                          <Field label="Evaluación día 0">
                            <Input
                              type="datetime-local"
                              {...registerProceso("evaluacion_dia0_at")}
                              defaultValue={
                                detail.process?.evaluacion_dia0_at ?? ""
                              }
                              disabled={!canEditProceso}
                            />
                            <ErrorText message={procesoState.errors.evaluacion_dia0_at?.message as string | undefined} />
                          </Field>
                          <Field label="Inicio capacitación">
                            <Input
                              type="datetime-local"
                              {...registerProceso("inicio_capacitacion_at")}
                              defaultValue={
                                detail.process?.inicio_capacitacion_at ?? ""
                              }
                              disabled={!canEditProceso}
                            />
                            <ErrorText message={procesoState.errors.inicio_capacitacion_at?.message as string | undefined} />
                          </Field>
                          <Field label="Fin capacitación">
                            <Input
                              type="datetime-local"
                              {...registerProceso("fin_capacitacion_at")}
                              defaultValue={
                                detail.process?.fin_capacitacion_at ?? ""
                              }
                              disabled={!canEditProceso}
                            />
                            <ErrorText message={procesoState.errors.fin_capacitacion_at?.message as string | undefined} />
                          </Field>
                          <Field label="Conexión OJT">
                            <Input
                              type="datetime-local"
                              {...registerProceso("conexion_ojt_at")}
                              defaultValue={
                                detail.process?.conexion_ojt_at ?? ""
                              }
                              disabled={!canEditProceso}
                            />
                            <ErrorText message={procesoState.errors.conexion_ojt_at?.message as string | undefined} />
                          </Field>
                          <Field label="Conexión OP">
                            <Input
                              type="datetime-local"
                              {...registerProceso("conexion_op_at")}
                              defaultValue={
                                detail.process?.conexion_op_at ?? ""
                              }
                              disabled={!canEditProceso}
                            />
                            <ErrorText message={procesoState.errors.conexion_op_at?.message as string | undefined} />
                          </Field>
                          <Field label="Pago capacitación">
                            <Input
                              type="datetime-local"
                              {...registerProceso("pago_capacitacion_at")}
                              defaultValue={
                                detail.process?.pago_capacitacion_at ?? ""
                              }
                              disabled={!canEditProceso}
                            />
                            <ErrorText message={procesoState.errors.pago_capacitacion_at?.message as string | undefined} />
                          </Field>
                          <Field label="Estado día 0">
                            <Input
                              {...registerProceso("estado_dia0")}
                              defaultValue={detail.process?.estado_dia0 ?? ""}
                              disabled={!canEditProceso}
                            />
                          </Field>
                          <Field label="Obs día 0">
                            <Textarea
                              {...registerProceso("observaciones_dia0")}
                              defaultValue={
                                detail.process?.observaciones_dia0 ?? ""
                              }
                              disabled={!canEditProceso}
                            />
                            <ErrorText
                              message={
                                procesoState.errors.observaciones_dia0?.message as string | undefined
                              }
                            />
                          </Field>
                          <Field label="Estado día 1">
                            <Input
                              {...registerProceso("estado_dia1")}
                              defaultValue={detail.process?.estado_dia1 ?? ""}
                              disabled={!canEditProceso}
                            />
                          </Field>
                         <Field label="Obs día 1">
                           <Textarea
                             {...registerProceso("observaciones_dia1")}
                             defaultValue={
                               detail.process?.observaciones_dia1 ?? ""
                             }
                             disabled={!canEditProceso}
                           />
                            <ErrorText message={procesoState.errors.observaciones_dia1?.message as string | undefined} />
                         </Field>
                         <Field label="Windows status">
                           <Input
                             {...registerProceso("windows_status")}
                             defaultValue={
                               detail.process?.windows_status ?? ""
                             }
                             disabled={!canEditProceso}
                            />
                          </Field>
                          <Field label="Estado final">
                            <Input
                              {...registerProceso("status_final")}
                              defaultValue={detail.process?.status_final ?? ""}
                              disabled={!canEditProceso}
                            />
                          </Field>
                          <div className="md:col-span-2">
                            <Field label="Observación final">
                              <Textarea
                                {...registerProceso("status_observacion")}
                                defaultValue={
                                  detail.process?.status_observacion ?? ""
                                }
                                disabled={!canEditProceso}
                              />
                            </Field>
                            <ErrorText message={procesoState.errors.status_observacion?.message} />
                          </div>
                          {procesoState.errors.root && (
                            <p className="text-sm text-red-600 md:col-span-2">
                              {procesoState.errors.root.message}
                            </p>
                          )}
                          <div className="flex gap-3 md:col-span-2">
                            <button
                              type="submit"
                              className="btn-primary"
                              disabled={
                                procesoState.isSubmitting || !canEditProceso
                              }
                            >
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
                            <p className="text-xs text-gray-500 md:col-span-2 dark:text-gray-400">
                              Sin permiso para actualizar el proceso.
                            </p>
                          )}
                        </form>
                      )}

                      {tab === "contrato" && (
                        <form
                          className="grid gap-4 md:grid-cols-2"
                          onSubmit={submitContrato(onSubmitContrato)}
                        >
                          <Field label="Tipo de contratación">
                            <Input
                              {...registerContrato("tipo_contratacion")}
                              defaultValue={
                                detail.assignment?.tipo_contratacion ?? ""
                              }
                              disabled={!canEditContrato}
                            />
                          </Field>
                          <Field label="Razón social">
                            <Input
                              {...registerContrato("razon_social")}
                              defaultValue={
                                detail.assignment?.razon_social ?? ""
                              }
                              disabled={!canEditContrato}
                            />
                          </Field>
                          <Field label="Remuneración">
                            <Input
                              type="number"
                              step="0.01"
                              {...registerContrato("remuneracion", {
                                valueAsNumber: true,
                              })}
                              disabled={!canEditContrato}
                              defaultValue={
                                detail.assignment?.remuneracion ?? ""
                              }
                            />
                          </Field>
                          <Field label="Bono variable">
                            <Input
                              type="number"
                              step="0.01"
                              {...registerContrato("bono_variable", {
                                valueAsNumber: true,
                              })}
                              disabled={!canEditContrato}
                              defaultValue={
                                detail.assignment?.bono_variable ?? ""
                              }
                            />
                          </Field>
                          <Field label="Bono movilidad">
                            <Input
                              type="number"
                              step="0.01"
                              {...registerContrato("bono_movilidad", {
                                valueAsNumber: true,
                              })}
                              disabled={!canEditContrato}
                              defaultValue={
                                detail.assignment?.bono_movilidad ?? ""
                              }
                            />
                          </Field>
                          <Field label="Bono bienvenida">
                            <Input
                              type="number"
                              step="0.01"
                              {...registerContrato("bono_bienvenida", {
                                valueAsNumber: true,
                              })}
                              disabled={!canEditContrato}
                              defaultValue={
                                detail.assignment?.bono_bienvenida ?? ""
                              }
                            />
                          </Field>
                          <Field label="Bono permanencia">
                            <Input
                              type="number"
                              step="0.01"
                              {...registerContrato("bono_permanencia", {
                                valueAsNumber: true,
                              })}
                              disabled={!canEditContrato}
                              defaultValue={
                                detail.assignment?.bono_permanencia ?? ""
                              }
                            />
                          </Field>
                          <Field label="Bono asistencia">
                            <Input
                              type="number"
                              step="0.01"
                              {...registerContrato("bono_asistencia", {
                                valueAsNumber: true,
                              })}
                              disabled={!canEditContrato}
                              defaultValue={
                                detail.assignment?.bono_asistencia ?? ""
                              }
                            />
                          </Field>
                          <Field label="Cargo contractual">
                            <Input
                              {...registerContrato("cargo_contractual")}
                              defaultValue={
                                detail.assignment?.cargo_contractual ?? ""
                              }
                              disabled={!canEditContrato}
                            />
                          </Field>
                          <Field label="Régimen de pago">
                            <Input
                              {...registerContrato("regimen_pago")}
                              defaultValue={
                                detail.assignment?.regimen_pago ?? ""
                              }
                              disabled={!canEditContrato}
                            />
                          </Field>
                          <Field label="Fecha inicio">
                            <Input
                              type="date"
                              {...registerContrato("fecha_inicio")}
                              defaultValue={
                                detail.assignment?.fecha_inicio ?? ""
                              }
                              disabled={!canEditContrato}
                            />
                          </Field>
                          <Field label="Fecha fin">
                            <Input
                              type="date"
                              {...registerContrato("fecha_fin")}
                              defaultValue={detail.assignment?.fecha_fin ?? ""}
                              disabled={!canEditContrato}
                            />
                          </Field>
                          <Field label="Estado">
                            <Input
                              {...registerContrato("estado")}
                              defaultValue={detail.assignment?.estado ?? ""}
                              disabled={!canEditContrato}
                            />
                          </Field>
                          <div className="md:col-span-2">
                            <ErrorText message={contratoState.errors.estado?.message as string | undefined} />
                          </div>
                          {contratoState.errors.root && (
                            <p className="text-sm text-red-600 md:col-span-2">
                              {contratoState.errors.root.message}
                            </p>
                          )}
                          <div className="flex gap-3 md:col-span-2">
                            <button
                              type="submit"
                              className="btn-primary"
                              disabled={
                                contratoState.isSubmitting || !canEditContrato
                              }
                            >
                              Guardar contrato
                            </button>
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() =>
                                resetContrato(detail.assignment ?? {})
                              }
                              disabled={!canEditContrato}
                            >
                              Deshacer
                            </button>
                          </div>
                          {!canEditContrato && (
                            <p className="text-xs text-gray-500 md:col-span-2 dark:text-gray-400">
                              Sin permiso para actualizar contrato.
                            </p>
                          )}
                        </form>
                      )}
                    </>
                  )}
                </Card>
              </div>
            </div>,
            document.body,
          )}

        {mode === "create" && (
          <Card className="space-y-4">
            <SectionHeader
              title="Crear candidato"
              subtitle="Pendiente de implementación"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              El alta de candidatos aún no está disponible en esta vista. Vuelve
              al listado para gestionar los existentes.
            </p>
          </Card>
        )}
      </div>
    </main>
  );
}
