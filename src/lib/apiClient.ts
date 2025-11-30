import type { ApiError } from './apiError';
import { resolveApiPath } from '../config';
import { apiFetch } from './http';

function redirectToLogin() {
  const redirectTo = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
  window.location.replace(redirectTo);
}

export type ApiOptions = RequestInit & { skipJson?: boolean };

export async function apiClient<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  try {
    return await apiFetch<T>(resolveApiPath(path), {
      credentials: 'include',
      ...options,
    });
  } catch (err) {
    const error = err as ApiError;
    if (error.status === 401) {
      redirectToLogin();
    }
    if (error.status === 403) {
      alert('No tienes permiso para esta acción.');
    }
    throw err;
  }
}

