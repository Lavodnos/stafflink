import type { UseFormReturn } from "react-hook-form";

import type {
  CandidateDetail,
  CandidateDocuments,
} from "@/features/candidates";
import { ErrorText, Field, Input, Select, Textarea } from "../../../components/ui";
import { FormActions } from "../../../components/common/FormActions";

type CandidateDocumentsFormProps = {
  detail: CandidateDetail;
  canEdit: boolean;
  form: UseFormReturn<CandidateDocuments>;
  onSubmit: (data: CandidateDocuments) => Promise<void>;
};

export function CandidateDocumentsForm({
  detail,
  canEdit,
  form,
  onSubmit,
}: CandidateDocumentsFormProps) {
  const { register, handleSubmit, reset, formState } = form;

  return (
    <form className="grid gap-4 md:grid-cols-3" onSubmit={handleSubmit(onSubmit)}>
      <Field label="CV entregado">
        <Select
          {...register("cv_entregado")}
          defaultValue={String(detail.documents?.cv_entregado ?? "")}
          disabled={!canEdit}
        >
          <option value="">—</option>
          <option value="true">Sí</option>
          <option value="false">No</option>
        </Select>
      </Field>
      <Field label="DNI entregado">
        <Select
          {...register("dni_entregado")}
          defaultValue={String(detail.documents?.dni_entregado ?? "")}
          disabled={!canEdit}
        >
          <option value="">—</option>
          <option value="true">Sí</option>
          <option value="false">No</option>
        </Select>
      </Field>
      <Field label="Certificado">
        <Select
          {...register("certificado_entregado")}
          defaultValue={String(detail.documents?.certificado_entregado ?? "")}
          disabled={!canEdit}
        >
          <option value="">—</option>
          <option value="true">Sí</option>
          <option value="false">No</option>
        </Select>
      </Field>
      <Field label="Recibo servicio">
        <Select
          {...register("recibo_servicio_entregado")}
          defaultValue={String(detail.documents?.recibo_servicio_entregado ?? "")}
          disabled={!canEdit}
        >
          <option value="">—</option>
          <option value="true">Sí</option>
          <option value="false">No</option>
        </Select>
      </Field>
      <Field label="Ficha de datos">
        <Select
          {...register("ficha_datos_entregado")}
          defaultValue={String(detail.documents?.ficha_datos_entregado ?? "")}
          disabled={!canEdit}
        >
          <option value="">—</option>
          <option value="true">Sí</option>
          <option value="false">No</option>
        </Select>
      </Field>
      <Field label="Autorización de datos">
        <Select
          {...register("autorizacion_datos_entregado")}
          defaultValue={String(
            detail.documents?.autorizacion_datos_entregado ?? "",
          )}
          disabled={!canEdit}
        >
          <option value="">—</option>
          <option value="true">Sí</option>
          <option value="false">No</option>
        </Select>
      </Field>
      <Field label="Estado checklist">
        <Input
          {...register("status")}
          defaultValue={detail.documents?.status ?? ""}
          disabled={!canEdit}
        />
      </Field>
      <div className="md:col-span-3">
        <Field label="Observación">
          <Textarea
            {...register("observacion")}
            defaultValue={detail.documents?.observacion ?? ""}
            disabled={!canEdit}
          />
        </Field>
        <ErrorText message={formState.errors.observacion?.message} />
      </div>
      {formState.errors.root && (
        <p className="text-sm text-red-600 md:col-span-3">
          {formState.errors.root.message}
        </p>
      )}
      <div className="md:col-span-3">
        <FormActions
          primaryLabel="Guardar checklist"
          secondaryLabel="Deshacer"
          onReset={() => reset(detail.documents ?? {})}
          isLoading={formState.isSubmitting}
          primaryDisabled={!canEdit}
          secondaryDisabled={!canEdit}
        />
      </div>
      {!canEdit && (
        <p className="text-xs text-gray-500 md:col-span-3 dark:text-gray-400">
          Sin permiso para actualizar documentos.
        </p>
      )}
    </form>
  );
}
