import type { UseFormReturn } from "react-hook-form";

import type { Candidate } from "@/features/candidates";
import {
  canalOptions,
  distritoOptions,
  documentOptions,
  estadoCivilOptions,
  experienciaCCOptions,
  experienciaOtraOptions,
  sexoOptions,
  nacionalidadOptions,
  nivelAcademicoOptions,
  residenciaOptions,
  tiempoExperienciaOptions,
} from "../../../modules/public/constants";
import {
  ErrorText,
  Field,
  Input,
  Select,
  Textarea,
} from "../../../components/ui";
import { FormActions } from "../../../components/common/FormActions";

type CandidateDatosFormProps = {
  detail: Candidate;
  canEdit: boolean;
  form: UseFormReturn<Candidate>;
  onSubmit: (data: Candidate) => Promise<void>;
};

export function CandidateDatosForm({
  detail,
  canEdit,
  form,
  onSubmit,
}: CandidateDatosFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState,
    setValue,
    watch,
  } = form;

  const hasCCExperience = watch("has_callcenter_experience");

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
      <Field label="Tipo de documento">
        <Select
          {...register("tipo_documento")}
          defaultValue={detail.tipo_documento}
          disabled={!canEdit}
        >
          <option value="">Selecciona</option>
          {documentOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Número documento">
        <Input
          {...register("numero_documento", {
            onChange: (event) =>
              setValue("numero_documento", event.target.value.toUpperCase(), {
                shouldValidate: false,
              }),
          })}
          disabled={!canEdit}
          defaultValue={detail.numero_documento}
        />
        <ErrorText message={formState.errors.numero_documento?.message} />
      </Field>
      <Field label="Apellidos y nombres">
        <Input
          {...register("nombres_completos")}
          defaultValue={detail.nombres_completos}
          disabled={!canEdit}
        />
        <ErrorText message={formState.errors.nombres_completos?.message} />
      </Field>
      <Field label="Correo">
        <Input
          {...register("email")}
          defaultValue={detail.email}
          disabled={!canEdit}
        />
        <ErrorText message={formState.errors.email?.message} />
      </Field>
      <Field label="Teléfono">
        <Input
          {...register("telefono")}
          defaultValue={detail.telefono}
          disabled={!canEdit}
        />
        <ErrorText message={formState.errors.telefono?.message} />
      </Field>
      <Field label="Teléfono referencia">
        <Input
          {...register("telefono_referencia")}
          defaultValue={detail.telefono_referencia ?? ""}
          disabled={!canEdit}
        />
      </Field>
      <Field label="¿Cuentas con experiencia en call center?">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4"
            {...register("has_callcenter_experience")}
            defaultChecked={Boolean(detail.has_callcenter_experience)}
            disabled={!canEdit}
          />
          <span className="text-sm text-gray-700 dark:text-gray-200">
            Sí, tengo experiencia en call center
          </span>
        </div>
      </Field>
      {hasCCExperience ? (
        <>
          <Field label="Tipo de experiencia">
            <Select
              {...register("callcenter_experience_type")}
              defaultValue={detail.callcenter_experience_type ?? ""}
              disabled={!canEdit}
            >
              <option value="">Selecciona</option>
              {experienciaCCOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tiempo de experiencia">
            <Select
              {...register("callcenter_experience_time")}
              defaultValue={detail.callcenter_experience_time ?? ""}
              disabled={!canEdit}
            >
              <option value="">Selecciona</option>
              {tiempoExperienciaOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </Field>
        </>
      ) : (
        <>
          <Field label="Otra experiencia laboral">
            <Select
              {...register("other_experience_type")}
              defaultValue={detail.other_experience_type ?? ""}
              disabled={!canEdit}
            >
              <option value="">Selecciona</option>
              {experienciaOtraOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tiempo de experiencia">
            <Select
              {...register("other_experience_time")}
              defaultValue={detail.other_experience_time ?? ""}
              disabled={!canEdit}
            >
              <option value="">Selecciona</option>
              {tiempoExperienciaOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </Field>
        </>
      )}
      <Field label="¿Cómo te enteraste de la oferta?">
        <Select
          {...register("enteraste_oferta")}
          defaultValue={detail.enteraste_oferta ?? ""}
          disabled={!canEdit}
        >
          <option value="">Selecciona</option>
          {canalOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Género">
        <Select
          {...register("sexo")}
          defaultValue={detail.sexo ?? ""}
          disabled={!canEdit}
        >
          <option value="">Selecciona</option>
          {sexoOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Fecha de nacimiento">
        <Input
          type="date"
          {...register("fecha_nacimiento")}
          defaultValue={detail.fecha_nacimiento ?? ""}
          disabled={!canEdit}
        />
      </Field>
      <Field label="Edad">
        <Input
          type="number"
          {...register("edad", { valueAsNumber: true })}
          defaultValue={detail.edad ?? ""}
          disabled={!canEdit}
        />
      </Field>
      <Field label="Estado civil">
        <Select
          {...register("estado_civil")}
          defaultValue={detail.estado_civil ?? ""}
          disabled={!canEdit}
        >
          <option value="">Selecciona</option>
          {estadoCivilOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="N° de hijos">
        <Input
          type="number"
          {...register("numero_hijos", { valueAsNumber: true })}
          defaultValue={detail.numero_hijos ?? ""}
          disabled={!canEdit}
        />
      </Field>
      <Field label="Nivel académico">
        <Select
          {...register("nivel_academico")}
          defaultValue={detail.nivel_academico ?? ""}
          disabled={!canEdit}
        >
          <option value="">Selecciona</option>
          {nivelAcademicoOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Carrera">
        <Input
          {...register("carrera")}
          defaultValue={detail.carrera ?? ""}
          disabled={!canEdit}
        />
      </Field>
      <Field label="Nacionalidad">
        <Select
          {...register("nacionalidad")}
          defaultValue={detail.nacionalidad ?? ""}
          disabled={!canEdit}
        >
          <option value="">Selecciona</option>
          {nacionalidadOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Lugar de residencia">
        <Select
          {...register("lugar_residencia")}
          defaultValue={detail.lugar_residencia ?? ""}
          disabled={!canEdit}
        >
          <option value="">Selecciona</option>
          {residenciaOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Distrito">
        <Select
          {...register("distrito")}
          defaultValue={detail.distrito ?? ""}
          disabled={!canEdit}
        >
          <option value="">Selecciona</option>
          {detail.distrito && !distritoOptions.includes(detail.distrito) && (
            <option value={detail.distrito}>{detail.distrito}</option>
          )}
          {distritoOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Dirección de domicilio">
        <Input
          {...register("direccion")}
          defaultValue={detail.direccion ?? ""}
          disabled={!canEdit}
        />
      </Field>
      <Field label="Modalidad (copia)">
        <Input
          {...register("modalidad")}
          defaultValue={detail.modalidad ?? ""}
          disabled={!canEdit}
        />
      </Field>
      <Field label="Condición (copia)">
        <Input
          {...register("condicion")}
          defaultValue={detail.condicion ?? ""}
          disabled={!canEdit}
        />
      </Field>
      <Field label="Hora de gestión">
        <Input
          {...register("hora_gestion")}
          defaultValue={detail.hora_gestion ?? ""}
          disabled={!canEdit}
        />
      </Field>
      <Field label="Descanso">
        <Input
          {...register("descanso")}
          defaultValue={detail.descanso ?? ""}
          disabled={!canEdit}
        />
      </Field>
      <div className="md:col-span-2">
        <Field label="Observación">
          <Textarea
            {...register("observacion")}
            defaultValue={detail.observacion ?? ""}
            disabled={!canEdit}
          />
        </Field>
      </div>
      {formState.errors.root && (
        <p className="text-sm text-red-600 md:col-span-2">
          {formState.errors.root.message}
        </p>
      )}
      <div className="md:col-span-2">
        <FormActions
          primaryLabel="Guardar datos"
          secondaryLabel="Deshacer"
          onReset={() => reset(detail)}
          isLoading={formState.isSubmitting}
          primaryDisabled={!canEdit}
          secondaryDisabled={!canEdit}
        />
      </div>
      {!canEdit && (
        <p className="text-xs text-gray-500 md:col-span-2 dark:text-gray-400">
          Sin permiso para editar los datos del candidato.
        </p>
      )}
    </form>
  );
}
