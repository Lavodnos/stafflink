import { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiError } from '../../lib/apiError';
import * as authApi from './api';
import { AuthContext } from './context';
import type { AuthState, LoginPayload, LoginResponse } from './types';

const initialUser: LoginResponse['user'] = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(initialUser);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [lastError, setLastError] = useState<string | undefined>(undefined);

  const clearError = useCallback(() => setLastError(undefined), []);

  const restoreSession = useCallback(async () => {
    try {
      const session = await authApi.fetchSession();
      if (session.active) {
        setUser(session.user ?? null);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    setLastError(undefined);
    const forceLogin = payload.force ?? false;

    try {
      const response = await authApi.login({ ...payload, force: forceLogin });
      const finalResponse: LoginResponse = forceLogin ? { ...response, forced: true } : response;
      setUser(finalResponse.user ?? null);
      setIsAuthenticated(true);
      return finalResponse;
    } catch (error) {
      if (error instanceof ApiError && isSessionActiveError(error) && !forceLogin) {
        const friendlyMessage =
          'Ya existe una sesión activa en otro navegador. Presiona nuevamente “Ingresar” para cerrarla y continuar aquí.';
        setLastError(friendlyMessage);
        return Promise.reject(
            new ApiError(friendlyMessage, error.status, {
            detail: { error: 'SESSION_ALREADY_ACTIVE' },
          }),
        );
      }
      handleAuthError(error, setLastError);
      setIsAuthenticated(false);
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
      if (!isReady) {
        setIsReady(true);
      }
    }
  }, [isReady]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      isAuthenticated,
      isReady,
      isLoading,
      user,
      lastError,
      login,
      logout,
      clearError,
    }),
    [isAuthenticated, isReady, isLoading, user, lastError, login, logout, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function handleAuthError(error: unknown, setLastError: (message: string) => void) {
  if (error instanceof ApiError) {
    if (typeof error.payload === 'object' && error.payload !== null) {
      const detail = (error.payload as Record<string, unknown>).detail;
      if (typeof detail === 'string') {
        setLastError(detail);
        return;
      }
      if (detail && typeof detail === 'object') {
        if ('message' in detail) {
          setLastError(String(detail.message));
          return;
        }
        if ('error' in detail) {
          setLastError(String((detail as Record<string, unknown>).error));
          return;
        }
      }
    }
    setLastError(error.message);
  } else {
    setLastError('Error inesperado al iniciar sesión.');
  }
}

function isSessionActiveError(error: ApiError): boolean {
  if (typeof error.payload !== 'object' || error.payload === null) {
    return false;
  }
  const detail = (error.payload as Record<string, unknown>).detail;
  if (detail && typeof detail === 'object' && 'error' in detail) {
    return String(detail.error) === 'SESSION_ALREADY_ACTIVE';
  }
  return false;
}
