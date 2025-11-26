# Notas de permisos UI + pruebas recientes (nov 2025)

## Cambios aplicados en frontend
- Se añadió soporte de permisos normalizados en Auth:
  - `AuthState` ahora expone `permissions` y `hasPermission(required, mode)`.
  - Se consulta `/auth/session/` tras login/restauración para poblar permisos.
- Hooks de permisos:
  - `usePermission(required, mode)` devuelve boolean.
  - Componente `RequirePermission` para envolver UI sensible.
- Gates por pantalla:
  - `CampaignsPage`: requiere `campaigns.read` para listar y `campaigns.manage` para crear/editar (form deshabilitado si no hay permiso).
  - `BlacklistPage`: `blacklist.read` para listar, `blacklist.manage` para crear/editar/borrar.
  - `LinksPage`: `links.read` para listar, `links.manage` para crear/editar, `links.close` para expirar/revocar/activar; `campaigns.read` para cargar campañas.
  - `CandidatesPage`: `candidates.read` para listar/detalle; `candidates.manage` para ficha datos; `candidates.process` para checklist/proceso; `candidates.contract` para contrato. Formularios deshabilitan inputs/botones sin permiso y muestran aviso.
- Hooks de datos (`useCampaigns`, `useBlacklist`, `useLinks`, `useCandidates`) aceptan `enabled` para no llamar API si no hay permiso.

## Pruebas ejecutadas tras cambios
- Frontend: `npm run lint` y `npm run build` (ok). `npm audit fix` aplicado, 0 vulnerabilidades.
- Backend (previo, sin cambios nuevos): `manage.py check` y `python -m compileall` ok.

## Config relevante
- `frontend/.env`: `VITE_API_BASE_URL=http://localhost:8000/api`, `VITE_IAM_APP_ID=6c9d8e5b-5100-4fbd-9c8a-9f8e1de115e5`.
- Backend `.env`: `IAM_BASE_URL=http://172.28.1.24:58000/api/v1`, `IAM_APP_ID=6c9d8e5b-5100-4fbd-9c8a-9f8e1de115e5`, opcional `IAM_SERVICE_TOKEN` para fallback de permisos en Directory.

## Pendientes posibles
- Aplicar RequirePermission en rutas/menú de navegación para UX consistente.
- Tests E2E con usuario de cada rol (admin/backoffice/recruiter) para validar visibilidad y bloqueos.
