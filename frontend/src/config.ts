export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '');
export const IAM_APP_ID = import.meta.env.VITE_IAM_APP_ID?.trim() || undefined;
export const IAM_SECURITY_URL =
  import.meta.env.VITE_IAM_SECURITY_URL?.trim() || 'https://iam.gea.local';

export function resolveApiPath(path: string): string {
  const normalisedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalisedPath}`;
}
