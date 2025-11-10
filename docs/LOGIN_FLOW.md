# Stafflink – Guía completa del login S1

Esta guía explica, paso a paso, cómo funciona el flujo de autenticación de Stafflink apoyado en el IAM GEA. Léela de arriba abajo para entender cada capa (IAM → Django → React/Tailwind) y saber dónde modificar si necesitas nuevas funcionalidades.

---

## 1. Panorama general

1. **IAM GEA (FastAPI)** valida credenciales, aplica la política de sesión única y emite tokens/sesiones.
2. **Backend Stafflink (Django + DRF)** actúa como proxy seguro: recibe peticiones del frontend, las envía al IAM y administra la cookie `stafflink_access_token`.
3. **Frontend (React + Tailwind + Vite)** consume los endpoints Django, mantiene el estado de sesión con un contexto (`useAuth`), y ofrece una UI alineada a la identidad de GEA.

---

## 2. IAM (fuente de verdad)

- Endpoints oficiales en `http://172.28.1.24:58000/docs` (`POST /api/v1/auth/login`, `/logout`, `/introspect`, etc.).
- **Duración de sesión/token**: controla `SESSION_TTL_SECONDS` y `JWT_EXPIRATION_SECONDS` en el `.env` del IAM. Si defines `SESSION_TTL_SECONDS`, ese valor también se usa como `expires_in` del JWT.
- **Datos demo**: ejecuta `scripts/seed_demo_data.py` (usuarios/app) y `scripts/ensure_iam_admin.py` (app “IAM Control Center”) para obtener un `app_id` válido.
- Política clave: “sesión única” por usuario/app. Si ya existe una sesión activa, el IAM responde `SESSION_ALREADY_ACTIVE` con detalles (ID, IP, user-agent).

---

## 3. Backend Stafflink (Django)

**Ruta base:** `backend/api/auth/`

| Archivo          | Propósito                                                                                                                                                                                                                                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client.py`      | `IAMClient`: encapsula llamadas `login`, `logout`, `introspect` hacia el IAM. Maneja errores httpx.                                                                                                                                                                                                                 |
| `serializers.py` | `LoginSerializer`: valida `username_or_email`, `password`, `captcha_token`, `force`.                                                                                                                                                                                                                                |
| `views.py`       | - `LoginView`: proxya el login, setea la cookie `stafflink_access_token` (httponly) y reescribe el mensaje de `SESSION_ALREADY_ACTIVE`. <br> - `LogoutView`: envía `Authorization: Bearer <token>`, invalida la cookie. <br> - `SessionView`: llama a `/auth/introspect`; si `active=false`, borra la cookie local. |
| `urls.py`        | Expone `/api/auth/login/`, `/api/auth/logout/`, `/api/auth/session/`.                                                                                                                                                                                                                                               |

**Configuración (`config/settings.py` + `.env`):**

- Ajusta `IAM_BASE_URL`, `IAM_APP_ID`, política de cookies (`STAFFLINK_ACCESS_TOKEN_COOKIE_*`).
- `.env.example` provee la base; duplica a `.env` y edita el `app_id` del IAM real.

**Pruebas (`api/tests/test_login.py`):** mockean `get_iam_client` para validar cookie, errores propagados y mensajes personalizados.

---

## 4. Frontend (React + Tailwind)

### 4.1 Capas

- **API layer (`src/modules/auth/api.ts`)**: `login`, `fetchSession`, `logout` → `/api/auth/...` con `credentials: 'include'`.
- **Contexto (`context.ts`, `provider.tsx`, `useAuth.ts`)**:

  - Mantiene `isAuthenticated`, `isReady`, `user`, etc.
  - Restaura la sesión llamando a `/api/auth/session/` al montar.
  - `login(payload)`:
    1. Primer intento → `force=false`.
    2. Si el IAM responde `SESSION_ALREADY_ACTIVE`, guarda un mensaje amable pero no força todavía.
    3. El contenedor (LoginPage) decide si envía `force=true` en el siguiente submit.
  - `logout()` → `POST /api/auth/logout/`, limpia estado y cookie.

- **UI reutilizable (`src/components/LoginForm.tsx`)**:

  - Construida con **React Hook Form** + Tailwind.
  - Sólo renderiza el formulario (labels accesibles, `aria-live`, `autocomplete="username"/"current-password"`, branding GEA).
  - Recibe `onSubmit`, `loading`, `errorMessage`, `infoMessage`, `forceNextAttempt`.

- **Contenedor (`src/pages/LoginPage.tsx`)**:

  - Maneja `loading`, `formError`, `infoMessage`, `forceNextAttempt`.
  - Al primer error de sesión duplicada, muestra el aviso y marca `forceNextAttempt=true`.
  - En el segundo submit, pasa `force=true` a `useAuth().login`; cuando el IAM cierra la sesión previa, navega al dashboard.

- **Guard y dashboard**:

  - `src/routes/RequireAuth.tsx`: espera a que `isReady` sea `true` y redirige a `/login` si no hay sesión.
  - `src/pages/DashboardPage.tsx`: pantalla protegida con botón “Cerrar sesión”.

- **Router (`src/App.tsx`)**: define las rutas `/login`, `/`, y un fallback a `/`.

### 4.2 Estilos/Tema

- Tailwind CSS v4 + plugin `@tailwindcss/vite`.
- `src/styles/tailwind.css`: único punto de estilos; define tokens (`--color-gea-*`), fuente Montserrat Variable y `@tailwindcss/forms`.
- No existe CSS global heredado (se eliminaron `App.css`, `index.css`). Todas las clases vienen de Tailwind y se ordenan con `prettier-plugin-tailwindcss`.
- Logo en `src/assets/gea-logo.svg` (reemplázalo por el SVG oficial cuando lo tengas).

---

## 5. Flujo de ejecución (resumen)

1. El usuario abre `http://localhost:5173`.
2. `AuthProvider` llama `/api/auth/session/`:
   - Si la cookie sigue activa, llena el contexto y muestra el dashboard.
   - Si no, se renderiza `LoginPage`.
