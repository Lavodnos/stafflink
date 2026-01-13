import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

import {
  Card,
  Field,
  Input,
  SectionHeader,
  Select,
  ErrorText,
} from "../../components/ui";
import { FormActions } from "../../components/common/FormActions";
import { PermissionNotice } from "../../components/common/PermissionNotice";
import type { CampaignFormState } from "./types";

type CampaignFormCardProps = {
  form: UseFormReturn<CampaignFormState>;
  canManage: boolean;
  isEditing: boolean;
  isRouteEditing: boolean;
  saving: boolean;
  errorMessage?: string;
  campaignCodeEnabled: boolean;
  areaOptions: string[];
  sedeOptions: string[];
  onSubmit: (data: CampaignFormState) => Promise<void>;
  onCancelEdit: () => void;
};

export function CampaignFormCard({
  form,
  canManage,
  isEditing,
  isRouteEditing,
  saving,
  errorMessage,
  campaignCodeEnabled,
  areaOptions,
  sedeOptions,
  onSubmit,
  onCancelEdit,
}: CampaignFormCardProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  return (
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
        {campaignCodeEnabled && (
          <Field label="Código*">
            <Controller
              control={control}
              name="codigo"
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  disabled={!canManage}
                  onChange={(event) =>
                    field.onChange(event.target.value.toUpperCase())
                  }
                />
              )}
            />
            <ErrorText message={errors.codigo?.message} />
          </Field>
        )}
        <div className="md:col-span-2">
          <Field label="Área*">
            <Controller
              control={control}
              name="area"
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value ?? ""}
                  disabled={!canManage}
                >
                  <option value="" disabled>
                    Selecciona área
                  </option>
                  {areaOptions.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </Select>
              )}
            />
            <ErrorText message={errors.area?.message} />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Nombre*">
            <Controller
              control={control}
              name="nombre"
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  disabled={!canManage}
                />
              )}
            />
            <ErrorText message={errors.nombre?.message} />
          </Field>
        </div>
        <Field label="Sede*">
          <Controller
            control={control}
            name="sede"
            render={({ field }) => (
              <Select
                {...field}
                value={field.value ?? ""}
                disabled={!canManage}
              >
                <option value="" disabled>
                  Selecciona sede
                </option>
                {sedeOptions.map((sede) => (
                  <option key={sede} value={sede}>
                    {sede}
                  </option>
                ))}
              </Select>
            )}
          />
          <ErrorText message={errors.sede?.message} />
        </Field>
        <Field label="Estado">
          <Controller
            control={control}
            name="estado"
            render={({ field }) => (
              <Select
                {...field}
                value={field.value ?? "activa"}
                disabled={!canManage}
              >
                <option value="activa">Activa</option>
                <option value="inactiva">Inactiva</option>
              </Select>
            )}
          />
        </Field>

        {errorMessage && (
          <p className="text-sm text-red-600 md:col-span-2">
            {errorMessage}
          </p>
        )}

        <div className="md:col-span-2">
          <FormActions
            isLoading={saving}
            primaryLabel={isEditing || isRouteEditing ? "Actualizar" : "Crear campaña"}
            onReset={() => reset()}
            primaryDisabled={!canManage}
            secondaryDisabled={!canManage}
          />
        </div>
      </form>
      {!canManage && (
        <PermissionNotice
          size="xs"
          message="No tienes permiso para crear o editar campañas."
        />
      )}
    </Card>
  );
}
