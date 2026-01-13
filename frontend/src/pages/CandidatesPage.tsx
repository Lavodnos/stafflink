import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Card, SectionHeader } from "../components/ui";
import { PageHeader } from "../components/common/PageHeader";
import { PageShell } from "../components/common/PageShell";
import { ApiError } from "../lib/apiError";
import { applyApiFieldErrors } from "../lib/applyApiFieldErrors";
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
import {
  CandidateDetailModal,
  type CandidateDetailTab,
} from "./candidates/CandidateDetailModal";
import { CandidateList } from "./candidates/CandidateList";

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
  const [tab, setTab] = useState<CandidateDetailTab>("datos");

  const { data: detail, isLoading: detailLoading } = useCandidate(
    canRead ? (selectedId ?? undefined) : undefined,
  );

  const datosForm = useForm<Candidate>({
    defaultValues: {},
    resolver: zodResolver(datosSchema),
  });
  const docsForm = useForm<CandidateDocuments>({
    defaultValues: {},
    resolver: zodResolver(docsSchema),
  });
  const procesoForm = useForm<CandidateProcess>({
    defaultValues: {},
    resolver: zodResolver(procesoSchema),
  });
  const contratoForm = useForm<CandidateAssignment>({
    defaultValues: {},
    resolver: zodResolver(contratoSchema),
  });
  const { reset: resetDatos, setError: setErrorDatos } = datosForm;
  const { reset: resetDocs, setError: setErrorDocs } = docsForm;
  const { reset: resetProceso, setError: setErrorProceso } = procesoForm;
  const { reset: resetContrato, setError: setErrorContrato } = contratoForm;

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

  useEffect(() => {
    applyApiFieldErrors(updateCandidate.error, setErrorDatos);
  }, [updateCandidate.error, setErrorDatos]);

  useEffect(() => {
    applyApiFieldErrors(updateDocs.error, setErrorDocs);
  }, [updateDocs.error, setErrorDocs]);

  useEffect(() => {
    applyApiFieldErrors(updateProceso.error, setErrorProceso);
  }, [updateProceso.error, setErrorProceso]);

  useEffect(() => {
    applyApiFieldErrors(updateContrato.error, setErrorContrato);
  }, [updateContrato.error, setErrorContrato]);

  const onSubmitDatos = async (data: Candidate) => {
    if (!selectedId || !canEditDatos) {
      throw new ApiError("Sin permiso para actualizar datos", 403);
    }
    await updateCandidate.mutateAsync({ id: selectedId, payload: data });
  };

  const onSubmitDocs = async (data: CandidateDocuments) => {
    if (!selectedId || !canEditDocs) {
      throw new ApiError("Sin permiso para actualizar documentos", 403);
    }
    await updateDocs.mutateAsync({ id: selectedId, payload: data });
  };

  const onSubmitProceso = async (data: CandidateProcess) => {
    if (!selectedId || !canEditProceso) {
      throw new ApiError("Sin permiso para actualizar proceso", 403);
    }
    await updateProceso.mutateAsync({ id: selectedId, payload: data });
  };

  const onSubmitContrato = async (data: CandidateAssignment) => {
    if (!selectedId || !canEditContrato) {
      throw new ApiError("Sin permiso para actualizar contrato", 403);
    }
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

  const handleSelectCandidate = (id: string) => {
    setSelectedId(id);
    setTab("datos");
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedId(null);
  };

  return (
    <PageShell>
      <div className="space-y-2">
        <PageHeader
          eyebrow="Candidatos"
          title="Ficha, checklist y proceso"
          description="Selecciona un candidato para ver/editar sus datos."
        />
        {linkFilterId && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
            <span>
              Filtrado por link:{" "}
              <strong>{linkFilterSlug || linkFilterTitle || linkFilterId}</strong>
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
      </div>

      {mode === "list" && (
        <CandidateList
          candidates={list}
          isLoading={listLoading}
          canRead={canRead}
          onSelect={handleSelectCandidate}
          onCreate={() => navigate("/candidates/new")}
        />
      )}

      {showDetail && (
        <CandidateDetailModal
          detail={detail}
          isLoading={detailLoading}
          tab={tab}
          onTabChange={setTab}
          onClose={handleCloseDetail}
          forms={{
            datos: datosForm,
            docs: docsForm,
            proceso: procesoForm,
            contrato: contratoForm,
          }}
          canEdit={{
            datos: canEditDatos,
            docs: canEditDocs,
            proceso: canEditProceso,
            contrato: canEditContrato,
          }}
          onSubmit={{
            datos: onSubmitDatos,
            docs: onSubmitDocs,
            proceso: onSubmitProceso,
            contrato: onSubmitContrato,
          }}
        />
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
    </PageShell>
  );
}
