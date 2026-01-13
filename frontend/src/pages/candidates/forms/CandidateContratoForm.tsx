import type { UseFormReturn } from "react-hook-form";

import type { CandidateAssignment, CandidateDetail } from "@/features/candidates";
import { ErrorText, Field, Input } from "../../../components/ui";
import { FormActions } from "../../../components/common/FormActions";

type CandidateContratoFormProps = {
  detail: CandidateDetail;
  canEdit: boolean;
  form: UseFormReturn<CandidateAssignment>;
  onSubmit: (data: CandidateAssignment) => Promise<void>;
};

export function CandidateContratoForm({
  detail,
  canEdit,
  form,
  onSubmit,
}: CandidateContratoFormProps) {
  const { register, handleSubmit, reset, formState } = form;

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
      <Field label="Tipo de contratación">
        <Input
          {...register("tipo_contratacion")}
          defaultValue={detail.assignment?.tipo_contratacion ?? ""}
          disabled={!canEdit}
        />
      </Field>
      <Field label="Razón social">
        <Input
          {...register("razon_social")}
          defaultValue={detail.assignment?.razon_social ?? ""}
          disabled={!canEdit}
        />
      </Field>
      <Field label="Remuneración">
        <Input
          type="number"
          step="0.01"
          {...register("remuneracion", { valueAsNumber: true })}
          disabled={!canEdit}
          defaultValue={detail.assignment?.remuneracion ?? ""}
        />
      </Field>
      <Field label="Bono variable">
        <Input
          type="number"
          step="0.01"
          {...register("bono_variable", { valueAsNumber: true })}
          disabled={!canEdit}
          defaultValue={detail.assignment?.bono_variable ?? ""}
        />
      </Field>
      <Field label="Bono movilidad">
        <Input
          type="number"
          step="0.01"
          {...register("bono_movilidad", { valueAsNumber: true })}
          disabled={!canEdit}
          defaultValue={detail.assignment?.bono_movilidad ?? ""}
        />
      </Field>
      <Field label="Bono bienvenida">
        <Input
          type="number"
          step="0.01"
          {...register("bono_bienvenida", { valueAsNumber: true })}
          disabled={!canEdit}
          defaultValue={detail.assignment?.bono_bienvenida ?? ""}
        />
      </Field>
      <Field label="Bono permanencia">
        <Input
          type="number"
          step="0.01"
          {...register("bono_permanencia", { valueAsNumber: true })}
          disabled={!canEdit}
          defaultValue={detail.assignment?.bono_permanencia ?? ""}
        />
      </Field>
      <Field label="Bono asistencia">
        <Input
          type="number"
          step="0.01"
          {...register("bono_asistencia", { valueAsNumber: true })}
          disabled={!canEdit}
          defaultValue={detail.assignment?.bono_asistencia ?? ""}
        />
      </Field>
      <Field label="Cargo contractual">
        <Input
          {...register("cargo_contractual")}
          defaultValue={detail.assignment?.cargo_contractual ?? ""}
          disabled={!canEdit}
        />
      </Field>
      <Field label="Régimen de pago">
        <Input
          {...register("regimen_pago")}
          defaultValue={detail.assignment?.regimen_pago ?? ""}
          disabled={!canEdit}
        />
      </Field>
      <Field label="Fecha inicio">
        <Input
          type="date"
          {...register("fecha_inicio")}
          defaultValue={detail.assignment?.fecha_inicio ?? ""}
          disabled={!canEdit}
        />
      </Field>
      <Field label="Fecha fin">
        <Input
          type="date"
          {...register("fecha_fin")}
          defaultValue={detail.assignment?.fecha_fin ?? ""}
          disabled={!canEdit}
        />
      </Field>
      <Field label="Estado">
        <Input
          {...register("estado")}
          defaultValue={detail.assignment?.estado ?? ""}
          disabled={!canEdit}
        />
      </Field>
      <div className="md:col-span-2">
        <ErrorText message={formState.errors.estado?.message as string | undefined} />
      </div>
      {formState.errors.root && (
        <p className="text-sm text-red-600 md:col-span-2">
          {formState.errors.root.message}
        </p>
      )}
      <div className="md:col-span-2">
        <FormActions
          primaryLabel="Guardar contrato"
          secondaryLabel="Deshacer"
          onReset={() => reset(detail.assignment ?? {})}
          isLoading={formState.isSubmitting}
          primaryDisabled={!canEdit}
          secondaryDisabled={!canEdit}
        />
      </div>
      {!canEdit && (
        <p className="text-xs text-gray-500 md:col-span-2 dark:text-gray-400">
          Sin permiso para actualizar contrato.
        </p>
      )}
    </form>
  );
}
