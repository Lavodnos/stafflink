import type { SubmitHandler, UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { useMemo } from "react";

import type { Campaign } from "@/features/campaigns";
import {
  CARGO_CONTRACTUAL_OPTIONS,
  CONDICION_OPTIONS,
  DESCANSO_OPTIONS,
  HORARIO_OPTIONS,
  MODALIDAD_OPTIONS,
  RAZON_SOCIAL_OPTIONS,
  TIPO_CONTRATACION_OPTIONS,
} from "@/features/convocatorias";
import { useEncargados } from "@/features/convocatorias";
import {
  Card,
  Field,
  Input,
  SectionHeader,
  Select,
  Textarea,
  ErrorText,
} from "../../components/ui";
import { FormActions } from "../../components/common/FormActions";
import { PermissionNotice } from "../../components/common/PermissionNotice";
import type { ConvocatoriaForm } from "./types";

type ConvocatoriaFormCardProps = {
  form: UseFormReturn<ConvocatoriaForm>;
  campaigns: Campaign[];
  canManageConvocatorias: boolean;
  isEditing: boolean;
  isRouteEditing: boolean;
  saving: boolean;
  errorMessage?: string;
  onSubmit: SubmitHandler<ConvocatoriaForm>;
  onGenerateSlug: () => void;
  onCancelEdit: () => void;
};

export function ConvocatoriaFormCard({
  form,
  campaigns,
  canManageConvocatorias,
  isEditing,
  isRouteEditing,
  saving,
  errorMessage,
  onSubmit,
  onGenerateSlug,
  onCancelEdit,
}: ConvocatoriaFormCardProps) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const slugDisabled =
    !canManageConvocatorias || isEditing || isRouteEditing;
  const encargados = watch("encargados") ?? [];
  const selectedEncargadoId = encargados[0]?.id ?? "";
  const {
    data: encargadosOptions = [],
    isLoading: isLoadingEncargados,
    error: encargadosError,
  } = useEncargados(canManageConvocatorias);
  const encargadosErrorMessage = useMemo(
    () =>
      encargadosError instanceof Error
        ? encargadosError.message
        : "Error al cargar usuarios.",
    [encargadosError],
  );

  return (
    <Card className="space-y-4">
      <SectionHeader
        title={isRouteEditing || isEditing ? "Editar convocatoria" : "Nueva convocatoria"}
        subtitle="Define campaña, slug y expiración."
        actions={
          (isRouteEditing || isEditing) &&
          canManageConvocatorias && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                reset();
                onCancelEdit();
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
        <Field label="Título de la Convocatoria*">
          <Controller
            control={control}
            name="titulo"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ""}
                disabled={!canManageConvocatorias}
              />
            )}
          />
          <ErrorText message={errors.titulo?.message} />
        </Field>
        <Field label="Campaña*">
          <Controller
            control={control}
            name="campaign"
            render={({ field }) => (
              <Select
                {...field}
                value={field.value ?? ""}
                disabled={!canManageConvocatorias}
              >
                <option value="">Selecciona</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.nombre}
                  </option>
                ))}
              </Select>
            )}
          />
          <ErrorText message={errors.campaign?.message} />
        </Field>
        <Field label="Grupo (G000)" hint="Formato esperado: G000">
          <Controller
            control={control}
            name="grupo"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ""}
                disabled={!canManageConvocatorias}
                onChange={(event) =>
                  field.onChange(event.target.value.toUpperCase())
                }
              />
            )}
          />
        </Field>

        <Field label="Slug público*" hint="Se genera automáticamente.">
          <div className="flex items-center gap-2">
            <Controller
              control={control}
              name="slug"
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  readOnly
                  disabled={slugDisabled}
                />
              )}
            />
            <button
              type="button"
              className="btn-secondary px-3 py-2 text-xs"
              onClick={onGenerateSlug}
              disabled={slugDisabled}
            >
              Regenerar
            </button>
          </div>
          <ErrorText message={errors.slug?.message} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Encargados">
            <Select
              value={selectedEncargadoId}
              onChange={(event) => {
                const nextId = event.target.value;
                if (!nextId) {
                  setValue("encargados", [], { shouldDirty: true });
                  return;
                }
                const match = encargadosOptions.find((item) => item.id === nextId);
                setValue(
                  "encargados",
                  [
                    match ?? {
                      id: nextId,
                      email: null,
                      username: null,
                      dni: null,
                    },
                  ],
                  { shouldDirty: true },
                );
              }}
              disabled={!canManageConvocatorias || isLoadingEncargados}
            >
              <option value="">
                {isLoadingEncargados ? "Cargando..." : "Selecciona un usuario"}
              </option>
              {encargadosOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.email || item.username || item.dni || item.id}
                </option>
              ))}
            </Select>
            {encargadosError && (
              <span className="text-xs text-red-600">{encargadosErrorMessage}</span>
            )}
          </Field>
        </div>
        <Field label="Periodo reclutado" hint="Periodo de trabajo">
          <Controller
            control={control}
            name="periodo"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ""}
                disabled={!canManageConvocatorias}
                onChange={(event) =>
                  field.onChange(event.target.value.toUpperCase())
                }
              />
            )}
          />
        </Field>
        <Field label="Semana de trabajo" hint="Se calcula automáticamente.">
          <Controller
            control={control}
            name="semana_trabajo"
            render={({ field }) => (
              <Input
                type="number"
                {...field}
                value={Number.isFinite(field.value) ? field.value : ""}
                readOnly
                disabled={!canManageConvocatorias}
              />
            )}
          />
          <ErrorText
            message={errors.semana_trabajo?.message as string | undefined}
          />
        </Field>
        <Field label="Número de convocados">
          <Controller
            control={control}
            name="cuotas"
            render={({ field }) => (
              <Input
                type="number"
                {...field}
                value={Number.isFinite(field.value) ? field.value : ""}
                disabled={!canManageConvocatorias}
                onChange={(event) => {
                  const value = event.target.value;
                  field.onChange(value === "" ? undefined : Number(value));
                }}
              />
            )}
          />
          <ErrorText message={errors.cuotas?.message as string | undefined} />
        </Field>
        <Field label="Modalidad">
          <Controller
            control={control}
            name="modalidad"
            render={({ field }) => (
              <Select
                {...field}
                value={field.value ?? ""}
                disabled={!canManageConvocatorias}
              >
                {MODALIDAD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            )}
          />
        </Field>
        <Field label="Condición">
          <Controller
            control={control}
            name="condicion"
            render={({ field }) => (
              <Select
                {...field}
                value={field.value ?? ""}
                disabled={!canManageConvocatorias}
              >
                {CONDICION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            )}
          />
        </Field>
        <Field label="Horario de gestión">
          <Controller
            control={control}
            name="hora_gestion"
            render={({ field }) => (
              <Select
                {...field}
                value={field.value ?? ""}
                disabled={!canManageConvocatorias}
              >
                <option value="">Selecciona</option>
                {HORARIO_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            )}
          />
        </Field>
        <Field label="Descanso">
          <Controller
            control={control}
            name="descanso"
            render={({ field }) => (
              <Select
                {...field}
                value={field.value ?? ""}
                disabled={!canManageConvocatorias}
              >
                <option value="">Selecciona</option>
                {DESCANSO_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            )}
          />
        </Field>
        <div className="md:col-span-2 pt-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Contrato estándar
          </p>
        </div>
        <Field label="Tipo de contratación">
          <Controller
            control={control}
            name="tipo_contratacion"
            render={({ field }) => (
              <Select
                {...field}
                value={field.value ?? ""}
                disabled={!canManageConvocatorias}
              >
                <option value="">Selecciona</option>
                {TIPO_CONTRATACION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            )}
          />
        </Field>
        <Field label="Razón social">
          <Controller
            control={control}
            name="razon_social"
            render={({ field }) => (
              <Select
                {...field}
                value={field.value ?? ""}
                disabled={!canManageConvocatorias}
              >
                <option value="">Selecciona</option>
                {RAZON_SOCIAL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            )}
          />
        </Field>
        <Field label="Remuneración">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">S/</span>
            <Controller
              control={control}
              name="remuneracion"
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  {...field}
                  className="flex-1"
                  value={Number.isFinite(field.value) ? field.value : ""}
                  disabled={!canManageConvocatorias}
                  onChange={(event) => {
                    const value = event.target.value;
                    field.onChange(value === "" ? undefined : Number(value));
                  }}
                />
              )}
            />
          </div>
          <ErrorText message={errors.remuneracion?.message as string | undefined} />
        </Field>
        <Field label="Bono 1 (Variable)">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">S/</span>
            <Controller
              control={control}
              name="bono_variable"
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  {...field}
                  className="flex-1"
                  value={Number.isFinite(field.value) ? field.value : ""}
                  disabled={!canManageConvocatorias}
                  onChange={(event) => {
                    const value = event.target.value;
                    field.onChange(value === "" ? undefined : Number(value));
                  }}
                />
              )}
            />
          </div>
          <ErrorText message={errors.bono_variable?.message as string | undefined} />
        </Field>
        <Field label="Bono 2 (Movilidad)">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">S/</span>
            <Controller
              control={control}
              name="bono_movilidad"
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  {...field}
                  className="flex-1"
                  value={Number.isFinite(field.value) ? field.value : ""}
                  disabled={!canManageConvocatorias}
                  onChange={(event) => {
                    const value = event.target.value;
                    field.onChange(value === "" ? undefined : Number(value));
                  }}
                />
              )}
            />
          </div>
          <ErrorText message={errors.bono_movilidad?.message as string | undefined} />
        </Field>
        <Field label="Bono 3 (Bienvenida)">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">S/</span>
            <Controller
              control={control}
              name="bono_bienvenida"
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  {...field}
                  className="flex-1"
                  value={Number.isFinite(field.value) ? field.value : ""}
                  disabled={!canManageConvocatorias}
                  onChange={(event) => {
                    const value = event.target.value;
                    field.onChange(value === "" ? undefined : Number(value));
                  }}
                />
              )}
            />
          </div>
          <ErrorText message={errors.bono_bienvenida?.message as string | undefined} />
        </Field>
        <Field label="Bono 4 (Permanencia)">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">S/</span>
            <Controller
              control={control}
              name="bono_permanencia"
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  {...field}
                  className="flex-1"
                  value={Number.isFinite(field.value) ? field.value : ""}
                  disabled={!canManageConvocatorias}
                  onChange={(event) => {
                    const value = event.target.value;
                    field.onChange(value === "" ? undefined : Number(value));
                  }}
                />
              )}
            />
          </div>
          <ErrorText message={errors.bono_permanencia?.message as string | undefined} />
        </Field>
        <Field label="Bono 5 (Asistencia perfecta)">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">S/</span>
            <Controller
              control={control}
              name="bono_asistencia"
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  {...field}
                  className="flex-1"
                  value={Number.isFinite(field.value) ? field.value : ""}
                  disabled={!canManageConvocatorias}
                  onChange={(event) => {
                    const value = event.target.value;
                    field.onChange(value === "" ? undefined : Number(value));
                  }}
                />
              )}
            />
          </div>
          <ErrorText message={errors.bono_asistencia?.message as string | undefined} />
        </Field>
        <Field label="Cargo contractual">
          <Controller
            control={control}
            name="cargo_contractual"
            render={({ field }) => (
              <Select
                {...field}
                value={field.value ?? ""}
                disabled={!canManageConvocatorias}
              >
                <option value="">Selecciona</option>
                {CARGO_CONTRACTUAL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            )}
          />
        </Field>
        <Field label="Pago de capacitación">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">S/</span>
            <Controller
              control={control}
              name="pago_capacitacion"
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  {...field}
                  className="flex-1"
                  value={Number.isFinite(field.value) ? field.value : ""}
                  disabled={!canManageConvocatorias}
                  onChange={(event) => {
                    const value = event.target.value;
                    field.onChange(value === "" ? undefined : Number(value));
                  }}
                />
              )}
            />
          </div>
          <ErrorText
            message={errors.pago_capacitacion?.message as string | undefined}
          />
        </Field>
        <Field label="Expira el*">
          <Controller
            control={control}
            name="expires_at"
            render={({ field }) => (
              <Input
                type="datetime-local"
                {...field}
                value={field.value ?? ""}
                disabled={!canManageConvocatorias}
                onChange={(event) => field.onChange(event.target.value)}
              />
            )}
          />
          <ErrorText message={errors.expires_at?.message} />
        </Field>
        <div className="md:col-span-2">
        
        </div>

        {errorMessage && (
          <p className="text-sm text-red-600 md:col-span-2">
            {errorMessage}
          </p>
        )}

        <div className="md:col-span-2">
          <FormActions
            isLoading={saving}
            primaryLabel={isEditing || isRouteEditing ? "Actualizar" : "Crear convocatoria"}
            onReset={() => reset()}
            primaryDisabled={!canManageConvocatorias}
            secondaryDisabled={!canManageConvocatorias}
          />
        </div>
      </form>
      {!canManageConvocatorias && (
        <PermissionNotice
          size="xs"
          message="No tienes permiso para crear o editar convocatorias."
        />
      )}
    </Card>
  );
}
