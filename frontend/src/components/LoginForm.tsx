import { useForm } from 'react-hook-form';

import geaLogo from '../assets/gea-logo.svg';

type FormValues = {
  identifier: string;
  password: string;
};

type LoginFormProps = {
  onSubmit: (values: FormValues) => Promise<void> | void;
  loading?: boolean;
  errorMessage?: string;
  infoMessage?: string | null;
  forceNextAttempt?: boolean;
};

export function LoginForm({ onSubmit, loading = false, errorMessage, infoMessage, forceNextAttempt }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { identifier: '', password: '' },
    mode: 'onSubmit',
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-describedby={errorMessage ? 'login-error' : undefined}
      className="relative z-10 w-full max-w-xl space-y-4 rounded-[28px] border border-white/15 bg-white/95 p-8 text-gea-midnight shadow-[0_25px_80px_rgba(11,22,88,0.35)]"
    >
      <div className="flex items-center gap-4">
        <img src={geaLogo} alt="GEA Internacional" className="h-14 w-auto" loading="lazy" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gea-slate">GEA Internacional</p>
          <h1 className="mt-1 text-3xl font-semibold text-gea-midnight">Stafflink</h1>
          <p className="text-sm text-gea-slate">Portal de acceso con sesión única IAM</p>
        </div>
      </div>

      {errorMessage ? (
        <p id="login-error" role="alert" aria-live="polite" className="text-sm font-semibold text-gea-red">
          {errorMessage}
        </p>
      ) : null}

      <div>
        <label className="text-sm font-semibold text-gea-midnight" htmlFor="identifier">
          Usuario / DNI / CE / Correo
        </label>
        <input
          id="identifier"
          type="text"
          autoComplete="username"
          placeholder="usuario@gea.local"
          {...register('identifier', {
            required: 'Ingresa un usuario o correo válido',
            minLength: { value: 3, message: 'Debe tener al menos 3 caracteres' },
          })}
          aria-invalid={errors.identifier ? 'true' : 'false'}
          disabled={loading}
          className="mt-2 w-full rounded-2xl border border-gea-slate/40 bg-gea-slate/10 px-4 py-3 text-base text-gea-midnight transition focus:border-gea-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-gea-blue/20 disabled:cursor-not-allowed"
        />
        {errors.identifier ? (
          <p className="mt-1 text-xs font-medium text-gea-red" role="alert">
            {errors.identifier.message}
          </p>
        ) : null}
      </div>

      <div>
        <label className="text-sm font-semibold text-gea-midnight" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          {...register('password', { required: 'Ingresa tu contraseña' })}
          aria-invalid={errors.password ? 'true' : 'false'}
          disabled={loading}
          className="mt-2 w-full rounded-2xl border border-gea-slate/40 bg-gea-slate/10 px-4 py-3 text-base text-gea-midnight transition focus:border-gea-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-gea-blue/20 disabled:cursor-not-allowed"
        />
        {errors.password ? (
          <p className="mt-1 text-xs font-medium text-gea-red" role="alert">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-r from-gea-green to-gea-green-light px-4 py-3 text-base font-semibold uppercase tracking-wide text-white shadow-[0_18px_35px_rgba(2,105,55,0.35)] transition hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-gea-green/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Ingresando…' : forceNextAttempt ? 'Cerrar sesión anterior e ingresar' : 'Ingresar'}
      </button>

      {infoMessage ? (
        <p className="text-sm font-semibold text-gea-green" role="status" aria-live="polite">
          {infoMessage}
        </p>
      ) : (
        <p className="text-xs text-gea-slate">
          Las sesiones siguen la política de un único dispositivo. Si necesitas asistencia, contacta a soporte GEA.
        </p>
      )}
    </form>
  );
}
