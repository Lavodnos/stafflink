import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Card,
  Field,
  Input,
  SectionHeader,
  Select,
  Textarea,
} from "../components/ui";
import { ApiError } from "../lib/apiError";
import { usePermission } from "../modules/auth/usePermission";
import { useCampaigns } from "../modules/campaigns/hooks";
import type { LinkPayload } from "../modules/links/api";
import {
  useCreateLink,
  useLinkStatus,
  useLinks,
  useUpdateLink,
} from "../modules/links/hooks";

type LinkForm = LinkPayload & { id?: string };

type Mode = 'list' | 'create';

export function LinksPage({ mode = 'list' }: { mode?: Mode }) {
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
    const found = items.find((l) => l.id === routeId);
    if (found) {
      setFromLink(found);
    } else {
      navigate("/links", { replace: true });
    }
  }, [routeId, items, setFromLink, navigate]);

  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((link) =>
      [link.titulo, link.slug, link.modalidad, link.condicion, link.campaign]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term)),
    );
  }, [items, search]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 dark:bg-gray-900 dark:text-white">
      <div className="mx-auto max-w-(--breakpoint-2xl) space-y-6">
        <header className="flex flex-col gap-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">Links</p>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            {mode === 'create' || isRouteEditing || isEditing ? 'Crear o editar link' : 'Genera links de reclutamiento'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {mode === 'create' || isRouteEditing || isEditing
              ? 'Define campaña, slug y expiración para un link.'
              : 'Asigna campaña, parámetros por defecto y comparte el slug público.'}
          </p>
        </header>

        {(mode === 'create' || isRouteEditing) && (
          <Card className="space-y-4">
            <SectionHeader
            title={isRouteEditing || isEditing ? "Editar link" : "Nuevo link"}
            subtitle="Define campaña, slug y expiración."
            actions={
              (isRouteEditing || isEditing) &&
              canManageLinks && (
                <button
                  type="button"
                    className="btn-secondary"
                    onClick={() => {
                      reset();
                      if (isRouteEditing) navigate("/links");
                    }}
                  >
                    Cancelar edición
                  </button>
                )
              }
            />
            <form
              className="grid gap-4 md:grid-cols-2"
              onSubmit={handleSubmit(onSubmit)}
            >
            <Field label="Campaña*">
              <Select
                {...register("campaign", {
                  required: "Selecciona una campaña",
                })}
                value={values.campaign}
                disabled={!canManageLinks}
              >
                <option value="">Selecciona</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </Select>
              {errors.campaign && (
                <span className="text-xs text-red-600">
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
              />
              {errors.titulo && (
                <span className="text-xs text-red-600">
                  {errors.titulo.message}
                </span>
              )}
            </Field>
            <Field label="Slug público*">
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
              />
              {errors.slug && (
                <span className="text-xs text-red-600">
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
                    isNumber: (v) =>
                      v == null || Number.isFinite(v) || "Ingresa un número",
                    range: (v) =>
                      v == null ||
                      (v >= 1 && v <= 53) ||
                      "Debe estar entre 1 y 53",
                  },
                })}
                disabled={!canManageLinks}
                value={normalizeNumberValue(values.semana_trabajo)}
              />
              {errors.semana_trabajo && (
                <span className="text-xs text-red-600">
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
                    isNumber: (v) =>
                      v == null || Number.isFinite(v) || "Ingresa un número",
                    positive: (v) => v == null || v > 0 || "Debe ser mayor a 0",
                  },
                })}
                value={normalizeNumberValue(values.cuotas)}
                disabled={!canManageLinks}
              />
              {errors.cuotas && (
                <span className="text-xs text-red-600">
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
            <Field label="Expira el*">
              <Input
                type="datetime-local"
                {...register("expires_at", { required: "Requerido" })}
                disabled={!canManageLinks}
                value={values.expires_at}
              />
              {errors.expires_at && (
                <span className="text-xs text-red-600">
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
              <p className="text-sm text-red-600 md:col-span-2">
                {error instanceof Error
                  ? error.message
                  : (createMutation.error instanceof ApiError &&
                      createMutation.error.message) ||
                    (updateMutation.error instanceof ApiError &&
                      updateMutation.error.message) ||
                    "Error al guardar"}
              </p>
            )}

            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                className="btn-primary"
                disabled={saving || !canManageLinks}
              >
                {saving
                  ? "Guardando…"
                  : (isEditing || isRouteEditing)
                    ? "Actualizar"
                    : "Crear link"}
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
          </form>
          {!canManageLinks && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              No tienes permiso para crear o editar links.
            </p>
          )}
        </Card>
        )}

        {mode === 'list' && (
          <Card className="space-y-3">
          <SectionHeader
            title="Listado"
            actions={(
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn-secondary px-3 py-2 text-sm"
                  aria-label="Exportar links"
                  onClick={() => {
                    // TODO: integrar export real
                  }}
                >
                  Exportar
                </button>
                <button
                  type="button"
                  className="btn-primary px-4 py-2 text-sm"
                  disabled={!canManageLinks}
                  onClick={() => navigate('/links/new')}
                >
                  + Crear link
                </button>
              </div>
            )}
          />
          {!canReadLinks && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No tienes permiso para ver links.
            </p>
          )}
          {!isLoading && canReadLinks && items.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Sin links.</p>
          )}
          {canReadLinks && (
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
                    aria-label="Buscar links"
                  />
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    🔍
                  </span>
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
                <table className="min-w-full text-left text-sm text-gray-700 dark:text-gray-200">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                    <tr>
                      <th className="px-4 py-3">Slug</th>
                      <th className="px-4 py-3">Título</th>
                      <th className="px-4 py-3">Campaña</th>
                      <th className="px-4 py-3">Modalidad</th>
                      <th className="px-4 py-3">Condición</th>
                      <th className="px-4 py-3">Expira</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                    {filtered.map((link) => (
                      <tr key={link.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/80">
                        <td className="px-4 py-3 text-xs uppercase text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <span className="font-mono">{link.slug}</span>
                            <button
                              type="button"
                              className="text-[11px] font-semibold text-brand-600 hover:underline dark:text-brand-400"
                              onClick={() => {
                                const url = `${window.location.origin}/apply/${link.slug}`;
                                navigator.clipboard?.writeText(url);
                              }}
                            >
                              Copiar link
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{link.titulo}</td>
                        <td className="px-4 py-3">{link.campaign}</td>
                        <td className="px-4 py-3">{link.modalidad}</td>
                        <td className="px-4 py-3">{link.condicion}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                          {new Intl.DateTimeFormat("es-PE", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(link.expires_at))}
                        </td>
                        <td className="px-4 py-3">
                          <span className="pill">{link.estado}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex flex-wrap justify-end gap-2 text-xs">
                            <button
                              type="button"
                              className="btn-secondary px-3 py-1.5"
                              disabled={!canReadCandidates}
                              onClick={() =>
                                navigate(
                                  `/links/${link.id}/candidates?link_id=${link.id}&link_slug=${encodeURIComponent(
                                    link.slug,
                                  )}&link_title=${encodeURIComponent(link.titulo ?? '')}`,
                                )
                              }
                            >
                              Ver candidatos
                            </button>
                            {canManageLinks && (
                              <>
                                <button
                                  type="button"
                                  className="btn-primary px-3 py-1.5"
                                  onClick={() => navigate(`/links/${link.id}/edit`)}
                                >
                                  Editar
                                </button>
                                {canCloseLinks && (
                                  <>
                                    {link.estado === 'activo' && (
                                      <button
                                        type="button"
                                        className="px-3 py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-900/20"
                                        onClick={() => changeStatus(link.id, "expire")}
                                        disabled={statusMutation.isPending}
                                      >
                                        Expirar
                                      </button>
                                    )}
                                    {link.estado !== 'activo' && (
                                      <button
                                        type="button"
                                        className="px-3 py-1.5 rounded-full border border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/40 dark:text-emerald-200 dark:hover:bg-emerald-900/20"
                                        onClick={() => changeStatus(link.id, "activate")}
                                        disabled={statusMutation.isPending}
                                      >
                                        Activar
                                      </button>
                                    )}
                                  </>
                                )}
                              </>
                            )}
                          </div>
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
      </div>
    </main>
  );
}
