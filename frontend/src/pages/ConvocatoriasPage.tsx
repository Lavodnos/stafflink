import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "../components/common/PageHeader";
import { PageShell } from "../components/common/PageShell";
import { ApiError } from "@/lib/apiError";
import { applyApiFieldErrors } from "@/lib/applyApiFieldErrors";
import { usePermission } from "../modules/auth/usePermission";
import { useCampaigns } from "@/features/campaigns";
import type { ConvocatoriaPayload } from "@/features/convocatorias";
import {
  useConvocatoriaStatus,
  useConvocatorias,
  useCreateConvocatoria,
  useDeleteConvocatoria,
  useUpdateConvocatoria,
} from "@/features/convocatorias";
import { ConvocatoriaFormCard } from "./convocatorias/ConvocatoriaFormCard";
import { ConvocatoriaListCard } from "./convocatorias/ConvocatoriaListCard";
import type { ConvocatoriaForm } from "./convocatorias/types";

type Mode = "list" | "create";

const getIsoWeekNumber = (date = new Date()) => {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target.getTime() - firstThursday.getTime();
  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
};

const DEFAULT_SEMANA_TRABAJO = getIsoWeekNumber();

const defaultValues: ConvocatoriaForm = {
  campaign: "",
  grupo: "G000",
  titulo: "",
  slug: "",
  encargados: [],
  periodo: "",
  semana_trabajo: DEFAULT_SEMANA_TRABAJO,
  cuotas: undefined,
  modalidad: "presencial",
  condicion: "full_time",
  hora_gestion: "",
  descanso: "",
  tipo_contratacion: "",
  razon_social: "",
  remuneracion: undefined,
  bono_variable: undefined,
  bono_movilidad: undefined,
  bono_bienvenida: undefined,
  bono_permanencia: undefined,
  bono_asistencia: undefined,
  cargo_contractual: "",
  pago_capacitacion: undefined,
  expires_at: "",
  notes: "",
};

const convocatoriaSchema = z.object({
  id: z.string().optional(),
  campaign: z.string().trim().min(1, "Campaña requerida"),
  titulo: z.string().trim().min(1, "Título requerido"),
  slug: z.string().trim().min(1, "Slug requerido"),
  encargados: z
    .array(
      z.object({
        id: z.string(),
        email: z.string().optional().nullable(),
        username: z.string().optional().nullable(),
        dni: z.string().optional().nullable(),
      }),
    )
    .optional(),
  modalidad: z.string().optional(),
  condicion: z.string().optional(),
  grupo: z.string().optional(),
  periodo: z.string().optional(),
  hora_gestion: z.string().optional(),
  descanso: z.string().optional(),
  tipo_contratacion: z.string().optional(),
  razon_social: z.string().optional(),
  cargo_contractual: z.string().optional(),
  pago_capacitacion: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().optional(),
  ),
  notes: z.string().optional(),
  expires_at: z.string().optional(),
  semana_trabajo: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().optional(),
  ),
  cuotas: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().optional(),
  ),
  remuneracion: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().optional(),
  ),
  bono_variable: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().optional(),
  ),
  bono_movilidad: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().optional(),
  ),
  bono_bienvenida: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().optional(),
  ),
  bono_permanencia: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().optional(),
  ),
  bono_asistencia: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().optional(),
  ),
});

const normalizeNumberValue = (
  value: number | null | undefined,
): number | undefined => (Number.isFinite(value) ? (value as number) : undefined);

const toLocalDateTimeInput = (isoString: string | null | undefined) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const randomToken = (length = 6) => {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const data = new Uint8Array(length);
    crypto.getRandomValues(data);
    return Array.from(data, (byte) => alphabet[byte % alphabet.length]).join("");
  }
  return Math.random().toString(36).slice(2, 2 + length);
};

const buildSlug = (seed: string) => {
  const normalized = slugify(seed) || "convocatoria";
  const trimmed = normalized.slice(0, 40).replace(/-+$/g, "");
  return `${trimmed}-${randomToken(6)}`;
};

