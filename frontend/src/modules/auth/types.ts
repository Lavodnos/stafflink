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
  forced?: boolean;
}

export interface SessionResponse {
  active: boolean;
  user?: LoginResponse['user'];
  session?: Record<string, unknown> | null;
}

export interface AuthState {
  isAuthenticated: boolean;
  isReady: boolean;
  isLoading: boolean;
  user: LoginResponse['user'];
  lastError?: string;
  login(payload: LoginPayload): Promise<LoginResponse>;
  logout(): Promise<void>;
  clearError(): void;
}