3. Primer submit:
   - Django proxya `/api/auth/login/`.
   - Si el IAM responde `SESSION_ALREADY_ACTIVE`, `LoginPage` muestra el mensaje y marca `forceNextAttempt=true`.
4. Segundo submit:
   - Se envía `force=true`, el IAM cierra la sesión previa y emite una nueva.
   - El frontend muestra “Sesión anterior cerrada…” y navega al panel.
5. Logout:
   - `POST /api/auth/logout/` → IAM invalida la sesión → `RequireAuth` redirige a `/login`.

---

## 6. Cómo levantar el entorno

### Backend

```bash
cd backend
cp .env.example .env       # edita IAM_BASE_URL, IAM_APP_ID, etc.
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Frontend

```bash
cd frontend
cp .env.example .env       # VITE_API_BASE_URL=http://localhost:8000/api
npm install
npm run dev
```

---

## 7. Pruebas imprescindibles

1. **Smoke API**:

   ```bash
   curl -X POST http://localhost:8000/api/auth/login/ \
     -H "Content-Type: application/json" \
     -d '{"username_or_email":"demo.user@gea.local","password":"P@ssw0rd123!"}'
   ```

   Debe responder con `access_token` y `Set-Cookie`.

2. **Sesión única**:

   - Loguéate en un navegador.
   - Intenta en otro: el primer intento debe mostrar “Ya existe una sesión activa…”.
   - Segundo clic → login forzado → la sesión anterior se cierra.

3. **Restauración tras refresh**:

   - Con la sesión activa, recarga `http://localhost:5173`; la UI debe mantenerse autentificada (gracias a `/auth/session/`).

4. **Logout**:
   - Pulsa “Cerrar sesión” en el dashboard.
   - Verifica en `docker compose logs iam` que el IAM registra el cierre y la cookie se elimine.

---

## 8. Extensiones futuras sugeridas

- **Polling de sesión**: refrescar periódicamente (`setInterval`) llamando `/api/auth/session/` para detectar expiración antes de un request crítico.
- **Permisos/roles en frontend**: extender `useAuth` para incluir scopes y condicionar componentes.
- **Métricas/telemetría**: registrar en logs cuando el usuario inicia/cierra sesión o fuerza el login (útil para auditoría).

---

## 9. Archivos clave y roles

| Archivo                                        | Rol                                                                |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| `src/components/LoginForm.tsx`                 | Formulario reutilizable (RHF + Tailwind). Sólo UI.                 |
| `src/pages/LoginPage.tsx`                      | Contenedor: maneja `loading`, mensajes y el flujo `force=true`.    |
| `src/modules/auth/api.ts`                      | Llamadas HTTP al backend Django (`login`, `logout`, `session`).    |
| `src/modules/auth/context.ts` / `provider.tsx` | Contexto global (`AuthProvider`).                                  |
| `src/modules/auth/useAuth.ts`                  | Hook para consumir el contexto con verificación.                   |
| `src/modules/auth/types.ts`                    | Tipos TypeScript (payloads, estado, respuestas).                   |
| `src/routes/RequireAuth.tsx`                   | Guard que espera `isReady` y redirige a `/login` si no hay sesión. |
| `src/App.tsx`                                  | Rutas principales (`/login`, `/`, fallback).                       |

Mantener cada responsabilidad en su archivo es la práctica recomendada en React; facilita pruebas, refactors y reusabilidad (p. ej., usar `LoginForm` en otra app).

---

## 10. Identidad visual (Tailwind + GEA)

- **Tokens**: definidos en `src/styles/tailwind.css` (`--color-gea-midnight`, `--color-gea-green`, etc.).
- **Fuente**: Montserrat Variable (`@fontsource-variable/montserrat`) como alternativa libre a Futura.
- **Plugins**: `@tailwindcss/forms` para inputs; `prettier-plugin-tailwindcss` para ordenar clases.
- **Logo**: `src/assets/gea-logo.svg` (sustituir por el oficial cuando corresponda).
- **Componentes**: Login, loader de `RequireAuth` y dashboard comparten gradientes y bloques translúcidos coherentes con la marca.

---

## 11. Resumen final

1. **IAM** dicta credenciales, TTL y políticas (sesión única).
2. **Django** proxya las llamadas, maneja cookies `HttpOnly` y transforma errores.
3. **React/Tailwind** presenta la UI: `useAuth` gestiona estado, `LoginPage` maneja el flujo del doble intento y `LoginForm` encapsula la UI accesible.

Con este mapa puedes modificar cualquier capa (agregar MFA, customizar mensajes, introducir nuevos módulos) sin romper el resto. Ajusta el IAM si cambias políticas, edita Django si necesitas nuevos endpoints, y extiende la UI con Tailwind manteniendo la identidad GEA.