export function ConvocatoriasPage({ mode = "list" }: { mode?: Mode }) {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const canReadConvocatorias = usePermission("convocatorias.read");
  const canManageConvocatorias = usePermission("convocatorias.manage");
  const canReadCampaigns = usePermission("campaigns.read");
  const canReadCandidates = usePermission("candidates.read");

  const { data: convocatorias = [], isLoading, error } = useConvocatorias(
    canReadConvocatorias,
  );
  const { data: campaigns = [] } = useCampaigns(canReadCampaigns);
  const createMutation = useCreateConvocatoria();
  const updateMutation = useUpdateConvocatoria();
  const deleteMutation = useDeleteConvocatoria();

  const form = useForm<ConvocatoriaForm>({
    resolver: zodResolver(convocatoriaSchema),
    defaultValues,
  });
  const {
    reset,
    setValue,
    watch,
    setError,
    formState: { isSubmitting },
  } = form;

  const values = watch();
  const slugBaseRef = useRef<string>("");
  const isEditing = Boolean(values.id);
  const isRouteEditing = Boolean(routeId);
  const saving =
    isSubmitting ||
    createMutation.isPending ||
    updateMutation.isPending;

  const slugSeed = useMemo(() => {
    const campaignName =
      campaigns.find((campaign) => campaign.id === values.campaign)?.nombre ?? "";
    const semana =
      values.semana_trabajo && Number.isFinite(values.semana_trabajo)
        ? `sem${values.semana_trabajo}`
        : "";
    return [
      campaignName,
      values.titulo,
      values.grupo,
      values.periodo,
      values.modalidad,
      values.condicion,
      values.hora_gestion,
      values.descanso,
      semana,
    ]
      .filter(Boolean)
      .join(" ");
  }, [
    campaigns,
    values.campaign,
    values.titulo,
    values.grupo,
    values.periodo,
    values.modalidad,
    values.condicion,
    values.semana_trabajo,
    values.hora_gestion,
    values.descanso,
  ]);

  const handleGenerateSlug = useCallback(() => {
    const seed = slugSeed || values.titulo || "convocatoria";
    slugBaseRef.current = slugSeed;
    setValue("slug", buildSlug(seed), { shouldDirty: true });
  }, [slugSeed, values.titulo, setValue]);

  useEffect(() => {
    if (isEditing || isRouteEditing) return;
    if (!slugSeed) return;
    if (slugBaseRef.current === slugSeed && values.slug) return;
    slugBaseRef.current = slugSeed;
    setValue("slug", buildSlug(slugSeed), { shouldDirty: true });
  }, [isEditing, isRouteEditing, slugSeed, setValue, values.slug]);

  const onSubmit: SubmitHandler<ConvocatoriaForm> = async (data) => {
    if (!canManageConvocatorias) {
      throw new ApiError("No tienes permiso para gestionar convocatorias", 403);
    }
    const expiresAtIso = data.expires_at
      ? new Date(data.expires_at).toISOString()
      : "";
    const payload: ConvocatoriaPayload = {
      ...data,
      grupo: data.grupo?.trim() || undefined,
      encargados: data.encargados ?? [],
      periodo: data.periodo?.trim() || undefined,
      hora_gestion: data.hora_gestion?.trim() || undefined,
      descanso: data.descanso?.trim() || undefined,
      tipo_contratacion: data.tipo_contratacion?.trim() || undefined,
      razon_social: data.razon_social?.trim() || undefined,
      cargo_contractual: data.cargo_contractual?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
      cuotas: Number.isFinite(data.cuotas) ? data.cuotas : undefined,
      semana_trabajo: Number.isFinite(data.semana_trabajo)
        ? data.semana_trabajo
        : undefined,
      remuneracion: Number.isFinite(data.remuneracion)
        ? data.remuneracion
        : undefined,
      bono_variable: Number.isFinite(data.bono_variable)
        ? data.bono_variable
        : undefined,
      bono_movilidad: Number.isFinite(data.bono_movilidad)
        ? data.bono_movilidad
        : undefined,
      bono_bienvenida: Number.isFinite(data.bono_bienvenida)
        ? data.bono_bienvenida
        : undefined,
      bono_permanencia: Number.isFinite(data.bono_permanencia)
        ? data.bono_permanencia
        : undefined,
      bono_asistencia: Number.isFinite(data.bono_asistencia)
        ? data.bono_asistencia
        : undefined,
      slug: data.slug.trim(),
      titulo: data.titulo.trim(),
      expires_at: expiresAtIso,
      pago_capacitacion: Number.isFinite(data.pago_capacitacion)
        ? data.pago_capacitacion
        : undefined,
    };
    if (data.id) {
      await updateMutation.mutateAsync({ id: data.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    reset();
  };

  const setFromConvocatoria = useCallback(
    (convocatoria: ConvocatoriaPayload & { id: string; expires_at?: string | null }) => {
      setValue("id", convocatoria.id);
      setValue("campaign", convocatoria.campaign ?? "");
      setValue("grupo", convocatoria.grupo ?? "");
      setValue("titulo", convocatoria.titulo ?? "");
      setValue("slug", convocatoria.slug ?? "");
      setValue("encargados", convocatoria.encargados ?? []);
      setValue("periodo", convocatoria.periodo ?? "");
      setValue("semana_trabajo", normalizeNumberValue(convocatoria.semana_trabajo));
      setValue("cuotas", normalizeNumberValue(convocatoria.cuotas));
      setValue("modalidad", convocatoria.modalidad ?? "presencial");
      setValue("condicion", convocatoria.condicion ?? "full_time");
      setValue("hora_gestion", convocatoria.hora_gestion ?? "");
      setValue("descanso", convocatoria.descanso ?? "");
      setValue("tipo_contratacion", convocatoria.tipo_contratacion ?? "");
      setValue("razon_social", convocatoria.razon_social ?? "");
      setValue("remuneracion", normalizeNumberValue(convocatoria.remuneracion));
      setValue("bono_variable", normalizeNumberValue(convocatoria.bono_variable));
      setValue("bono_movilidad", normalizeNumberValue(convocatoria.bono_movilidad));
      setValue("bono_bienvenida", normalizeNumberValue(convocatoria.bono_bienvenida));
      setValue("bono_permanencia", normalizeNumberValue(convocatoria.bono_permanencia));
      setValue("bono_asistencia", normalizeNumberValue(convocatoria.bono_asistencia));
      setValue("cargo_contractual", convocatoria.cargo_contractual ?? "");
      setValue(
        "pago_capacitacion",
        normalizeNumberValue(convocatoria.pago_capacitacion),
      );
      setValue("expires_at", toLocalDateTimeInput(convocatoria.expires_at));
      setValue("notes", convocatoria.notes ?? "");
    },
    [setValue],
  );

  useEffect(() => {
    if (!routeId || !convocatorias.length) return;
    const found = convocatorias.find((convocatoria) => convocatoria.id === routeId);
    if (found) {
      setFromConvocatoria(found);
    } else {
      navigate("/convocatorias", { replace: true });
    }
  }, [routeId, convocatorias, setFromConvocatoria, navigate]);

  useEffect(() => {
    applyApiFieldErrors(createMutation.error, setError);
  }, [createMutation.error, setError]);

  useEffect(() => {
    applyApiFieldErrors(updateMutation.error, setError);
  }, [updateMutation.error, setError]);

  const errorMessage =
    error instanceof Error
      ? error.message
      : (createMutation.error instanceof ApiError &&
          createMutation.error.message) ||
        (updateMutation.error instanceof ApiError &&
          updateMutation.error.message) ||
        undefined;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Convocatorias"
        title={
          mode === "create" || isRouteEditing || isEditing
            ? "Crear o editar convocatoria"
            : "Gestiona convocatorias de reclutamiento"
        }
        description={
          mode === "create" || isRouteEditing || isEditing
            ? "Define campaña, slug y expiración para una convocatoria."
            : "Asigna campaña, parámetros por defecto y comparte el slug público."
        }
      />

      {(mode === "create" || isRouteEditing) && (
        <ConvocatoriaFormCard
          form={form}
          campaigns={campaigns}
          canManageConvocatorias={canManageConvocatorias}
          isEditing={isEditing}
          isRouteEditing={isRouteEditing}
          saving={saving}
          errorMessage={errorMessage}
          onSubmit={onSubmit}
          onGenerateSlug={handleGenerateSlug}
          onCancelEdit={() => {
            if (isRouteEditing) navigate("/convocatorias");
          }}
        />
      )}

      {mode === "list" && (
        <ConvocatoriaListCard
          convocatorias={convocatorias}
          campaigns={campaigns}
          canRead={canReadConvocatorias}
          canManage={canManageConvocatorias}
          canReadCandidates={canReadCandidates}
          isLoading={isLoading}
          isDeletePending={deleteMutation.isPending}
          onCreate={() => navigate("/convocatorias/new")}
          onEdit={(id) => navigate(`/convocatorias/${id}/edit`)}
          onViewCandidates={(convocatoria) =>
            navigate(
              `/convocatorias/${convocatoria.id}/postulantes`,
              {
                state: {
                  convocatoriaSlug: convocatoria.slug,
                  convocatoriaTitle: convocatoria.titulo ?? "",
                },
              },
            )
          }
          onDelete={async (id) => {
            if (!canManageConvocatorias) return;
            await deleteMutation.mutateAsync(id);
          }}
        />
      )}
    </PageShell>
  );
}
