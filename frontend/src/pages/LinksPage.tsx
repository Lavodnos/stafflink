import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "../components/common/PageHeader";
import { PageShell } from "../components/common/PageShell";
import { ApiError } from "@/lib/apiError";
import { applyApiFieldErrors } from "@/lib/applyApiFieldErrors";
import { usePermission } from "../modules/auth/usePermission";
import { useCampaigns } from "@/features/campaigns";
import type { LinkPayload } from "@/features/links";
import {
  useCreateLink,
  useLinkStatus,
  useLinks,
  useUpdateLink,
} from "@/features/links";
import { LinkFormCard } from "./links/LinkFormCard";
import { LinkListCard } from "./links/LinkListCard";
import type { LinkForm } from "./links/types";

type Mode = "list" | "create";

const defaultValues: LinkForm = {
  campaign: "",
  grupo: "",
  titulo: "",
  slug: "",
  periodo: "",
  semana_trabajo: undefined,
  cuotas: undefined,
  modalidad: "presencial",
  condicion: "full_time",
  hora_gestion: "",
  descanso: "",
  expires_at: "",
  notes: "",
};

const linkSchema = z.object({
  id: z.string().optional(),
  campaign: z.string().trim().min(1, "Campaña requerida"),
  titulo: z.string().trim().min(1, "Título requerido"),
  slug: z.string().trim().min(1, "Slug requerido"),
  modalidad: z.string().optional(),
  condicion: z.string().optional(),
  grupo: z.string().optional(),
  periodo: z.string().optional(),
  hora_gestion: z.string().optional(),
  descanso: z.string().optional(),
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

export function LinksPage({ mode = "list" }: { mode?: Mode }) {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const canReadLinks = usePermission("links.read");
  const canManageLinks = usePermission("links.manage");
  const canCloseLinks = usePermission("links.close");
  const canReadCampaigns = usePermission("campaigns.read");
  const canReadCandidates = usePermission("candidates.read");

  const { data: items = [], isLoading, error } = useLinks(canReadLinks);
  const { data: campaigns = [] } = useCampaigns(canReadCampaigns);
  const createMutation = useCreateLink();
  const updateMutation = useUpdateLink();
  const statusMutation = useLinkStatus();

  const form = useForm<LinkForm>({
    resolver: zodResolver(linkSchema),
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
  const isEditing = Boolean(values.id);
  const isRouteEditing = Boolean(routeId);
  const saving =
    isSubmitting ||
    createMutation.isPending ||
    updateMutation.isPending ||
    statusMutation.isPending;

  const onSubmit: SubmitHandler<LinkForm> = async (data) => {
    if (!canManageLinks) {
      throw new ApiError("No tienes permiso para gestionar links", 403);
    }
    const expiresAtIso = data.expires_at
      ? new Date(data.expires_at).toISOString()
      : "";
    const payload: LinkPayload = {
      ...data,
      grupo: data.grupo?.trim() || undefined,
      periodo: data.periodo?.trim() || undefined,
      hora_gestion: data.hora_gestion?.trim() || undefined,
      descanso: data.descanso?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
      cuotas: Number.isFinite(data.cuotas) ? data.cuotas : undefined,
      semana_trabajo: Number.isFinite(data.semana_trabajo)
        ? data.semana_trabajo
        : undefined,
      slug: data.slug.trim(),
      titulo: data.titulo.trim(),
      expires_at: expiresAtIso,
    };
    if (data.id) {
      await updateMutation.mutateAsync({ id: data.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    reset();
  };

  const changeStatus = async (
    linkId: string,
    action: "expire" | "revoke" | "activate",
  ) => {
    if (!canCloseLinks) return;
    await statusMutation.mutateAsync({ id: linkId, action });
  };

  const setFromLink = useCallback(
    (link: LinkPayload & { id: string; expires_at?: string | null }) => {
      setValue("id", link.id);
      setValue("campaign", link.campaign ?? "");
      setValue("grupo", link.grupo ?? "");
      setValue("titulo", link.titulo ?? "");
      setValue("slug", link.slug ?? "");
      setValue("periodo", link.periodo ?? "");
      setValue("semana_trabajo", normalizeNumberValue(link.semana_trabajo));
      setValue("cuotas", normalizeNumberValue(link.cuotas));
      setValue("modalidad", link.modalidad ?? "presencial");
      setValue("condicion", link.condicion ?? "full_time");
      setValue("hora_gestion", link.hora_gestion ?? "");
      setValue("descanso", link.descanso ?? "");
      setValue("expires_at", toLocalDateTimeInput(link.expires_at));
      setValue("notes", link.notes ?? "");
    },
    [setValue],
  );

  useEffect(() => {
    if (!routeId || !items.length) return;
    const found = items.find((link) => link.id === routeId);
    if (found) {
      setFromLink(found);
    } else {
      navigate("/links", { replace: true });
    }
  }, [routeId, items, setFromLink, navigate]);

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
        eyebrow="Links"
        title={
          mode === "create" || isRouteEditing || isEditing
            ? "Crear o editar link"
            : "Genera links de reclutamiento"
        }
        description={
          mode === "create" || isRouteEditing || isEditing
            ? "Define campaña, slug y expiración para un link."
            : "Asigna campaña, parámetros por defecto y comparte el slug público."
        }
      />

      {(mode === "create" || isRouteEditing) && (
        <LinkFormCard
          form={form}
          campaigns={campaigns}
          canManageLinks={canManageLinks}
          isEditing={isEditing}
          isRouteEditing={isRouteEditing}
          saving={saving}
          errorMessage={errorMessage}
          onSubmit={onSubmit}
          onCancelEdit={() => {
            if (isRouteEditing) navigate("/links");
          }}
        />
      )}

      {mode === "list" && (
        <LinkListCard
          links={items}
          canRead={canReadLinks}
          canManage={canManageLinks}
          canClose={canCloseLinks}
          canReadCandidates={canReadCandidates}
          isLoading={isLoading}
          isStatusPending={statusMutation.isPending}
          onCreate={() => navigate("/links/new")}
          onEdit={(id) => navigate(`/links/${id}/edit`)}
          onViewCandidates={(link) =>
            navigate(
              `/links/${link.id}/candidates?link_id=${link.id}&link_slug=${encodeURIComponent(
                link.slug,
              )}&link_title=${encodeURIComponent(link.titulo ?? "")}`,
            )
          }
          onChangeStatus={changeStatus}
        />
      )}
    </PageShell>
  );
}
