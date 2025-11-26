# IAM GEA – Endpoints y uso práctico

## Qué gestiona IAM
- **Identity (/auth)**: login/logout, introspect, sesiones activas. Devuelve el token pero **no decide accesos de apps**.
- **Directory (/directory)**: aplicaciones, roles, permisos y asignaciones usuario↔rol↔permiso. Aquí se definen los accesos reales.
- **Audit (/audit)**: consulta de eventos (login, sesiones, etc.).

## Flujo mínimo para Stafflink
1) Login (`POST /api/v1/auth/login`) con `app_id = 6c9d8e5b-5100-4fbd-9c8a-9f8e1de115e5` → obtienes `access_token`.
2) Ver roles/permisos efectivos del usuario:
   ```bash
   curl -H "Authorization: Bearer <token>" \
     http://172.28.1.24:58000/api/v1/directory/users/<user_id>/roles
   ```
   Debe listar la app de Stafflink con roles (`stafflink_admin/backoffice/recruiter`) y permisos (`campaigns.manage`, etc.).
3) Si faltan, asignar roles y permisos usando un token administrativo:
   - Listar roles: `GET /api/v1/directory/applications/{app_id}/roles`
   - Listar permisos: `GET /api/v1/directory/applications/{app_id}/permissions`
   - Asignar rol a usuario: `POST /api/v1/directory/roles/{role_id}/assignments` con body `{ "user_id": "<uuid>" }`
   - Asignar permiso a rol: `POST /api/v1/directory/roles/{role_id}/permissions/{permission_id}`
4) Cerrar sesión y volver a login; `/api/auth/session/` debe mostrar `permissions`. Si no aparecen, Stafflink devuelve 403.

## Endpoints clave (base URL: http://172.28.1.24:58000/api/v1)
- **Identity**: `POST /auth/login`, `POST /auth/logout`, `POST /auth/introspect`, `GET /auth/session/active`, `GET /auth/sessions`, `DELETE /auth/sessions/{session_id}`.
- **Directory**:
  - Apps: `GET/POST /directory/applications`, `PATCH /directory/applications/{app_id}`.
  - Roles: `GET/POST /directory/applications/{app_id}/roles`, `PATCH /directory/roles/{role_id}`, `DELETE /directory/roles/{role_id}`.
  - Permisos: `GET/POST /directory/applications/{app_id}/permissions`, `PATCH /directory/permissions/{permission_id}`, `DELETE /directory/permissions/{permission_id}`.
  - Asignaciones: `POST /directory/roles/{role_id}/assignments`, `DELETE /directory/roles/{role_id}/assignments/{user_id}`, `POST /directory/roles/{role_id}/permissions/{permission_id}`, `DELETE /directory/roles/{role_id}/permissions/{permission_id}`.
  - Consultar usuario: `GET /directory/users/{user_id}`, `PATCH /directory/users/{user_id}`, `GET /directory/users/{user_id}/roles`.
- **Audit**: `GET /audit/events`, `GET /audit/stats`.

## Diagnóstico rápido de 403 en Stafflink
- Revisar `/api/auth/session/` → si no trae `permissions`, es problema de roles/permisos en Directory.
- Ver roles del usuario: `GET /directory/users/{user_id}/roles`.
- Asegurar asignación del rol Stafflink correcto y que el login se hace con el app_id de Stafflink.
