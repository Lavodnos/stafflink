import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { LoginForm } from '../components/LoginForm';
import { ApiError } from '../lib/apiError';
import { useAuth } from '../modules/auth/useAuth';

function BackgroundShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-gea-blue-deep via-gea-midnight to-black/90 px-4 py-8">
      <div className="pointer-events-none absolute -top-32 -right-16 h-80 w-80 rounded-full bg-gradient-to-br from-gea-green to-gea-green-light blur-3xl opacity-70" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-gea-red to-gea-orange blur-3xl opacity-50" />
      {children}
    </div>
  );
}

type LoginValues = {
  identifier: string;
  password: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isReady, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [forceNextAttempt, setForceNextAttempt] = useState(false);

  const handleSubmit = async ({ identifier, password }: LoginValues) => {
    setLoading(true);
    setFormError(undefined);
    setInfoMessage(null);
    try {
      const result = await login({
        usernameOrEmail: identifier.trim(),
        password: password.trim(),
        force: forceNextAttempt,
      });

      if (result.forced) {
        setInfoMessage('Sesión anterior cerrada y nueva sesión iniciada.');
      } else {
        setInfoMessage('Sesión iniciada correctamente.');
      }
      setForceNextAttempt(false);
      navigate('/');
    } catch (error) {
      if (error instanceof ApiError) {
        const payload = error.payload as { detail?: { error?: string } } | undefined;
        if (!forceNextAttempt && payload?.detail?.error === 'SESSION_ALREADY_ACTIVE') {
          setFormError('Ya existe una sesión activa en otro navegador. Presiona nuevamente “Ingresar” para cerrarla y continuar aquí.');
          setForceNextAttempt(true);
        } else {
          setFormError(error.message);
          setForceNextAttempt(false);
        }
      } else {
        setFormError('No se pudo iniciar sesión. Intenta nuevamente.');
        setForceNextAttempt(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isReady) {
    return (
      <BackgroundShell>
        <p className="text-base font-medium text-white/80">Validando sesión…</p>
      </BackgroundShell>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <BackgroundShell>
      <LoginForm
        onSubmit={handleSubmit}
        loading={loading}
        errorMessage={formError}
        infoMessage={infoMessage}
        forceNextAttempt={forceNextAttempt}
      />
    </BackgroundShell>
  );
}
