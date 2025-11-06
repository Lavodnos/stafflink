import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiError } from '../../../lib/apiError';
import { useAuth } from '../useAuth';

import type { ChangeEvent, FormEvent } from 'react';

interface FieldErrors {
  identifier?: string;
  password?: string;
  form?: string;
}

function validateIdentifier(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Ingresa usuario, DNI o correo.';
  }
  if (/^\d{8}$/.test(trimmed)) {
    return undefined; // DNI válido
  }
  if (/^\d{9}$/.test(trimmed)) {
    return undefined; // CE válido
  }
  if (trimmed.includes('@') && trimmed.includes('.')) {
    return undefined;
  }
  if (trimmed.length >= 3) {
    return undefined;
  }
  return 'Formato de usuario inválido.';
}

export function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoading, lastError, clearError } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => identifier.trim().length > 0 && password.trim().length >= 8, [identifier, password]);

  const handleChangeIdentifier = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (lastError) {
      clearError();
    }
    setIdentifier(event.target.value);
    setFieldErrors((prev) => ({ ...prev, identifier: undefined, form: undefined }));
  }, [clearError, lastError]);

  const handleChangePassword = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (lastError) {
      clearError();
    }
    setPassword(event.target.value);
    setFieldErrors((prev) => ({ ...prev, password: undefined, form: undefined }));
  }, [clearError, lastError]);

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: FieldErrors = {};

    const identifierError = validateIdentifier(identifier);
    if (identifierError) {
      errors.identifier = identifierError;
    }

    if (!password.trim()) {
      errors.password = 'Ingresa tu contraseña.';
    } else if (password.trim().length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await login({ usernameOrEmail: identifier.trim(), password: password.trim() });
      setInfoMessage('Sesión iniciada correctamente.');
      navigate('/');
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors({ form: error.message });
      } else {
        setFieldErrors({ form: 'No se pudo iniciar sesión. Intenta nuevamente.' });
      }
    }
  }, [identifier, password, login, navigate]);

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <h1>Stafflink</h1>
      <p className="login-form__subtitle">Autenticación con IAM GEA</p>

      <label htmlFor="identifier">Usuario / DNI / CE / Correo</label>
      <input
        id="identifier"
        name="identifier"
        type="text"
        autoComplete="username"
        placeholder="Ingresa tu usuario"
        value={identifier}
        onChange={handleChangeIdentifier}
        disabled={isLoading}
        required
      />
      {fieldErrors.identifier ? <p className="login-form__error">{fieldErrors.identifier}</p> : null}

      <label htmlFor="password">Contraseña</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={handleChangePassword}
        disabled={isLoading}
        required
      />
      {fieldErrors.password ? <p className="login-form__error">{fieldErrors.password}</p> : null}

      <button type="submit" disabled={!canSubmit || isLoading}>
        {isLoading ? 'Ingresando…' : 'Ingresar'}
      </button>

      {fieldErrors.form ? <p className="login-form__error">{fieldErrors.form}</p> : null}
      {lastError && !fieldErrors.form ? <p className="login-form__error">{lastError}</p> : null}
      {infoMessage ? <p className="login-form__info">{infoMessage}</p> : null}
    </form>
  );
}
