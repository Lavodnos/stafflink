import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Drawer } from "../components/common/Drawer";
import { useToastStore } from "../components/common/Toast";
import { Card, Field, Input, SectionHeader, Select } from "../components/ui";
import { ApiError } from "../lib/apiError";
import { usePermission } from "../modules/auth/usePermission";
import type { Campaign } from "../modules/campaigns/api";
import { AREA_OPTIONS, CAMPAIGN_CODE_ENABLED, SEDE_OPTIONS } from "../modules/campaigns/constants";
import { useCampaigns, useCreateCampaign, useUpdateCampaign } from "../modules/campaigns/hooks";

type FormState = {
  id?: string;
  codigo: string;
  area?: string;
  nombre: string;
  sede?: string;
  estado: string;
};

export function CampaignsPage() {
  const canRead = usePermission("campaigns.read");
  const canManage = usePermission("campaigns.manage");
  const addToast = useToastStore((s) => s.add);

  const { data: items = [], isLoading, error } = useCampaigns(canRead);
  const createMutation = useCreateCampaign();
  const updateMutation = useUpdateCampaign();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormState>({
    defaultValues: {
      codigo: "",
      area: "",
      nombre: "",
      sede: "",
      estado: "activa",
    },
  });

  const formValues = watch();
  const isEditing = Boolean(formValues.id);
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
          : normalizedCodigo.length === 0
            ? null
            : normalizedCodigo,
      area: data.area?.trim().toUpperCase() ?? "",
      nombre: data.nombre.trim(),
      sede: data.sede?.trim().toUpperCase() ?? "",
      estado: data.estado,
    };
    try {
      if (data.id) {
        await updateMutation.mutateAsync({ id: data.id, payload });
        addToast({ type: "success", message: "Campaña actualizada" });
      } else {
        await createMutation.mutateAsync(payload);
        addToast({ type: "success", message: "Campaña creada" });
      }
      reset({
        codigo: "",
        area: "",
        nombre: "",
        sede: "",
        estado: "activa",
        id: undefined,
      });
      setDrawerOpen(false);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Error al guardar la campaña";
      throw new ApiError(message, 400);
    }
  };

  const startEdit = (campaign: Campaign) => {
    setValue("id", campaign.id);
    setValue("codigo", campaign.codigo ?? "");
    setValue("area", campaign.area ?? "");
    setValue("nombre", campaign.nombre);
    setValue("sede", campaign.sede ?? "");
    setValue("estado", campaign.estado);
    setDrawerOpen(true);
  };

  const startCreate = () => {
    reset({
      codigo: "",
      area: "",
      nombre: "",
      sede: "",
      estado: "activa",
      id: undefined,
    });
    setDrawerOpen(true);
  };

  const listEmpty = useMemo(() => !isLoading && canRead && items.length === 0, [isLoading, canRead, items.length]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return term
      ? items.filter((c) =>
          [c.nombre, c.codigo, c.area, c.sede, c.estado].some((v) => v?.toLowerCase().includes(term)),
        )
      : items;
  }, [items, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Campañas"
        subtitle="Gestiona campañas activas para asignarlas a links de reclutamiento."
        actions={
          canManage && (
            <button type="button" className="btn-primary" onClick={startCreate}>
              Nueva campaña
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
            placeholder="Buscar por nombre, código, área, sede..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar campañas"
            className="max-w-sm"
          />
        </div>
        {!canRead && (
          <p className="text-sm text-gray-500">No tienes permiso para ver campañas.</p>
        )}
        {listEmpty && <EmptyState onCreate={canManage ? startCreate : undefined} />}
        <div className="grid gap-3 md:grid-cols-2">
          {canRead &&
            paged.map((c) => (
              <article
                key={c.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-sm transition hover:shadow-theme-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase text-gray-500">{c.codigo || "—"}</p>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{c.nombre}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Área: {c.area || "—"} · Sede: {c.sede || "—"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Estado: {c.estado}</p>
                  </div>
                  {canManage && (
                    <button type="button" className="pill" onClick={() => startEdit(c)}>
                      Editar
                    </button>
                  )}
                </div>
              </article>
            ))}
        </div>
        {canRead && filtered.length > pageSize && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500">
              Página {page} de {totalPages} · {filtered.length} campañas
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
          reset({
            codigo: "",
            area: "",
            nombre: "",
            sede: "",
            estado: "activa",
            id: undefined,
          });
        }}
        title={isEditing ? "Editar campaña" : "Nueva campaña"}
        width="md"
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <p className="text-xs text-gray-500 dark:text-gray-400">Campos marcados con * son obligatorios.</p>
          {CAMPAIGN_CODE_ENABLED && (
            <Field label="Código*" hint="Usa mayúsculas. Puede quedar vacío si no aplica.">
              <Input
                disabled={!canManage}
                {...register("codigo", {
                  required: "Requerido",
                  minLength: { value: 2, message: "Mínimo 2 caracteres" },
                  onChange: (e) =>
                    setValue("codigo", e.target.value.toUpperCase(), {
                      shouldValidate: true,
                    }),
                })}
                value={formValues.codigo}
                aria-invalid={!!errors.codigo}
                aria-describedby={errors.codigo ? "codigo-error" : undefined}
              />
              {errors.codigo && (
                <span id="codigo-error" className="text-sm font-medium text-error-500">
                  {errors.codigo.message}
                </span>
              )}
            </Field>
          )}

          <Field label="Área*" hint="Selecciona el área de la campaña.">
            <Select
              disabled={!canManage}
              {...register("area", { required: "Requerido" })}
              value={formValues.area}
              onChange={(e) => setValue("area", e.target.value, { shouldValidate: true })}
              aria-invalid={!!errors.area}
              aria-describedby={errors.area ? "area-error" : undefined}
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
            {errors.area && (
              <span id="area-error" className="text-sm font-medium text-error-500">
                {errors.area.message}
              </span>
            )}
          </Field>

          <Field label="Nombre*" hint="Nombre legible para el equipo.">
            <Input
              {...register("nombre", {
                required: "Requerido",
                minLength: { value: 3, message: "Mínimo 3 caracteres" },
              })}
              value={formValues.nombre}
              disabled={!canManage}
              aria-invalid={!!errors.nombre}
              aria-describedby={errors.nombre ? "nombre-error" : undefined}
            />
            {errors.nombre && (
              <span id="nombre-error" className="text-sm font-medium text-error-500">
                {errors.nombre.message}
              </span>
            )}
          </Field>

          <Field label="Sede*" hint="Selecciona la sede principal.">
            <Select
              disabled={!canManage}
              {...register("sede", { required: "Requerido" })}
              value={formValues.sede}
              onChange={(e) => setValue("sede", e.target.value, { shouldValidate: true })}
              aria-invalid={!!errors.sede}
              aria-describedby={errors.sede ? "sede-error" : undefined}
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
            {errors.sede && (
              <span id="sede-error" className="text-sm font-medium text-error-500">
                {errors.sede.message}
              </span>
            )}
          </Field>

          <Field label="Estado">
            <Select
              {...register("estado")}
              value={formValues.estado}
              disabled={!canManage}
              aria-invalid={false}
            >
              <option value="activa">Activa</option>
              <option value="inactiva">Inactiva</option>
            </Select>
          </Field>

          {(error || createMutation.error || updateMutation.error) && (
            <p className="text-sm font-medium text-error-500">
              {error instanceof Error
                ? error.message
                : (createMutation.error instanceof ApiError && createMutation.error.message) ||
                  (updateMutation.error instanceof ApiError && updateMutation.error.message) ||
                  "Error al guardar la campaña"}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={saving || !canManage}>
              {saving ? "Guardando…" : isEditing ? "Actualizar" : "Crear campaña"}
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
          {!canManage && (
            <p className="text-xs text-gray-500">
              No tienes permiso para crear o editar campañas.
            </p>
          )}
        </form>
      </Drawer>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center dark:border-gray-700 dark:bg-gray-900/50">
      <p className="text-sm font-semibold text-gray-800 dark:text-white">Sin campañas registradas</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Crea tu primera campaña para comenzar a asignar links de reclutamiento.
      </p>
      {onCreate && (
        <button type="button" className="btn-primary" onClick={onCreate}>
          Crear campaña
        </button>
      )}
    </div>
  );
}
