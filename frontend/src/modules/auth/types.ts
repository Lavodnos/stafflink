export interface LoginPayload {
  usernameOrEmail: string;
  password: string;
  captchaToken?: string | null;
  force?: boolean;
  appId?: string;
}

export interface SessionDetail {
  session_id?: string | null;
  application_name?: string | null;
  issued_at?: string | null;
  last_seen_at?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  [key: string]: unknown;
}

export interface LoginResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  session?: SessionDetail | null;
  session_id?: string | null;
  message?: string;
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
  session?: SessionDetail | null;
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
