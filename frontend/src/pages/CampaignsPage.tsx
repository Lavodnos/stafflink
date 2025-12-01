import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Card, Field, Input, SectionHeader, Select, ErrorText } from "../components/ui";
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

type FormState = {
  id?: string;
  codigo: string;
  area?: string;
  nombre: string;
  sede?: string;
  estado: string;
};

const campaignSchema = z.object({
  id: z.string().optional(),
  codigo: z.string().trim().optional(),
  area: z.string().trim().min(1, "Área requerida"),
  nombre: z.string().trim().min(1, "Nombre requerido"),
  sede: z.string().trim().min(1, "Sede requerida"),
  estado: z.enum(["activa", "inactiva"]),
});

type Mode = 'list' | 'create';

export function CampaignsPage({ mode = 'list' }: { mode?: Mode }) {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const canRead = usePermission("campaigns.read");
  const canManage = usePermission("campaigns.manage");

  const { data: items = [], isLoading, error } = useCampaigns(canRead);
  const createMutation = useCreateCampaign();
  const updateMutation = useUpdateCampaign();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormState>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      codigo: "",
      area: "",
      nombre: "",
      sede: "",
      estado: "activa",
    },
  });

  const isEditing = Boolean(watch("id"));
  const isRouteEditing = Boolean(routeId);
  const saving =
    isSubmitting || createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (data: FormState) => {
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
        codigo: "",
        area: "",
        nombre: "",
        sede: "",
        estado: "activa",
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

  const startEdit = useCallback((campaign: Campaign) => {
    setValue("id", campaign.id);
    setValue("codigo", campaign.codigo ?? "");
    setValue("area", campaign.area ?? "");
    setValue("nombre", campaign.nombre);
    setValue("sede", campaign.sede ?? "");
    setValue("estado", campaign.estado);
  }, [setValue]);

  const formValues = watch();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!routeId || !items.length) return;
    const found = items.find((c) => c.id === routeId);
    if (found) {
      startEdit(found);
    } else {
      // si no existe, vuelve al listado
      navigate("/campaigns", { replace: true });
    }
  }, [routeId, items, navigate, startEdit]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (c) =>
        (c.nombre ?? "").toLowerCase().includes(term) ||
        (c.codigo ?? "").toLowerCase().includes(term) ||
        (c.area ?? "").toLowerCase().includes(term) ||
        (c.sede ?? "").toLowerCase().includes(term),
    );
  }, [items, search]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 dark:bg-gray-900 dark:text-white">
      <div className="mx-auto max-w-(--breakpoint-2xl) space-y-6">
        <header className="flex flex-col gap-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">Campañas</p>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            {mode === 'create' || isRouteEditing || isEditing ? 'Crear o editar campaña' : 'Gestiona campañas'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {mode === 'create' || isRouteEditing || isEditing
              ? 'Completa los datos para registrar o actualizar una campaña.'
              : 'Crea o edita campañas activas para asignarlas a links de reclutamiento.'}
          </p>
        </header>

        {canRead && (mode === "create" || isRouteEditing || isEditing) && (
          <Card className="space-y-4">
            <SectionHeader
              title={isEditing || isRouteEditing ? "Editar campaña" : "Nueva campaña"}
              subtitle="Completa los datos mínimos."
              actions={
                (isEditing || isRouteEditing) &&
                canManage && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      reset();
                      if (isRouteEditing) navigate("/campaigns");
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
              {CAMPAIGN_CODE_ENABLED && (
                <Field label="Código*">
                  <Input
                    disabled={!canManage}
                    {...register("codigo")}
                    value={formValues.codigo}
                    onChange={(e) =>
                      setValue("codigo", e.target.value.toUpperCase(), { shouldValidate: true })
                    }
                  />
                  <ErrorText message={errors.codigo?.message} />
                </Field>
              )}
              <div className="md:col-span-2">
                <Field label="Área*">
                  <Select
                    disabled={!canManage}
                    {...register("area", { required: "Requerido" })}
                    value={formValues.area}
                    onChange={(e) =>
                      setValue("area", e.target.value, { shouldValidate: true })
                    }
                  >
                    <option value="" disabled>
                      Selecciona área
                    </option>
                    {AREA_OPTIONS.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </Select>
                  <ErrorText message={errors.area?.message} />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Nombre*">
                  <Input
                    {...register("nombre", {
                      required: "Requerido",
                      minLength: { value: 3, message: "Mínimo 3 caracteres" },
                    })}
                    value={formValues.nombre}
                    disabled={!canManage}
                  />
                  <ErrorText message={errors.nombre?.message} />
                </Field>
              </div>
              <Field label="Sede*">
                <Select
                  disabled={!canManage}
                  {...register("sede", { required: "Requerido" })}
                  value={formValues.sede}
                  onChange={(e) =>
                    setValue("sede", e.target.value, { shouldValidate: true })
                  }
                >
                  <option value="" disabled>
                    Selecciona sede
                  </option>
                  {SEDE_OPTIONS.map((sede) => (
                    <option key={sede} value={sede}>
                      {sede}
                    </option>
                  ))}
                </Select>
                <ErrorText message={errors.sede?.message} />
              </Field>
              <Field label="Estado">
                <Select
                  {...register("estado")}
                  value={formValues.estado}
                  disabled={!canManage}
                >
                  <option value="activa">Activa</option>
                  <option value="inactiva">Inactiva</option>
                </Select>
              </Field>

              {(error || createMutation.error || updateMutation.error) && (
                <p className="text-sm text-red-600 md:col-span-2">
                  {error instanceof Error
                    ? error.message
                    : (createMutation.error instanceof ApiError &&
                        createMutation.error.message) ||
                      (updateMutation.error instanceof ApiError &&
                        updateMutation.error.message) ||
                      "Error al guardar la campaña"}
                </p>
              )}

              <div className="flex gap-3 md:col-span-2">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving || !canManage}
                >
                  {saving
                    ? "Guardando…"
                    : isEditing || isRouteEditing
                      ? "Actualizar"
                      : "Crear campaña"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => reset()}
                  disabled={saving || !canManage}
                >
                  Limpiar
                </button>
              </div>
            </form>
            {!canManage && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No tienes permiso para crear o editar campañas.
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
                  aria-label="Exportar campañas"
                  onClick={() => {
                    // TODO: integrar export real
                  }}
                >
                  Exportar
                </button>
                <button
                  type="button"
                  className="btn-primary px-4 py-2 text-sm"
                  disabled={!canManage}
                  onClick={() => navigate('/campaigns/new')}
                >
                  + Crear campaña
                </button>
              </div>
            )}
          />
          {!canRead && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No tienes permiso para ver campañas.
            </p>
          )}
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
                aria-label="Buscar campañas"
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>
          </div>

          {isLoading && <p className="text-sm text-gray-500 dark:text-gray-400">Cargando…</p>}
          {!isLoading && canRead && filtered.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Sin campañas registradas.</p>
          )}

          {canRead && filtered.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
              <table className="min-w-full text-left text-sm text-gray-700 dark:text-gray-200">
                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Área</th>
                    <th className="px-4 py-3">Sede</th>
                    <th className="px-4 py-3">Estado</th>
                    {canManage && <th className="px-4 py-3 text-right">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/80">
                      <td className="px-4 py-3 text-xs uppercase text-gray-500 dark:text-gray-400">
                        {c.codigo || "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{c.nombre}</td>
                      <td className="px-4 py-3">{c.area || "—"}</td>
                      <td className="px-4 py-3">{c.sede || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="pill">{c.estado}</span>
                      </td>
                      {canManage && (
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            className="btn-primary px-3 py-1 text-sm"
                            onClick={() => {
                              startEdit(c);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            Editar
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </Card>
        )}
      </div>
    </main>
  );
}
