import { apiFetch } from './http';
import { ApiError } from './apiError';

function redirectToLogin() {
  const redirectTo = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
  window.location.replace(redirectTo);
}

function extractApiMessage(error: ApiError): string {
  if (Array.isArray(error.payload) && error.payload.length > 0 && typeof error.payload[0] === 'string') {
    return error.payload[0];
  }
  if (error.payload && typeof error.payload === 'object') {
    const values = Object.values(error.payload as Record<string, unknown>).flat();
    const first = values[0];
    if (typeof first === 'string') return first;
  }
  return error.message || 'Ocurrió un error con la solicitud.';
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

    const friendlyMessage = error instanceof ApiError ? extractApiMessage(error) : 'Ocurrió un error con la solicitud.';

    if (error instanceof ApiError && error.status === 403) {
      showToast('No tienes permiso para esta acción.', 'error');
    } else if (error instanceof ApiError) {
      showToast(friendlyMessage, 'error');
    } else {
      showToast('No se pudo completar la solicitud. Verifica tu conexión.', 'error');
    }

    if (error instanceof ApiError) {
      // Reemitir el ApiError con el mensaje amigable para que los componentes lo muestren.
      throw new ApiError(friendlyMessage, error.status, error.payload);
    }
    throw err;
  }
}
