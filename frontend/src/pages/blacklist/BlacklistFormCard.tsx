import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

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
import { BLACKLIST_STATUS_OPTIONS } from "@/features/blacklist";
import type { BlacklistFormState } from "./types";

type BlacklistFormCardProps = {
  form: UseFormReturn<BlacklistFormState>;
  canManage: boolean;
  isEditing: boolean;
  isRouteEditing: boolean;
  saving: boolean;
  errorMessage?: string;
  onSubmit: (data: BlacklistFormState) => Promise<void>;
  onCancelEdit: () => void;
  initialValues: BlacklistFormState;
};

export function BlacklistFormCard({
  form,
  canManage,
  isEditing,
  isRouteEditing,
  saving,
  errorMessage,
  onSubmit,
  onCancelEdit,
  initialValues,
}: BlacklistFormCardProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  return (
    <Card className="space-y-4">
      <SectionHeader
        title={isEditing || isRouteEditing ? "Editar entrada" : "Nueva entrada"}
        subtitle="DNI en mayúsculas."
        actions={
          (isEditing || isRouteEditing) &&
          canManage && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                reset(initialValues);
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
        <Field label="DNI*">
          <Controller
            control={control}
            name="dni"
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
          <ErrorText message={errors.dni?.message} />
        </Field>
        <Field label="Nombres*">
          <Controller
            control={control}
            name="nombres"
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
          <ErrorText message={errors.nombres?.message} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Descripción*">
            <Controller
              control={control}
              name="descripcion"
              render={({ field }) => (
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  disabled={!canManage}
                />
              )}
            />
            <ErrorText message={errors.descripcion?.message} />
          </Field>
        </div>
        <Field label="Estado">
          <Controller
            control={control}
            name="estado"
            render={({ field }) => (
              <Select
                {...field}
                value={field.value ?? "activo"}
                disabled={!canManage}
              >
                {BLACKLIST_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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
            primaryLabel={isEditing || isRouteEditing ? "Actualizar" : "Crear"}
            onReset={() => reset(initialValues)}
            primaryDisabled={!canManage}
            secondaryDisabled={!canManage}
          />
        </div>
      </form>
      {!canManage && (
        <PermissionNotice
          size="xs"
          message="No tienes permiso para crear o editar entradas."
        />
      )}
    </Card>
  );
}
