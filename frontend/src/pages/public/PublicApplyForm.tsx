import type { ChangeEvent } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import {
  canalOptions,
  documentOptions,
  estadoCivilOptions,
  experienciaCCOptions,
  experienciaOtraOptions,
  sexoOptions,
  nivelAcademicoOptions,
  nacionalidadOptions,
  residenciaOptions,
  distritoOptions,
  tiempoExperienciaOptions,
} from "../../modules/public/constants";
import type { PublicApplyFormData } from "./types";
import { digitsOnly, toUpper } from "./utils";

type PublicApplyFormProps = {
  onSubmit: (data: PublicApplyFormData) => Promise<void>;
  onClear: () => void;
  submitting: boolean;
};

export function PublicApplyForm({
  onSubmit,
  onClear,
  submitting,
}: PublicApplyFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useFormContext<PublicApplyFormData>();

  const hasCCExperience = Boolean(
    useWatch({ name: "has_callcenter_experience" }),
  );
  const selectedDistrito = useWatch({ name: "distrito" });

  const handleNumericString =
    (field: keyof PublicApplyFormData) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const clean = digitsOnly(event.target.value);
      setValue(field, clean as PublicApplyFormData[typeof field], {
        shouldValidate: true,
        shouldDirty: true,
      });
      if (event.target.value !== clean) event.target.value = clean;
    };

  const handleNumericNumber =
    (field: keyof PublicApplyFormData) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const clean = digitsOnly(event.target.value);
      const value = clean === "" ? null : Number(clean);
      setValue(field, value as PublicApplyFormData[typeof field], {
        shouldValidate: true,
        shouldDirty: true,
      });
      if (event.target.value !== clean) event.target.value = clean;
    };

  return (
    <form
      className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-theme-lg"
      onSubmit={handleSubmit(onSubmit)}
    >
      <header className="space-y-2">
        <h2 className="section-title">Datos personales</h2>
        <p className="text-sm text-slate-500">
          Completa la información en MAYÚSCULAS donde aplique.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Tipo de documento
            <select
              className="input"
              {...register("tipo_documento", { required: "Campo obligatorio" })}
            >
              {documentOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          {errors.tipo_documento && (
            <p className="text-xs text-red-600">
              {errors.tipo_documento.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Nro de documento *
            <input
              className="input"
              inputMode="numeric"
              {...register("numero_documento", {
                required: "Campo obligatorio",
                minLength: 4,
              })}
              onInput={handleNumericString("numero_documento")}
              onBlur={(event) =>
                setValue("numero_documento", event.target.value.toUpperCase())
              }
            />
          </label>
          {errors.numero_documento && (
            <p className="text-xs text-red-600">
              {errors.numero_documento.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Apellido paterno *
            <input
              className="input"
              {...register("apellido_paterno", {
                required: "Campo obligatorio",
              })}
              onBlur={(event) =>
                setValue("apellido_paterno", event.target.value.toUpperCase())
              }
            />
          </label>
          {errors.apellido_paterno && (
            <p className="text-xs text-red-600">
              {errors.apellido_paterno.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Apellido materno *
            <input
              className="input"
              {...register("apellido_materno", {
                required: "Campo obligatorio",
              })}
              onBlur={(event) =>
                setValue("apellido_materno", event.target.value.toUpperCase())
              }
            />
          </label>
          {errors.apellido_materno && (
            <p className="text-xs text-red-600">
              {errors.apellido_materno.message}
            </p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Nombres completos *
            <input
              className="input"
              {...register("nombres_completos", {
                required: "Campo obligatorio",
              })}
              onBlur={(event) =>
                setValue("nombres_completos", event.target.value.toUpperCase())
              }
            />
          </label>
          {errors.nombres_completos && (
            <p className="text-xs text-red-600">
              {errors.nombres_completos.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Celular *
            <input
              className="input"
              inputMode="numeric"
              {...register("telefono", { required: "Campo obligatorio" })}
              onInput={handleNumericString("telefono")}
            />
          </label>
          {errors.telefono && (
            <p className="text-xs text-red-600">{errors.telefono.message}</p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Celular de referencia *
            <input
              className="input"
              inputMode="numeric"
              {...register("telefono_referencia", {
                required: "Campo obligatorio",
              })}
              onInput={handleNumericString("telefono_referencia")}
            />
          </label>
          {errors.telefono_referencia && (
            <p className="text-xs text-red-600">
              {errors.telefono_referencia.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Correo electrónico *
            <input
              type="email"
              className="input"
              {...register("email", { required: "Campo obligatorio" })}
            />
          </label>
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Género *
            <select
              className="input"
              {...register("sexo", { required: "Campo obligatorio" })}
            >
              <option value="">Selecciona</option>
              {sexoOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          {errors.sexo && (
            <p className="text-xs text-red-600">{errors.sexo.message}</p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Fecha de nacimiento *
            <input
              type="date"
              className="input"
              {...register("fecha_nacimiento", {
                required: "Campo obligatorio",
              })}
            />
          </label>
          {errors.fecha_nacimiento && (
            <p className="text-xs text-red-600">
              {errors.fecha_nacimiento.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Edad *
            <input
              type="number"
              className="input"
              {...register("edad", {
                valueAsNumber: true,
                required: "Campo obligatorio",
                min: { value: 16, message: "Debe ser mayor o igual a 16" },
              })}
              inputMode="numeric"
              onInput={handleNumericNumber("edad")}
            />
          </label>
          {errors.edad && (
            <p className="text-xs text-red-600">
              {errors.edad.message as string}
            </p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Estado civil *
            <select
              className="input"
              {...register("estado_civil", { required: "Campo obligatorio" })}
            >
              <option value="">Selecciona</option>
              {estadoCivilOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          {errors.estado_civil && (
            <p className="text-xs text-red-600">
              {errors.estado_civil.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            N° de hijos *
            <input
              type="number"
              className="input"
              {...register("numero_hijos", {
                valueAsNumber: true,
                required: "Campo obligatorio",
                min: { value: 0, message: "Debe ser 0 o más" },
              })}
              inputMode="numeric"
              onInput={handleNumericNumber("numero_hijos")}
            />
          </label>
          {errors.numero_hijos && (
            <p className="text-xs text-red-600">
              {errors.numero_hijos.message as string}
            </p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Nivel académico *
            <select
              className="input"
              {...register("nivel_academico", {
                required: "Campo obligatorio",
              })}
            >
              <option value="">Selecciona</option>
              {nivelAcademicoOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          {errors.nivel_academico && (
            <p className="text-xs text-red-600">
              {errors.nivel_academico.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Carrera *
            <input
              className="input"
              {...register("carrera", { required: "Campo obligatorio" })}
              onBlur={(event) =>
                setValue("carrera", event.target.value.toUpperCase())
              }
            />
          </label>
          {errors.carrera && (
            <p className="text-xs text-red-600">{errors.carrera.message}</p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Nacionalidad *
            <select
              className="input"
              {...register("nacionalidad", { required: "Campo obligatorio" })}
            >
              <option value="">Selecciona</option>
              {nacionalidadOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          {errors.nacionalidad && (
            <p className="text-xs text-red-600">
              {errors.nacionalidad.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Lugar de residencia *
            <select
              className="input"
              {...register("lugar_residencia", {
                required: "Campo obligatorio",
              })}
            >
              <option value="">Selecciona</option>
              {residenciaOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          {errors.lugar_residencia && (
            <p className="text-xs text-red-600">
              {errors.lugar_residencia.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Distrito de residencia *
            <select
              className="input"
              {...register("distrito", { required: "Campo obligatorio" })}
            >
              <option value="">Selecciona</option>
              {distritoOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          {errors.distrito && (
            <p className="text-xs text-red-600">
              {errors.distrito.message}
            </p>
          )}
        </div>
        {selectedDistrito === "OTRO" && (
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Especifica el distrito *
              <input
                className="input"
                {...register("distrito_otro", {
                  required: "Campo obligatorio",
                })}
                onBlur={(event) =>
                  setValue("distrito_otro", event.target.value.toUpperCase())
                }
              />
            </label>
            {errors.distrito_otro && (
              <p className="text-xs text-red-600">
                {errors.distrito_otro.message as string}
              </p>
            )}
          </div>
        )}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Dirección de domicilio *
            <input
              className="input"
              {...register("direccion", { required: "Campo obligatorio" })}
              onBlur={(event) =>
                setValue("direccion", toUpper(event.target.value))
              }
            />
          </label>
          {errors.direccion && (
            <p className="text-xs text-red-600">{errors.direccion.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="section-title">Experiencia laboral</h3>
        <div className="flex items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3">
          <input
            type="checkbox"
            className="h-4 w-4"
            {...register("has_callcenter_experience")}
            id="has_cc"
          />
          <label htmlFor="has_cc" className="text-sm font-medium text-slate-800">
            ¿Cuentas con experiencia en call center?
          </label>
        </div>

        {hasCCExperience ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Tipo de experiencia *
                <select
                  className="input"
                  {...register("callcenter_experience_type", {
                    required: hasCCExperience ? "Campo obligatorio" : false,
                  })}
                >
                  <option value="">Selecciona</option>
                  {experienciaCCOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
              {errors.callcenter_experience_type && (
                <p className="text-xs text-red-600">
                  {errors.callcenter_experience_type.message as string}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Tiempo de experiencia *
                <select
                  className="input"
                  {...register("callcenter_experience_time", {
                    required: hasCCExperience ? "Campo obligatorio" : false,
                  })}
                >
                  <option value="">Selecciona</option>
                  {tiempoExperienciaOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
              {errors.callcenter_experience_time && (
                <p className="text-xs text-red-600">
                  {errors.callcenter_experience_time.message as string}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Otra experiencia laboral *
                <select
                  className="input"
                  {...register("other_experience_type", {
                    required: !hasCCExperience ? "Campo obligatorio" : false,
                  })}
                >
                  <option value="">Selecciona</option>
                  {experienciaOtraOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
              {errors.other_experience_type && (
                <p className="text-xs text-red-600">
                  {errors.other_experience_type.message as string}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Tiempo de experiencia *
                <select
                  className="input"
                  {...register("other_experience_time", {
                    required: !hasCCExperience ? "Campo obligatorio" : false,
                  })}
                >
                  <option value="">Selecciona</option>
                  {tiempoExperienciaOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
              {errors.other_experience_time && (
                <p className="text-xs text-red-600">
                  {errors.other_experience_time.message as string}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            ¿Cómo te enteraste de la oferta? *
            <select
              className="input"
              {...register("enteraste_oferta", {
                required: "Campo obligatorio",
              })}
            >
              <option value="">Selecciona</option>
              {canalOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          {errors.enteraste_oferta && (
            <p className="text-xs text-red-600">
              {errors.enteraste_oferta.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Observación *
            <input
              className="input"
              {...register("observacion", { required: "Campo obligatorio" })}
              onBlur={(event) =>
                setValue("observacion", toUpper(event.target.value))
              }
            />
          </label>
          {errors.observacion && (
            <p className="text-xs text-red-600">
              {errors.observacion.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Enviando…" : "Enviar postulación"}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={onClear}
          disabled={submitting}
        >
          Limpiar
        </button>
      </div>
    </form>
  );
}
