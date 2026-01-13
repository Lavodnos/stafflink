import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "../components/common/PageHeader";
import { PageShell } from "../components/common/PageShell";
import { ApiError } from "../lib/apiError";
import { applyApiFieldErrors } from "../lib/applyApiFieldErrors";
import { usePermission } from "../modules/auth/usePermission";
import type { Campaign } from "@/features/campaigns";
import {
  AREA_OPTIONS,
  CAMPAIGN_CODE_ENABLED,
  SEDE_OPTIONS,
  useCampaigns,
  useCreateCampaign,
  useUpdateCampaign,
} from "@/features/campaigns";
import { CampaignFormCard } from "./campaigns/CampaignFormCard";
import { CampaignListCard } from "./campaigns/CampaignListCard";
import type { CampaignFormState } from "./campaigns/types";

type Mode = "list" | "create";

const defaultValues: CampaignFormState = {
  codigo: "",
  area: "",
  nombre: "",
  sede: "",
  estado: "activa",
};

const campaignSchema = z.object({
  id: z.string().optional(),
  codigo: z.string().trim().optional(),
  area: z.string().trim().min(1, "Área requerida"),
  nombre: z.string().trim().min(1, "Nombre requerido"),
  sede: z.string().trim().min(1, "Sede requerida"),
  estado: z.enum(["activa", "inactiva"]),
});

export function CampaignsPage({ mode = "list" }: { mode?: Mode }) {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const canRead = usePermission("campaigns.read");
  const canManage = usePermission("campaigns.manage");

  const { data: items = [], isLoading, error } = useCampaigns(canRead);
  const createMutation = useCreateCampaign();
  const updateMutation = useUpdateCampaign();

  const form = useForm<CampaignFormState>({
    resolver: zodResolver(campaignSchema),
    defaultValues,
  });
  const {
    reset,
    setValue,
    watch,
    setError,
    formState: { isSubmitting },
  } = form;

  const isEditing = Boolean(watch("id"));
  const isRouteEditing = Boolean(routeId);
  const saving =
    isSubmitting || createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (data: CampaignFormState) => {
    if (!canManage) {
      throw new ApiError("No tienes permiso para gestionar campañas", 403);
    }
    const normalizedCodigo = (data.codigo ?? "").trim().toUpperCase();
    const payload = {
      codigo:
        CAMPAIGN_CODE_ENABLED && normalizedCodigo.length > 0
          ? normalizedCodigo
          : "",
      area: data.area?.trim().toUpperCase() ?? "",
      nombre: data.nombre.trim(),
      sede: data.sede?.trim().toUpperCase() ?? "",
      estado: data.estado,
    };
    try {
      if (data.id) {
        await updateMutation.mutateAsync({ id: data.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      reset({
        ...defaultValues,
        id: undefined,
      });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Error al guardar la campaña";
      throw new ApiError(message, 400);
    }
  };

  useEffect(() => {
    applyApiFieldErrors(createMutation.error, setError);
  }, [createMutation.error, setError]);

  useEffect(() => {
    applyApiFieldErrors(updateMutation.error, setError);
  }, [updateMutation.error, setError]);

  const startEdit = useCallback(
    (campaign: Campaign) => {
      setValue("id", campaign.id);
      setValue("codigo", campaign.codigo ?? "");
      setValue("area", campaign.area ?? "");
      setValue("nombre", campaign.nombre);
      setValue("sede", campaign.sede ?? "");
      setValue("estado", campaign.estado);
    },
    [setValue],
  );

  useEffect(() => {
    if (!routeId || !items.length) return;
    const found = items.find((campaign) => campaign.id === routeId);
    if (found) {
      startEdit(found);
    } else {
      navigate("/campaigns", { replace: true });
    }
  }, [routeId, items, navigate, startEdit]);

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
        eyebrow="Campañas"
        title={
          mode === "create" || isRouteEditing || isEditing
            ? "Crear o editar campaña"
            : "Gestiona campañas"
        }
        description={
          mode === "create" || isRouteEditing || isEditing
            ? "Completa los datos para registrar o actualizar una campaña."
            : "Crea o edita campañas activas para asignarlas a links de reclutamiento."
        }
      />

      {canRead && (mode === "create" || isRouteEditing || isEditing) && (
        <CampaignFormCard
          form={form}
          canManage={canManage}
          isEditing={isEditing}
          isRouteEditing={isRouteEditing}
          saving={saving}
          errorMessage={errorMessage}
          campaignCodeEnabled={CAMPAIGN_CODE_ENABLED}
          areaOptions={AREA_OPTIONS}
          sedeOptions={SEDE_OPTIONS}
          onSubmit={onSubmit}
          onCancelEdit={() => {
            if (isRouteEditing) navigate("/campaigns");
          }}
        />
      )}

      {mode === "list" && (
        <CampaignListCard
          campaigns={items}
          canRead={canRead}
          canManage={canManage}
          isLoading={isLoading}
          onCreate={() => navigate("/campaigns/new")}
          onEdit={(campaign) => {
            startEdit(campaign);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </PageShell>
  );
}
