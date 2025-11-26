Estado al pausar (24-Nov-2025):
- Backend Stafflink funciona, pero /api/auth/session/ no trae `permissions`; frontend muestra "No tienes permiso" en campañas/blacklist/links/candidates.
- Motivo: el backend llama a IAM Directory `/api/v1/directory/users/{user_id}/roles` y necesita un Bearer con `directory:manage`. Falta `IAM_SERVICE_TOKEN` en .env.
- Para obtener `IAM_SERVICE_TOKEN`: login contra app IAM Control Center (app_id=ed9ca85c-8247-4043-9fd2-d1c47497f461) con un usuario que tenga `directory:manage` (p.ej. admin@gea.local). Curl:
  curl -s -X POST http://172.28.1.24:58000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username_or_email":"admin@gea.local","password":"<clave>","app_id":"ed9ca85c-8247-4043-9fd2-d1c47497f461"}'
- Colocar el access_token en backend/.env como IAM_SERVICE_TOKEN, reiniciar backend, logout/login en Stafflink; /api/auth/session/ debe incluir permissions.
- Migraciones pendientes: ejecutar `python manage.py migrate` (auth) para limpiar warnings.
- Roles/perms en IAM están correctos: stafflink_admin/backoffice/recruiter asignados al usuario admin@gea.local con todos los permisos Stafflink. IAM_BASE_URL=http://172.28.1.24:58000/api/v1, IAM_APP_ID=6c9d8e5b-5100-4fbd-9c8a-9f8e1de115e5.
- Archivos frontend ya gatean vistas por permisos; al faltar permissions se bloquea todo.