import { apiFetch } from './http';
import { ApiError } from './apiError';

function redirectToLogin() {
  const redirectTo = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
  window.location.replace(redirectTo);
}

export type ApiOptions = RequestInit & { skipJson?: boolean };

export async function apiClient<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  try {
    return await apiFetch<T>(path, {
      credentials: 'include',
      ...options,
    });
  } catch (err) {
    const error = err as ApiError;

    const showToast = (message: string, type: 'info' | 'success' | 'error' = 'error') => {
      if (!message) return;
      window.dispatchEvent(
        new CustomEvent('app:toast', {
          detail: { message, type },
        }),
      );
    };

    if (error instanceof ApiError && error.status === 401) {
      redirectToLogin();
      throw err;
    }
    if (error instanceof ApiError && error.status === 403) {
      showToast('No tienes permiso para esta acción.', 'error');
    } else if (error instanceof ApiError) {
      showToast(error.message || 'Ocurrió un error con la solicitud.', 'error');
    } else {
      showToast('No se pudo completar la solicitud. Verifica tu conexión.', 'error');
    }
    throw err;
  }
}
