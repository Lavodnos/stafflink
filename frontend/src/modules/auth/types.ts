export interface LoginPayload {
  usernameOrEmail: string;
  password: string;
  captchaToken?: string | null;
  force?: boolean;
}

export interface LoginResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  session?: Record<string, unknown>;
  user?: {
    id?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: LoginResponse['user'];
  lastError?: string;
  login(payload: LoginPayload): Promise<LoginResponse>;
  clearError(): void;
}
