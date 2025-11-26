# Stafflink — Accesos, roles y permisos (IAM GEA)

## Conceptos clave
- **Login** (`POST /api/auth/login`) solo entrega el token; no define permisos.
- **Directory** (/api/v1/directory) es quien decide accesos: apps, roles, permisos y asignaciones.
- **app_id Stafflink**: `6c9d8e5b-5100-4fbd-9c8a-9f8e1de115e5`.
- Roles estándar:
  - `stafflink_admin`: campaigns.read/manage, blacklist.read/manage, links.read/manage/close, candidates.read/manage/process/contract, exports.download.
  - `stafflink_backoffice`: campaigns.read, blacklist.read/manage, links.read, candidates.read/process/contract, exports.download.
  - `stafflink_recruiter`: campaigns.read, links.read/manage/close, candidates.manage.

## Endpoints usados (IAM GEA)
- **Identity**: `POST /auth/login`, `POST /auth/logout`, `POST /auth/introspect`, `GET /auth/session/active`, `GET /auth/sessions`, `DELETE /auth/sessions/{session_id}`.
- **Directory**:
  - Listar roles de la app: `GET /directory/applications/{app_id}/roles`
  - Listar permisos de la app: `GET /directory/applications/{app_id}/permissions`
  - Ver roles/permisos de un usuario: `GET /directory/users/{user_id}/roles`
  - Asignar rol a usuario: `POST /directory/roles/{role_id}/assignments` body `{ "user_id": "<uuid>" }`
  - Asignar permiso a rol: `POST /directory/roles/{role_id}/permissions/{permission_id}`

## Implementación en backend Stafflink
- Autenticación: `api/auth/authentication.py` (clase `IAMCookieAuthentication`).
  - Extrae token de cookie/header, introspecta con IAM.
  - Si no vienen permisos, intenta:
    1) `applications` en el payload;
    2) Fallback a Directory `GET /directory/users/{user_id}/roles` (usa `IAM_SERVICE_TOKEN` si está definido en `.env`, o el mismo token de usuario);
    3) Derivar permisos desde roles conocidos (stafflink_*).
- Config: `backend/.env` admite `IAM_SERVICE_TOKEN` (token administrativo para consultar Directory si el token de usuario no trae permisos).
- `REST_FRAMEWORK.DEFAULT_AUTHENTICATION_CLASSES` apunta a `IAMCookieAuthentication`.

## Uso operativo
1) Asignar roles/permisos en IAM Directory a los usuarios de Stafflink (roles anteriores).
2) Iniciar sesión en Stafflink con `app_id` de Stafflink.
3) Verificar `/api/auth/session/` — debe mostrar `permissions`. Si está vacío, asignar roles o definir `IAM_SERVICE_TOKEN` en backend y reiniciar.

## Comandos curl de referencia
- Ver roles/permisos de usuario:
```bash
TOKEN="<token_stafflink>"
USER_ID="<uuid_usuario>"
curl -s http://172.28.1.24:58000/api/v1/directory/users/$USER_ID/roles \
  -H "Authorization: Bearer $TOKEN" | jq
```
- Asignar rol a usuario:
```bash
TOKEN_ADMIN="<token_admin_directory>"
ROLE_ID="<uuid_role>"
USER_ID="<uuid_user>"
curl -s -X POST http://172.28.1.24:58000/api/v1/directory/roles/$ROLE_ID/assignments \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H 'Content-Type: application/json' \
  -d '{"user_id": "'$USER_ID'"}'
```
- Asignar permiso a rol:
```bash
curl -X POST http://172.28.1.24:58000/api/v1/directory/roles/$ROLE_ID/permissions/$PERM_ID \
  -H "Authorization: Bearer $TOKEN_ADMIN"
```

## Diagnóstico rápido 403
- Si `/api/auth/session/` no trae `permissions` → revisar roles en Directory o definir `IAM_SERVICE_TOKEN`.
- Confirmar login con `app_id` Stafflink.
- Roles/permissions correctos en Directory resuelven el 403 en `/api/v1/campaigns`, `/links`, `/blacklist`, `/candidates`.
