# Serena Knowledge Base

## Proyecto: Stafflink
- Ruta: `/home/lavodnos/code/stafflink`
- Módulos principales: `backend/` (Django + DRF) y `frontend/` (React + Vite TypeScript).

### Backend
- Framework: Django 5.2.8 con Django REST Framework y django-cors-headers.
- Virtualenv local: `backend/venv/` (activar con `source backend/venv/bin/activate`).
- Proyecto Django: `backend/config/` contiene `settings.py`, `urls.py`, `wsgi.py`, `asgi.py`.
- App inicial: `backend/api/` con `models.py`, `views.py`, `tests.py`, `migrations/`.
- Gestión: ejecutar comandos desde `backend/manage.py` (ej. `python manage.py runserver`).

### Frontend
- Framework: React con Vite (TypeScript + SWC).
- Directorio raíz: `frontend/` con configuraciones (`package.json`, `vite.config.ts`, `tsconfig*.json`).
- Código fuente: `frontend/src/` (`main.tsx`, `App.tsx`, estilos en `App.css`, `index.css`).
- Assets públicos: `frontend/public/`.
- Ejecutar dev server: `npm run dev` dentro de `frontend/`.

### Integración Planeada
- Stafflink usará las APIs de IAM para autenticación y control de acceso.
- Próximo entregable: implementar flujo de login en frontend y backend reutilizando endpoints IAM.

### Notas
- Mantener line endings UNIX para scripts ejecutados en contenedores.
- Documentar nuevos comandos o configuraciones aquí para mantener sincronizado el conocimiento del equipo.

## Plan de Autenticación (Nov 6, 2025)
- **Configuración común**: definir `IAM_BASE_URL`, `IAM_APP_ID`, `IAM_CAPTCHA_REQUIRED` en archivos `.env.example` (backend/frontend) y habilitar CORS para Vite (`http://localhost:5173`) y perimeter.
- **Backend (Django/DRF)**: crear módulo `api/auth/` con cliente IAM (`httpx`), serializers y vistas `/api/auth/login/`, `/api/auth/logout/`, `/api/auth/session/`; emitir JWT como cookie HttpOnly o encabezado seguro; añadir middleware para introspección (`/auth/introspect`) y pruebas con mocks.
- **Frontend (React TS)**: crear `src/modules/auth/` con servicio `authApi`, hook/contexto `useAuth`, página `LoginPage`, guardas de ruta y manejo de errores (`SESSION_ALREADY_ACTIVE`, `PASSWORD_EXPIRED`, etc.); configurar proxy Vite para `/api`.
- **Sesión y seguridad**: preferir cookies HttpOnly + token CSRF o almacenamiento en memoria; refrescar sesión periódicamente desde backend usando introspect y manejar expiraciones/force logout.
- **Pruebas**: backend con APITestCase/pytest (mocks a IAM); frontend con Vitest para formulario y hook; prueba manual end-to-end contra IAM (`docker compose up -d`).
- **Posterior al login**: construir módulos core (campañas, postulantes, exportaciones) usando scopes/roles devueltos por IAM para la autorización en Stafflink.

## Implementación Login (Nov 6, 2025)
- Backend expone `POST /api/auth/login/` (`api/auth/views.py`) que delega en IAM con `httpx`, propaga errores y setea cookie `stafflink_access_token` (configurable en env).
- Configuración basada en `.env` usando `python-dotenv`; variables documentadas en `backend/.env.example`.
- Tests de backend (`api/tests/test_login.py`) validan cookie y manejo de respuesta 401 (mock IAM).
- Frontend añade `AuthProvider`, `useAuth` y `LoginForm`; router protege `/` y muestra `LoginPage`.
- `npm run lint` y `npm run build` verificados, `vite.config.ts` proxea `/api` → `http://localhost:8000`.
- Para desarrollo: `cd backend && source venv/bin/activate && python manage.py runserver`, `cd frontend && npm run dev`.
