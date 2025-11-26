# Progreso frontend Stafflink (nov 2025)

## Vistas implementadas
- Dashboard (hub): accesos a Campañas, Blacklist, Links, Candidatos.
- Público `/apply/:slug`: landing y formulario completo de candidato; consume `/v1/recruitment/public/links/:slug` y `POST /public/candidates`; normaliza campos clave a mayúsculas.
- Campañas: `src/pages/CampaignsPage.tsx` + API `modules/campaigns/api.ts`; lista y crear/editar campañas.
- Blacklist: `src/pages/BlacklistPage.tsx` + API `modules/blacklist/api.ts`; CRUD y cambio de estado.
- Links: `src/pages/LinksPage.tsx` + API `modules/links/api.ts`; lista, crear/editar, acciones expire/revoke/activate; muestra URL pública.

## Rutas
- Protegidas: `/`, `/campaigns`, `/blacklist`, `/links` (RequireAuth).
- Pública: `/apply/:slug`.

## Identidad visual
- Tokens Tailwind en `src/styles/tailwind.css` (colores GEA, font sans incluye Futura Std fallback). Componentes base: btn-primary (gradiente verde), btn-secondary (borde azul), cards, inputs, pills.

## Variables de entorno
- Backend `.env`: `IAM_APP_ID=6c9d8e5b-5100-4fbd-9c8a-9f8e1de115e5`, `IAM_BASE_URL=http://172.28.1.24:58000/api/v1`, DB local 2424, CORS localhost:5173.
- Frontend `.env`: `VITE_API_BASE_URL=http://localhost:8000/api`, `VITE_IAM_APP_ID=6c9d8e5b-5100-4fbd-9c8a-9f8e1de115e5`.

## IAM
- App Stafflink (id `6c9d8e5b-5100-4fbd-9c8a-9f8e1de115e5`) con permisos simplificados (`campaigns.*`, `blacklist.*`, `links.*`, `candidates.*`, `exports.download`). Roles: stafflink_admin/backoffice/recruiter. Usuario admin@gea.local tiene esos roles en `user_role`.
- Script seed: `IAM-GEA-API/scripts/ensure_stafflink_app.py` crea app, permisos, roles, asigna roles al usuario semilla.

## Pendientes
- Vistas de Candidatos (lista + tabs Datos/Documentos/Proceso/Contrato) y guardas por permiso fino en frontend.
- Fix build local: rollup faltante; resolver con `rm -rf node_modules && npm install && npm run build`.
