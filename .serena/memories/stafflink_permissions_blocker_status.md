Estado tras corrección (26-Nov-2025) — actualización sin fallback estático:
- Se eliminó el mapa estático de permisos por rol (`role_perm_map`) y el fallback `_derive_permissions_from_roles`. Ahora `/api/auth/session/` sólo usa: introspección → Directory; si Directory falla, devuelve 503/errores y log. No se inventan permisos.
- `_fetch_directory_permissions` ahora puede `raise` en errores (503/401) y registra fallos; `SessionView` responde con el error y `IAMCookieAuthentication` propaga para que DRF devuelva el status de IAM.
- `get_service_token` sigue usando `force=True` y cache+retry; si falla, log y usa token de usuario.
- Prueba rápida: llamando a `_introspect_and_respond` con login force a Stafflink devuelve `permissions` reales desde Directory.
- Pendiente: 12 migraciones auth siguen sin correrse; `manage.py migrate` falla por DB ausente en localhost:2424 (POSTGRES_* en backend/.env). Levantar PostgreSQL 17 en ese puerto y reintentar.

Siguiente pasos sugeridos:
1) Levantar Postgres en 2424 y correr `cd backend && venv/bin/python manage.py migrate`.
2) Reiniciar backend y validar `/api/auth/session/` desde frontend o curl.
3) Si se ve 401/503 contra Directory, revisar credenciales/roles (`directory:read` en cuenta de servicio) y logs agregados en auth.