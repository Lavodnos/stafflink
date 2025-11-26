# Corrección permisos IAM en Stafflink (26-Nov-2025)

## Problema
- `/api/auth/session/` no devolvía `permissions` porque dependía de introspección sin consultar Directory y tenía un fallback estático `role_perm_map`.

## Cambios aplicados
1) **Eliminar fallback estático**
   - Removido `role_perm_map` y `_derive_permissions_from_roles` en `backend/api/auth/authentication.py`.
   - `_normalize_permissions` en `views.py` ya no deriva por roles; si no hay permisos de IAM/Directory, devuelve error.

2) **Solo IAM/Directory como fuente de verdad**
   - Flujo: introspección → `_fetch_directory_permissions` (Directory con token de servicio y retry 401). Si falla, responde 503/401 con logs; no se inventan permisos.
   - `_extract_app_permissions` ahora agrega permisos que vienen dentro de cada rol de Directory (permissions por rol), además de `permissions`/`perms` planos.

3) **Proveedor de token de servicio**
   - `get_service_token` usa `force=True`, cache y logging; si falla, retorna `None` y se usa token de usuario.

## Validación
- Config `.env`: `IAM_BASE_URL=http://172.28.1.24:58000/api/v1`, `IAM_APP_ID=6c9d8e5b-5100-4fbd-9c8a-9f8e1de115e5`, `IAM_CONTROL_APP_ID=ed9ca85c-8247-4043-9fd2-d1c47497f461`, `IAM_SERVICE_USER=admin@gea.local`.
- Service token decodificado: `aud=iam.gea.apps`, `app_id=ed9ca85c-8247-4043-9fd2-d1c47497f461`, `exp=1764130453`.
- Llamada real: `GET /directory/users/4b1d2374-5ad5-4b05-b6cf-a39b3f5450b2/roles` con token de servicio → 200, aplicaciones `[IAM Control Center, Stafflink]`, Stafflink con 3 roles y 12 permisos (`blacklist.manage/read`, `campaigns.manage/read`, `candidates.*`, `exports.download`, `links.*`).
- `_fetch_directory_permissions` ahora devuelve 12 permisos reales; `_introspect_and_respond` incluye `permissions` sin usar mapas estáticos.

## Pendiente
- `manage.py migrate` sigue pendiente (Postgres no levantado en `localhost:2424`). Levantar Postgres 17 y correr `cd backend && venv/bin/python manage.py migrate`; reiniciar backend y volver a probar `/api/auth/session/`.

## Archivos tocados
- `backend/api/auth/authentication.py`: eliminar mapa estático, usar Directory + rol->permissions desde IAM.
- `backend/api/auth/views.py`: SessionView usa Directory y responde 503/401 si falla.
- `backend/api/auth/service_token.py`: `force=True` y logging en token de servicio.
