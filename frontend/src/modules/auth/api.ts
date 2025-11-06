import { apiFetch } from '../../lib/http';
import type { LoginPayload, LoginResponse } from './types';

function serialisePayload(payload: LoginPayload) {
  const body: Record<string, unknown> = {
    username_or_email: payload.usernameOrEmail,
    password: payload.password,
  };

  if (payload.captchaToken) {
    body.captcha_token = payload.captchaToken;
  }

  if (typeof payload.force === 'boolean') {
    body.force = payload.force;
  }

  return body;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login/', {
    method: 'POST',
    body: JSON.stringify(serialisePayload(payload)),
  });
}
