import type { UseFormReturn } from "react-hook-form";

import type { CandidateDetail, CandidateProcess } from "@/features/candidates";
import { ErrorText, Field, Input, Textarea } from "../../../components/ui";
import { FormActions } from "../../../components/common/FormActions";

type CandidateProcesoFormProps = {
  detail: CandidateDetail;
  canEdit: boolean;
  form: UseFormReturn<CandidateProcess>;
  onSubmit: (data: CandidateProcess) => Promise<void>;
};

export function CandidateProcesoForm({
  detail,
  canEdit,
  form,
  onSubmit,
}: CandidateProcesoFormProps) {
  const { register, handleSubmit, reset, formState } = form;

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
      <Field label="Envío DNI">
        <Input
          type="datetime-local"
          {...register("envio_dni_at")}
          defaultValue={detail.process?.envio_dni_at ?? ""}
          disabled={!canEdit}
        />
      </Field>
      <Field label="Test psicológico">
        <Input
          type="datetime-local"
          {...register("test_psicologico_at")}
          defaultValue={detail.process?.test_psicologico_at ?? ""}
          disabled={!canEdit}
        />
        <ErrorText
          message={
            formState.errors.test_psicologico_at?.message as
              | string
              | undefined
          }
        />
      </Field>
      <Field label="Validación PC">
        <Input
          type="datetime-local"
          {...register("validacion_pc_at")}
          defaultValue={detail.process?.validacion_pc_at ?? ""}
          disabled={!canEdit}
        />
        <ErrorText
          message={
            formState.errors.validacion_pc_at?.message as string | undefined
          }
        />
      </Field>
      <Field label="Evaluación día 0">
        <Input
          type="datetime-local"
          {...register("evaluacion_dia0_at")}
          defaultValue={detail.process?.evaluacion_dia0_at ?? ""}
          disabled={!canEdit}
        />
        <ErrorText
          message={
            formState.errors.evaluacion_dia0_at?.message as string | undefined
          }
        />
      </Field>
      <Field label="Inicio capacitación">
        <Input
          type="datetime-local"
          {...register("inicio_capacitacion_at")}
          defaultValue={detail.process?.inicio_capacitacion_at ?? ""}
          disabled={!canEdit}
        />
        <ErrorText
          message={
            formState.errors.inicio_capacitacion_at?.message as
              | string
              | undefined
          }
        />
      </Field>
      <Field label="Fin capacitación">
        <Input
          type="datetime-local"
          {...register("fin_capacitacion_at")}
          defaultValue={detail.process?.fin_capacitacion_at ?? ""}
          disabled={!canEdit}
        />
        <ErrorText
          message={
            formState.errors.fin_capacitacion_at?.message as string | undefined
          }
        />
      </Field>
      <Field label="Conexión OJT">
        <Input
          type="datetime-local"
          {...register("conexion_ojt_at")}
          defaultValue={detail.process?.conexion_ojt_at ?? ""}
          disabled={!canEdit}
        />
        <ErrorText
          message={
            formState.errors.conexion_ojt_at?.message as string | undefined
          }
        />
      </Field>
      <Field label="Conexión OP">
        <Input
          type="datetime-local"
          {...register("conexion_op_at")}
          defaultValue={detail.process?.conexion_op_at ?? ""}
          disabled={!canEdit}
        />
        <ErrorText
          message={
            formState.errors.conexion_op_at?.message as string | undefined
          }
        />
      </Field>
      <Field label="Pago capacitación">
        <Input
          type="datetime-local"
          {...register("pago_capacitacion_at")}
          defaultValue={detail.process?.pago_capacitacion_at ?? ""}
          disabled={!canEdit}
        />
        <ErrorText
          message={
            formState.errors.pago_capacitacion_at?.message as string | undefined
          }
        />
      </Field>
      <Field label="Estado día 0">
        <Input
          {...register("estado_dia0")}
          defaultValue={detail.process?.estado_dia0 ?? ""}
          disabled={!canEdit}
        />
      </Field>
      <Field label="Obs día 0">
        <Textarea
          {...register("observaciones_dia0")}
          defaultValue={detail.process?.observaciones_dia0 ?? ""}
          disabled={!canEdit}
        />
        <ErrorText
          message={
            formState.errors.observaciones_dia0?.message as string | undefined
          }
        />
      </Field>
      <Field label="Estado día 1">
        <Input
          {...register("estado_dia1")}
          defaultValue={detail.process?.estado_dia1 ?? ""}
          disabled={!canEdit}
        />
      </Field>
      <Field label="Obs día 1">
        <Textarea
          {...register("observaciones_dia1")}
          defaultValue={detail.process?.observaciones_dia1 ?? ""}
          disabled={!canEdit}
        />
        <ErrorText
          message={
            formState.errors.observaciones_dia1?.message as string | undefined
          }
        />
      </Field>
      <Field label="Windows status">
        <Input
          {...register("windows_status")}
          defaultValue={detail.process?.windows_status ?? ""}
          disabled={!canEdit}
        />
      </Field>
      <Field label="Estado final">
        <Input
          {...register("status_final")}
          defaultValue={detail.process?.status_final ?? ""}
          disabled={!canEdit}
        />
      </Field>
      <div className="md:col-span-2">
        <Field label="Observación final">
          <Textarea
            {...register("status_observacion")}
            defaultValue={detail.process?.status_observacion ?? ""}
            disabled={!canEdit}
          />
        </Field>
        <ErrorText message={formState.errors.status_observacion?.message} />
      </div>
      {formState.errors.root && (
        <p className="text-sm text-red-600 md:col-span-2">
          {formState.errors.root.message}
        </p>
      )}
      <div className="md:col-span-2">
        <FormActions
          primaryLabel="Guardar proceso"
          secondaryLabel="Deshacer"
          onReset={() => reset(detail.process ?? {})}
          isLoading={formState.isSubmitting}
          primaryDisabled={!canEdit}
          secondaryDisabled={!canEdit}
        />
      </div>
      {!canEdit && (
        <p className="text-xs text-gray-500 md:col-span-2 dark:text-gray-400">
          Sin permiso para actualizar el proceso.
        </p>
      )}
    </form>
  );
}
