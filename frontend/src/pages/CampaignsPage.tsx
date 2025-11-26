import { useForm } from "react-hook-form";

import { Card, Field, Input, SectionHeader, Select } from "../components/ui";
import { ApiError } from "../lib/apiError";
import { usePermission } from "../modules/auth/usePermission";
import type { Campaign } from "../modules/campaigns/api";
import {
  AREA_OPTIONS,
  CAMPAIGN_CODE_ENABLED,
  SEDE_OPTIONS,
} from "../modules/campaigns/constants";
import {
  useCampaigns,
  useCreateCampaign,
  useUpdateCampaign,
} from "../modules/campaigns/hooks";

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

  const { data: items = [], isLoading, error } = useCampaigns(canRead);
  const createMutation = useCreateCampaign();
  const updateMutation = useUpdateCampaign();

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

  const isEditing = Boolean(watch("id"));
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

  const startEdit = (campaign: Campaign) => {
    setValue("id", campaign.id);
    setValue("codigo", campaign.codigo ?? "");
    setValue("area", campaign.area ?? "");
    setValue("nombre", campaign.nombre);
    setValue("sede", campaign.sede ?? "");
    setValue("estado", campaign.estado);
  };

  const formValues = watch();

  return (
    <main className="to-gea-blue-deep/10 text-gea-midnight min-h-screen bg-gradient-to-b from-white via-white px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-2">
          <p className="text-gea-slate text-sm">Campañas</p>
          <h1 className="text-gea-midnight text-3xl font-semibold">
            Gestiona campañas
          </h1>
          <p className="text-gea-slate text-sm">
            Crea o edita campañas activas para asignarlas a links de
            reclutamiento.
          </p>
        </header>

        <Card className="space-y-4">
          <SectionHeader
            title={isEditing ? "Editar campaña" : "Nueva campaña"}
            subtitle="Completa los datos mínimos."
            actions={
              isEditing &&
              canManage && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => reset()}
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
                  {...register("codigo", {
                    required: "Requerido",
                    minLength: { value: 2, message: "Mínimo 2 caracteres" },
                    onChange: (e) =>
                      setValue("codigo", e.target.value.toUpperCase(), {
                        shouldValidate: true,
                      }),
                  })}
                  value={formValues.codigo}
                />
                {errors.codigo && (
                  <span className="text-xs text-red-600">
                    {errors.codigo.message}
                  </span>
                )}
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
                {errors.area && (
                  <span className="text-xs text-red-600">
                    {errors.area.message}
                  </span>
                )}
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
                {errors.nombre && (
                  <span className="text-xs text-red-600">
                    {errors.nombre.message}
                  </span>
                )}
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
              {errors.sede && (
                <span className="text-xs text-red-600">
                  {errors.sede.message}
                </span>
              )}
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
                  : isEditing
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
            <p className="text-gea-slate text-xs">
              No tienes permiso para crear o editar campañas.
            </p>
          )}
        </Card>

        <Card className="space-y-3">
          <SectionHeader
            title="Listado"
            actions={isLoading ? <span className="pill">Cargando…</span> : null}
          />
          {!canRead && (
            <p className="text-gea-slate text-sm">
              No tienes permiso para ver campañas.
            </p>
          )}
          {!isLoading && canRead && items.length === 0 && (
            <p className="text-gea-slate text-sm">Sin campañas registradas.</p>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            {canRead &&
              items.map((c) => (
                <article
                  key={c.id}
                  className="border-gea-midnight/10 rounded-2xl border bg-white/90 p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gea-slate text-xs uppercase">
                        {c.codigo}
                      </p>
                      <h3 className="text-gea-midnight text-lg font-semibold">
                        {c.nombre}
                      </h3>
                    </div>
                    {canManage && (
                      <button
                        type="button"
                        className="pill bg-gea-midnight/10"
                        onClick={() => startEdit(c)}
                      >
                        Editar
                      </button>
                    )}
                  </div>
                  <p className="text-gea-slate text-sm">
                    Área: {c.area || "—"} · Sede: {c.sede || "—"}
                  </p>
                  <p className="text-gea-slate text-xs">Estado: {c.estado}</p>
                </article>
              ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
