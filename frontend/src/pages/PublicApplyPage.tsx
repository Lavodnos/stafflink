import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import geaLogo from '../assets/gea-logo.svg';
import { ApiError } from '../lib/apiError';
import type { PublicCandidatePayload, PublicLink } from '../modules/public/api';
import { createPublicCandidate, fetchPublicLink } from '../modules/public/api';
import {
  canalOptions,
  documentOptions,
  estadoCivilOptions,
  experienciaCCOptions,
  experienciaOtraOptions,
  nivelAcademicoOptions,
  nacionalidadOptions,
  residenciaOptions,
  distritoOptions,
  tiempoExperienciaOptions,
} from '../modules/public/constants';

type FormData = Omit<PublicCandidatePayload, 'link_slug'> & { distrito_otro?: string };

export function PublicApplyPage() {
  const { slug } = useParams<{ slug: string }>();
  const [link, setLink] = useState<PublicLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const toUpper = (value?: string) => (value ? value.toUpperCase() : value);
  const digitsOnly = (value: string) => value.replace(/\D+/g, '');
  const handleNumericString = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = digitsOnly(e.target.value);
    setValue(field, clean as any, { shouldValidate: true, shouldDirty: true });
    if (e.target.value !== clean) e.target.value = clean;
  };
  const handleNumericNumber = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = digitsOnly(e.target.value);
    const num = clean === '' ? (null as any) : Number(clean);
    setValue(field, num as any, { shouldValidate: true, shouldDirty: true });
    if (e.target.value !== clean) e.target.value = clean;
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      tipo_documento: 'dni',
      has_callcenter_experience: false,
      distrito_otro: '',
    },
  });

  const hasCCExperience = watch('has_callcenter_experience');
  const selectedDistrito = watch('distrito');

  useEffect(() => {
    let active = true;
    async function load() {
      if (!slug) return;
      setLoading(true);
      setFetchError(null);
      try {
        const data = await fetchPublicLink(slug);
        if (active) setLink(data);
      } catch (err) {
        setFetchError(err instanceof ApiError ? err.message : 'No pudimos cargar el link.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [slug]);

  const onSubmit = async (data: FormData) => {
    if (!slug) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Normalizar mayúsculas en campos de texto clave
      const toUpper = (value?: string) => (value ? value.toUpperCase() : value);
      const distritoValue =
        data.distrito === 'OTRO' ? toUpper(data.distrito_otro)?.trim() ?? '' : toUpper(data.distrito);

      const normalized: FormData = {
        ...data,
        apellido_paterno: toUpper(data.apellido_paterno) ?? '',
        apellido_materno: toUpper(data.apellido_materno) ?? '',
        nombres_completos: toUpper(data.nombres_completos) ?? '',
        direccion: toUpper(data.direccion),
        distrito: toUpper(data.distrito),
        lugar_residencia: toUpper(data.lugar_residencia),
        carrera: toUpper(data.carrera),
        numero_documento: toUpper(data.numero_documento) ?? '',
        distrito: distritoValue,
      };

      const payload: PublicCandidatePayload = {
        link_slug: slug,
        ...normalized,
      };
      const resp = await createPublicCandidate(payload);
      setSubmittedId(resp.id);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Error al enviar el formulario.');

      // Mapear errores del backend al campo de documento cuando vengan en lista/objeto
      if (err instanceof ApiError && err.payload) {
        const details = err.payload as unknown;
        // Caso: array ["mensaje"]
        if (Array.isArray(details) && typeof details[0] === 'string') {
          setError('numero_documento', {
            type: 'server',
            message: details[0],
          });
        }
        // Caso: objeto { campo: ["mensaje"] } o { campo: "mensaje" }
        if (details && typeof details === 'object' && !Array.isArray(details)) {
          Object.entries(details as Record<string, unknown>).forEach(([field, msgs]) => {
            const msg =
              Array.isArray(msgs) && typeof msgs[0] === 'string'
                ? msgs[0]
                : typeof msgs === 'string'
                  ? msgs
                  : null;
            if (msg) {
              setError(field as keyof FormData, {
                type: 'server',
                message: msg,
              });
            }
          });
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const headerContent = useMemo(() => {
    if (loading) return <p className="text-slate-500">Cargando link…</p>;
    if (fetchError) return <p className="text-red-600">{fetchError}</p>;
    if (!link) return null;
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-theme-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
          <div className="flex-shrink-0">
            <img src={geaLogo} alt="GEA" className="h-16 w-auto lg:h-20" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">Campaña</p>
            <h1 className="text-3xl font-semibold text-slate-900">{link.titulo}</h1>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="pill">{link.campaign}</span>
              <span className="pill">{link.modalidad}</span>
              <span className="pill">{link.condicion}</span>
              {link.hora_gestion && <span className="pill">Horario: {link.hora_gestion}</span>}
              {link.descanso && <span className="pill">Descanso: {link.descanso}</span>}
            </div>
            <p className="text-sm text-slate-500">
              Link vigente hasta{' '}
              {new Intl.DateTimeFormat('es-PE', {
                dateStyle: 'medium',
                timeStyle: 'short',
              }).format(new Date(link.expires_at))}
            </p>
          </div>
        </div>
      </div>
    );
  }, [loading, fetchError, link]);

  if (submittedId) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-theme-lg">
            <h1 className="text-3xl font-semibold">¡Gracias por postular!</h1>
            <p className="mt-2 text-gray-600">
              Tu registro fue recibido con el ID <strong>{submittedId}</strong>. Te contactaremos si necesitamos información adicional.
            </p>
          </div>
          <div className="flex gap-3">
            <button type="button" className="btn-secondary" onClick={() => setSubmittedId(null)}>
              Registrar otro postulante
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900">
      <div className="mx-auto max-w-5xl space-y-8">
        {headerContent}
        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}
        {link && (
          <form className="rounded-2xl border border-gray-200 bg-white p-8 shadow-theme-lg space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <header className="space-y-2">
              <h2 className="section-title">Datos personales</h2>
              <p className="text-sm text-slate-500">Completa la información en MAYÚSCULAS donde aplique.</p>
            </header>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tipo de documento
                  <select className="input" {...register('tipo_documento', { required: 'Campo obligatorio' })}>
                    {documentOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                {errors.tipo_documento && <p className="text-xs text-red-600">{errors.tipo_documento.message}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nro de documento *
                  <input
                    className="input"
                    inputMode="numeric"
                    {...register('numero_documento', { required: 'Campo obligatorio', minLength: 4 })}
                    onInput={handleNumericString('numero_documento')}
                    onBlur={(e) => setValue('numero_documento', e.target.value.toUpperCase())}
                  />
                </label>
                {errors.numero_documento && <p className="text-xs text-red-600">{errors.numero_documento.message}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Apellido paterno *
                  <input
                    className="input"
                    {...register('apellido_paterno', { required: 'Campo obligatorio' })}
                    onBlur={(e) => setValue('apellido_paterno', e.target.value.toUpperCase())}
                  />
                </label>
                {errors.apellido_paterno && (
                  <p className="text-xs text-red-600">{errors.apellido_paterno.message}</p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Apellido materno *
                  <input
                    className="input"
                    {...register('apellido_materno', { required: 'Campo obligatorio' })}
                    onBlur={(e) => setValue('apellido_materno', e.target.value.toUpperCase())}
                  />
                </label>
                {errors.apellido_materno && (
                  <p className="text-xs text-red-600">{errors.apellido_materno.message}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nombres completos *
                  <input
                    className="input"
                    {...register('nombres_completos', { required: 'Campo obligatorio' })}
                    onBlur={(e) => setValue('nombres_completos', e.target.value.toUpperCase())}
                  />
                </label>
                {errors.nombres_completos && (
                  <p className="text-xs text-red-600">{errors.nombres_completos.message}</p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Celular *
                  <input
                    className="input"
                    inputMode="numeric"
                    {...register('telefono', { required: 'Campo obligatorio' })}
                    onInput={handleNumericString('telefono')}
                  />
                </label>
                {errors.telefono && <p className="text-xs text-red-600">{errors.telefono.message}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Celular de referencia *
                  <input
                    className="input"
                    inputMode="numeric"
                    {...register('telefono_referencia', { required: 'Campo obligatorio' })}
                    onInput={handleNumericString('telefono_referencia')}
                  />
                </label>
                {errors.telefono_referencia && (
                  <p className="text-xs text-red-600">{errors.telefono_referencia.message}</p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Correo electrónico *
                  <input
                    type="email"
                    className="input"
                    {...register('email', { required: 'Campo obligatorio' })}
                  />
                </label>
                {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Género *
                  <select className="input" {...register('sexo', { required: 'Campo obligatorio' })}>
                    <option value="">Selecciona</option>
                    <option value="FEMENINO">Femenino</option>
                    <option value="MASCULINO">Masculino</option>
                  </select>
                </label>
                {errors.sexo && <p className="text-xs text-red-600">{errors.sexo.message}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Fecha de nacimiento *
                  <input type="date" className="input" {...register('fecha_nacimiento', { required: 'Campo obligatorio' })} />
                </label>
                {errors.fecha_nacimiento && (
                  <p className="text-xs text-red-600">{errors.fecha_nacimiento.message}</p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Edad *
                  <input
                    type="number"
                    className="input"
                    {...register('edad', {
                      valueAsNumber: true,
                      required: 'Campo obligatorio',
                      min: { value: 16, message: 'Debe ser mayor o igual a 16' },
                    })}
                    inputMode="numeric"
                    onInput={handleNumericNumber('edad')}
                  />
                </label>
                {errors.edad && <p className="text-xs text-red-600">{errors.edad.message as string}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Estado civil *
                  <select className="input" {...register('estado_civil', { required: 'Campo obligatorio' })}>
                    <option value="">Selecciona</option>
                    {estadoCivilOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>
                {errors.estado_civil && <p className="text-xs text-red-600">{errors.estado_civil.message}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  N° de hijos *
                  <input
                    type="number"
                    className="input"
                    {...register('numero_hijos', {
                      valueAsNumber: true,
                      required: 'Campo obligatorio',
                      min: { value: 0, message: 'Debe ser 0 o más' },
                    })}
                    inputMode="numeric"
                    onInput={handleNumericNumber('numero_hijos')}
                  />
                </label>
                {errors.numero_hijos && <p className="text-xs text-red-600">{errors.numero_hijos.message as string}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nivel académico *
                  <select className="input" {...register('nivel_academico', { required: 'Campo obligatorio' })}>
                    <option value="">Selecciona</option>
                    {nivelAcademicoOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>
                {errors.nivel_academico && <p className="text-xs text-red-600">{errors.nivel_academico.message}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Carrera *
                  <input
                    className="input"
                    {...register('carrera', { required: 'Campo obligatorio' })}
                    onBlur={(e) => setValue('carrera', e.target.value.toUpperCase())}
                  />
                </label>
                {errors.carrera && <p className="text-xs text-red-600">{errors.carrera.message}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nacionalidad *
                  <select className="input" {...register('nacionalidad', { required: 'Campo obligatorio' })}>
                    <option value="">Selecciona</option>
                    {nacionalidadOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>
                {errors.nacionalidad && <p className="text-xs text-red-600">{errors.nacionalidad.message}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Lugar de residencia *
                  <select className="input" {...register('lugar_residencia', { required: 'Campo obligatorio' })}>
                    <option value="">Selecciona</option>
                    {residenciaOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>
                {errors.lugar_residencia && (
                  <p className="text-xs text-red-600">{errors.lugar_residencia.message}</p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Distrito de residencia *
                  <select className="input" {...register('distrito', { required: 'Campo obligatorio' })}>
                    <option value="">Selecciona</option>
                    {distritoOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>
                {errors.distrito && <p className="text-xs text-red-600">{errors.distrito.message}</p>}
              </div>
              {selectedDistrito === 'OTRO' && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Especifica el distrito *
                    <input
                      className="input"
                      {...register('distrito_otro', {
                        required: 'Campo obligatorio',
                      })}
                      onBlur={(e) => setValue('distrito_otro', e.target.value.toUpperCase())}
                    />
                  </label>
                  {errors.distrito_otro && (
                    <p className="text-xs text-red-600">{errors.distrito_otro.message as string}</p>
                  )}
                </div>
              )}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Dirección de domicilio *
                  <input
                    className="input"
                    {...register('direccion', { required: 'Campo obligatorio' })}
                    onBlur={(e) => setValue('direccion', toUpper(e.target.value))}
                  />
                </label>
                {errors.direccion && <p className="text-xs text-red-600">{errors.direccion.message}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="section-title">Experiencia laboral</h3>
              <div className="flex items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  {...register('has_callcenter_experience')}
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
                        {...register('callcenter_experience_type', {
                          required: hasCCExperience ? 'Campo obligatorio' : false,
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
                      <p className="text-xs text-red-600">{errors.callcenter_experience_type.message as string}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Tiempo de experiencia *
                      <select
                        className="input"
                        {...register('callcenter_experience_time', {
                          required: hasCCExperience ? 'Campo obligatorio' : false,
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
                      <p className="text-xs text-red-600">{errors.callcenter_experience_time.message as string}</p>
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
                        {...register('other_experience_type', {
                          required: !hasCCExperience ? 'Campo obligatorio' : false,
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
                      <p className="text-xs text-red-600">{errors.other_experience_type.message as string}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Tiempo de experiencia *
                      <select
                        className="input"
                        {...register('other_experience_time', {
                          required: !hasCCExperience ? 'Campo obligatorio' : false,
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
                      <p className="text-xs text-red-600">{errors.other_experience_time.message as string}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  ¿Cómo te enteraste de la oferta? *
                  <select className="input" {...register('enteraste_oferta', { required: 'Campo obligatorio' })}>
                    <option value="">Selecciona</option>
                    {canalOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>
                {errors.enteraste_oferta && (
                  <p className="text-xs text-red-600">{errors.enteraste_oferta.message}</p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Observación *
                  <input
                    className="input"
                    {...register('observacion', { required: 'Campo obligatorio' })}
                    onBlur={(e) => setValue('observacion', toUpper(e.target.value))}
                  />
                </label>
                {errors.observacion && <p className="text-xs text-red-600">{errors.observacion.message}</p>}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Enviando…' : 'Enviar postulación'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSubmittedId(null)}
                disabled={submitting}
              >
                Limpiar
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
