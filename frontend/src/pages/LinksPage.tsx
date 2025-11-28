import { useEffect, useMemo, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { Drawer } from "../components/common/Drawer";
import { useToastStore } from "../components/common/Toast";
import { Card, Field, Input, SectionHeader, Select, Textarea } from "../components/ui";
import { ApiError } from "../lib/apiError";
import { usePermission } from "../modules/auth/usePermission";
import { useCampaigns } from "../modules/campaigns/hooks";
import type { Link, LinkPayload } from "../modules/links/api";
import { useCreateLink, useLinkStatus, useLinks, useUpdateLink } from "../modules/links/hooks";

type LinkForm = LinkPayload & { id?: string };

export function LinksPage() {
  const canReadLinks = usePermission("links.read");
  const canManageLinks = usePermission("links.manage");
  const canCloseLinks = usePermission("links.close");
  const canReadCampaigns = usePermission("campaigns.read");
  const addToast = useToastStore((s) => s.add);

  const { data: items = [], isLoading, error } = useLinks(canReadLinks);
  const { data: campaigns = [] } = useCampaigns(canReadCampaigns);
  const createMutation = useCreateLink();
  const updateMutation = useUpdateLink();
  const statusMutation = useLinkStatus();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LinkForm>({
    defaultValues: {
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
    },
  });

  const values = watch();
  const isEditing = Boolean(values.id);
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
      addToast({ type: "success", message: "Link actualizado" });
    } else {
      await createMutation.mutateAsync(payload);
      addToast({ type: "success", message: "Link creado" });
    }
    reset();
    setDrawerOpen(false);
  };

  const startEdit = (link: Link) => {
    if (!canManageLinks) return;
    setValue("id", link.id);
    setValue("campaign", link.campaign);
    setValue("grupo", link.grupo ?? "");
    setValue("titulo", link.titulo);
    setValue("slug", link.slug);
    setValue("periodo", link.periodo ?? "");
    setValue("semana_trabajo", link.semana_trabajo ?? undefined);
    setValue("cuotas", link.cuotas ?? undefined);
    setValue("modalidad", link.modalidad);
    setValue("condicion", link.condicion);
    setValue("hora_gestion", link.hora_gestion ?? "");
    setValue("descanso", link.descanso ?? "");
    setValue("expires_at", toLocalDateTimeInput(link.expires_at));
    setValue("notes", link.notes ?? "");
    setDrawerOpen(true);
  };

  const changeStatus = async (
    linkId: string,
    action: "expire" | "revoke" | "activate",
  ) => {
    if (!canCloseLinks) return;
    await statusMutation.mutateAsync({ id: linkId, action });
    addToast({
      type: "info",
      message:
        action === "expire"
          ? "Link expirado"
          : action === "revoke"
            ? "Link revocado"
            : "Link activado",
    });
  };

  const normalizeNumberValue = (
    value: number | null | undefined,
  ): number | "" => (Number.isFinite(value) ? (value as number) : "");

  const toLocalDateTimeInput = (isoString: string | null | undefined) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours(),
    )}:${pad(date.getMinutes())}`;
  };

  const listEmpty = useMemo(
    () => !isLoading && canReadLinks && items.length === 0,
    [isLoading, canReadLinks, items.length],
  );
  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return term
      ? items.filter((l) =>
          [l.titulo, l.slug, l.campaign, l.estado, l.modalidad, l.condicion].some((v) =>
            v?.toLowerCase().includes(term),
          ),
        )
      : items;
  }, [items, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleCreateClick = () => {
    reset();
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Links"
        subtitle="Genera links de reclutamiento y controla su estado."
        actions={
          canManageLinks && (
            <button type="button" className="btn-primary" onClick={handleCreateClick}>
              Nuevo link
            </button>
          )
        }
      />

      <Card className="space-y-3">
        <SectionHeader
          title="Listado"
          actions={isLoading ? <span className="pill">Cargando…</span> : null}
        />
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Buscar por título, slug, campaña, estado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar links"
            className="max-w-sm"
          />
        </div>
        {!canReadLinks && <p className="text-sm text-gray-500">No tienes permiso para ver links.</p>}
        {listEmpty && <EmptyState onCreate={canManageLinks ? handleCreateClick : undefined} />}

        <div className="grid gap-3 md:grid-cols-2">
          {canReadLinks &&
            paged.map((link) => (
              <article
                key={link.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-sm transition hover:shadow-theme-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-xs uppercase text-gray-500">{link.slug}</p>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{link.titulo}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Mod: {link.modalidad} · Cond: {link.condicion} · Hr: {link.hora_gestion || "—"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Vence:{" "}
                      {new Intl.DateTimeFormat("es-PE", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(link.expires_at))}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">URL pública: /apply/{link.slug}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right">
                    <span className="pill">{link.estado}</span>
                    <span className="text-[11px] text-gray-500">Campaña: {link.campaign}</span>
                    <div className="mt-2 flex flex-wrap justify-end gap-2">
                      {canManageLinks && (
                        <button type="button" className="pill" onClick={() => startEdit(link)}>
                          Editar
                        </button>
                      )}
                      {canCloseLinks && (
                        <>
                          <button
                            type="button"
                            className="pill bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-200"
                            onClick={() => changeStatus(link.id, "expire")}
                            disabled={statusMutation.isPending}
                          >
                            Expirar
                          </button>
                          <button
                            type="button"
                            className="pill bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200"
                            onClick={() => changeStatus(link.id, "revoke")}
                            disabled={statusMutation.isPending}
                          >
                            Revocar
                          </button>
                          <button
                            type="button"
                            className="pill bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-200"
                            onClick={() => changeStatus(link.id, "activate")}
                            disabled={statusMutation.isPending}
                          >
                            Activar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
        </div>
        {canReadLinks && filtered.length > pageSize && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500">
              Página {page} de {totalPages} · {filtered.length} links
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
                disabled={page === totalPages}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </Card>

      <Drawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          reset();
        }}
        title={isEditing ? "Editar link" : "Nuevo link"}
        width="lg"
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)} noValidate>
          <p className="text-xs text-gray-500 dark:text-gray-400 md:col-span-2">Campos marcados con * son obligatorios.</p>
          <Field label="Campaña*" hint="Selecciona la campaña asociada">
            <Select
              {...register("campaign", {
                required: "Selecciona una campaña",
              })}
              value={values.campaign}
              disabled={!canManageLinks}
              aria-invalid={!!errors.campaign}
              aria-describedby={errors.campaign ? "campaign-error" : undefined}
            >
              <option value="">Selecciona</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Select>
            {errors.campaign && (
              <span id="campaign-error" className="text-sm font-medium text-error-500">
                {errors.campaign.message}
              </span>
            )}
          </Field>

          <Field label="Grupo">
            <Input
              disabled={!canManageLinks}
              {...register("grupo", {
                onChange: (e) =>
                  setValue("grupo", e.target.value.toUpperCase(), {
                    shouldValidate: false,
                  }),
              })}
              value={values.grupo}
            />
          </Field>

          <Field label="Título*">
            <Input
              {...register("titulo", {
                required: "Requerido",
                minLength: { value: 3, message: "Mínimo 3 caracteres" },
              })}
              value={values.titulo}
              disabled={!canManageLinks}
              aria-invalid={!!errors.titulo}
              aria-describedby={errors.titulo ? "titulo-error" : undefined}
            />
            {errors.titulo && (
              <span id="titulo-error" className="text-sm font-medium text-error-500">
                {errors.titulo.message}
              </span>
            )}
          </Field>

          <Field label="Slug público*" hint="Solo minúsculas, números y guiones. Ej: campaña-2025">
            <Input
              {...register("slug", {
                required: "Requerido",
                minLength: { value: 3, message: "Mínimo 3 caracteres" },
                pattern: {
                  value: /^[a-z0-9-]+$/,
                  message: "Sólo minúsculas, números y guiones",
                },
              })}
              value={values.slug}
              disabled={!canManageLinks}
              aria-invalid={!!errors.slug}
              aria-describedby={errors.slug ? "slug-error" : undefined}
            />
            {errors.slug && (
              <span id="slug-error" className="text-sm font-medium text-error-500">
                {errors.slug.message}
              </span>
            )}
          </Field>

          <Field label="Periodo">
            <Input
              disabled={!canManageLinks}
              {...register("periodo", {
                onChange: (e) =>
                  setValue("periodo", e.target.value.toUpperCase(), {
                    shouldValidate: false,
                  }),
              })}
              value={values.periodo ?? ""}
            />
          </Field>

          <Field label="Semana de trabajo">
            <Input
              type="number"
              {...register("semana_trabajo", {
                valueAsNumber: true,
                validate: {
                  isNumber: (v) => v == null || Number.isFinite(v) || "Ingresa un número",
                  range: (v) => v == null || (v >= 1 && v <= 53) || "Debe estar entre 1 y 53",
                },
              })}
              disabled={!canManageLinks}
              value={normalizeNumberValue(values.semana_trabajo)}
              aria-invalid={!!errors.semana_trabajo}
              aria-describedby={errors.semana_trabajo ? "semana-error" : undefined}
            />
            {errors.semana_trabajo && (
              <span id="semana-error" className="text-sm font-medium text-error-500">
                {errors.semana_trabajo.message as string}
              </span>
            )}
          </Field>

          <Field label="Cuotas">
            <Input
              type="number"
              {...register("cuotas", {
                valueAsNumber: true,
                validate: {
                  isNumber: (v) => v == null || Number.isFinite(v) || "Ingresa un número",
                  positive: (v) => v == null || v > 0 || "Debe ser mayor a 0",
                },
              })}
              value={normalizeNumberValue(values.cuotas)}
              disabled={!canManageLinks}
              aria-invalid={!!errors.cuotas}
              aria-describedby={errors.cuotas ? "cuotas-error" : undefined}
            />
            {errors.cuotas && (
              <span id="cuotas-error" className="text-sm font-medium text-error-500">
                {errors.cuotas.message as string}
              </span>
            )}
          </Field>

          <Field label="Modalidad">
            <Select
              {...register("modalidad")}
              value={values.modalidad}
              disabled={!canManageLinks}
            >
              <option value="presencial">Presencial</option>
              <option value="remoto">Remoto</option>
              <option value="hibrido">Híbrido</option>
            </Select>
          </Field>

          <Field label="Condición">
            <Select
              {...register("condicion")}
              value={values.condicion}
              disabled={!canManageLinks}
            >
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="flex">Flexible</option>
            </Select>
          </Field>

          <Field label="Hora de gestión">
            <Input
              {...register("hora_gestion")}
              value={values.hora_gestion ?? ""}
              disabled={!canManageLinks}
            />
          </Field>

          <Field label="Descanso">
            <Input
              {...register("descanso")}
              value={values.descanso ?? ""}
              disabled={!canManageLinks}
            />
          </Field>

          <Field label="Expira el*" hint="Fecha y hora límite para usar el link">
            <Input
              type="datetime-local"
              {...register("expires_at", { required: "Requerido" })}
              disabled={!canManageLinks}
              value={values.expires_at}
              aria-invalid={!!errors.expires_at}
              aria-describedby={errors.expires_at ? "expires-error" : undefined}
            />
            {errors.expires_at && (
              <span id="expires-error" className="text-sm font-medium text-error-500">
                {errors.expires_at.message}
              </span>
            )}
          </Field>

          <div className="md:col-span-2">
            <Field label="Notas">
              <Textarea
                {...register("notes")}
                value={values.notes ?? ""}
                disabled={!canManageLinks}
              />
            </Field>
          </div>

          {(error || createMutation.error || updateMutation.error) && (
            <p className="text-sm font-medium text-error-500 md:col-span-2">
              {error instanceof Error
                ? error.message
                : (createMutation.error instanceof ApiError && createMutation.error.message) ||
                  (updateMutation.error instanceof ApiError && updateMutation.error.message) ||
                  "Error al guardar"}
            </p>
          )}

          <div className="flex gap-3 md:col-span-2">
            <button type="submit" className="btn-primary" disabled={saving || !canManageLinks}>
              {saving ? "Guardando…" : isEditing ? "Actualizar" : "Crear link"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => reset()}
              disabled={saving || !canManageLinks}
            >
              Limpiar
            </button>
          </div>
          {!canManageLinks && (
            <p className="text-xs text-gray-500">No tienes permiso para crear o editar links.</p>
          )}
        </form>
      </Drawer>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center dark:border-gray-700 dark:bg-gray-900/50">
      <p className="text-sm font-semibold text-gray-800 dark:text-white">Sin links</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Crea tu primer link para compartir con los postulantes.
      </p>
      {onCreate && (
        <button type="button" className="btn-primary" onClick={onCreate}>
          Crear link
        </button>
      )}
    </div>
  );
}
