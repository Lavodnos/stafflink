import type { SubmitHandler, UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

import type { Campaign } from "@/features/campaigns";
import { CONDICION_OPTIONS, MODALIDAD_OPTIONS } from "@/features/links";
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
import type { LinkForm } from "./types";

type LinkFormCardProps = {
  form: UseFormReturn<LinkForm>;
  campaigns: Campaign[];
  canManageLinks: boolean;
  isEditing: boolean;
  isRouteEditing: boolean;
  saving: boolean;
  errorMessage?: string;
  onSubmit: SubmitHandler<LinkForm>;
  onCancelEdit: () => void;
};

export function LinkFormCard({
  form,
  campaigns,
  canManageLinks,
  isEditing,
  isRouteEditing,
  saving,
  errorMessage,
  onSubmit,
  onCancelEdit,
}: LinkFormCardProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  return (
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
        <Field label="Campaña*">
          <Controller
            control={control}
            name="campaign"
            render={({ field }) => (
              <Select
                {...field}
                value={field.value ?? ""}
                disabled={!canManageLinks}
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
        <Field label="Grupo">
          <Controller
            control={control}
            name="grupo"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ""}
                disabled={!canManageLinks}
                onChange={(event) =>
                  field.onChange(event.target.value.toUpperCase())
                }
              />
            )}
          />
        </Field>
        <Field label="Título*">
          <Controller
            control={control}
            name="titulo"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ""}
                disabled={!canManageLinks}
              />
            )}
          />
          <ErrorText message={errors.titulo?.message} />
        </Field>
        <Field label="Slug público*">
          <Controller
            control={control}
            name="slug"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ""}
                disabled={!canManageLinks}
              />
            )}
          />
          <ErrorText message={errors.slug?.message} />
        </Field>
        <Field label="Periodo">
          <Controller
            control={control}
            name="periodo"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ""}
                disabled={!canManageLinks}
                onChange={(event) =>
                  field.onChange(event.target.value.toUpperCase())
                }
              />
            )}
          />
        </Field>
        <Field label="Semana de trabajo">
          <Controller
            control={control}
            name="semana_trabajo"
            render={({ field }) => (
              <Input
                type="number"
                {...field}
                value={Number.isFinite(field.value) ? field.value : ""}
                disabled={!canManageLinks}
                onChange={(event) => {
                  const value = event.target.value;
                  field.onChange(value === "" ? undefined : Number(value));
                }}
              />
            )}
          />
          <ErrorText
            message={errors.semana_trabajo?.message as string | undefined}
          />
        </Field>
        <Field label="Cuotas">
          <Controller
            control={control}
            name="cuotas"
            render={({ field }) => (
              <Input
                type="number"
                {...field}
                value={Number.isFinite(field.value) ? field.value : ""}
                disabled={!canManageLinks}
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
                disabled={!canManageLinks}
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
                disabled={!canManageLinks}
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
        <Field label="Hora de gestión">
          <Controller
            control={control}
            name="hora_gestion"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ""}
                disabled={!canManageLinks}
              />
            )}
          />
        </Field>
        <Field label="Descanso">
          <Controller
            control={control}
            name="descanso"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ""}
                disabled={!canManageLinks}
              />
            )}
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
                disabled={!canManageLinks}
                onChange={(event) => field.onChange(event.target.value)}
              />
            )}
          />
          <ErrorText message={errors.expires_at?.message} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Notas">
            <Controller
              control={control}
              name="notes"
              render={({ field }) => (
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  disabled={!canManageLinks}
                />
              )}
            />
          </Field>
        </div>

        {errorMessage && (
          <p className="text-sm text-red-600 md:col-span-2">
            {errorMessage}
          </p>
        )}

        <div className="md:col-span-2">
          <FormActions
            isLoading={saving}
            primaryLabel={isEditing || isRouteEditing ? "Actualizar" : "Crear link"}
            onReset={() => reset()}
            primaryDisabled={!canManageLinks}
            secondaryDisabled={!canManageLinks}
          />
        </div>
      </form>
      {!canManageLinks && (
        <PermissionNotice
          size="xs"
          message="No tienes permiso para crear o editar links."
        />
      )}
    </Card>
  );
}
