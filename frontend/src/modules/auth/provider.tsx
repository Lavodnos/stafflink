import { useCallback, useMemo, useState } from 'react';

import { ApiError } from '../../lib/apiError';
import * as authApi from './api';
import { AuthContext } from './context';
import type { AuthState, LoginPayload, LoginResponse } from './types';

const initialUser: LoginResponse['user'] = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(initialUser);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | undefined>(undefined);

  const clearError = useCallback(() => setLastError(undefined), []);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    setLastError(undefined);
    try {
      const response = await authApi.login(payload);
      setUser(response.user ?? null);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (typeof error.payload === 'object' && error.payload !== null) {
          const detail = (error.payload as Record<string, unknown>).detail;
          if (typeof detail === 'string') {
            setLastError(detail);
          } else if (detail && typeof detail === 'object' && 'message' in detail) {
            setLastError(String(detail.message));
          } else if (detail && typeof detail === 'object' && 'error' in detail) {
            setLastError(String((detail as Record<string, unknown>).error));
          } else {
            setLastError('No se pudo iniciar sesión.');
          }
        } else {
          setLastError(error.message);
        }
      } else {
        setLastError('Error inesperado al iniciar sesión.');
      }
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      isAuthenticated,
      isLoading,
      user,
      lastError,
      login,
      clearError,
    }),
    [isAuthenticated, isLoading, user, lastError, login, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
