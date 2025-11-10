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
      className="w-full max-w-md space-y-5 rounded-[28px] border border-white/15 bg-white/95 px-8 py-10 text-gea-midnight shadow-[0_25px_80px_rgba(11,22,88,0.35)]"
    >
      <header className="text-center">
        <img src={geaLogo} alt="GEA Internacional" className="mx-auto h-12 w-auto" loading="lazy" />
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.4em] text-gea-slate">GEA Internacional</p>
        <h1 className="mt-2 text-2xl font-semibold">Portal corporativo</h1>
        <p className="text-sm text-gea-slate">Sesiones unificadas IAM (política dispositivo único).</p>
      </header>

      {errorMessage ? (
        <p id="login-error" role="alert" aria-live="polite" className="rounded-2xl border border-gea-red/30 bg-gea-red/5 px-4 py-2 text-sm font-semibold text-gea-red">
          {errorMessage}
        </p>
      ) : null}

      <div className="space-y-5">
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
          Este acceso sigue la política de sesión única. Si necesitas asistencia, contacta a soporte GEA.
        </p>
      )}
    </form>
  );
}
