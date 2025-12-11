## IAM GEA – Estado y credenciales de prueba (2025-12-10)

- App IAM GEA creada por seed `scripts/seed_iam_gea_app.py`
  - APP_ID: `f4e3d8b5-2e7d-4f8a-9f5c-1a0d0a0a5b11`
  - captcha_required=False
  - Roles: iam_gea_admin, iam_gea_operator, iam_gea_viewer, iam_gea_tokens
  - Permisos: identity.manage, directory.read/manage, audit.read/export, tokens.issue, apps.read/manage, roles.read/manage, users.read/manage
- Usuario seed
  - admin@gea.local
  - password: `Adm1nIAM2025`
  - Asignado a todos los roles (incl. IAM GEA)
- Service client (generado 2025-12-10)
  - client_id: iam-gea-frontend
  - client_secret: `Rud3aVsjYlrzwP-ev8mamAljhoPeaKVfPJdTp3sc5Pk`
  - scope: `directory.read audit.read`
  - Guardar en vault; no subir a git.

## Variables de entorno relevantes

- CORS_ALLOWED_ORIGINS: `http://localhost:3000,http://localhost:3001,http://localhost:5173`
  - Agregar aquí cada origen frontend que necesite acceder a IAM (dev/QA/prod), separando por comas.
- IAM_ADMIN_PASSWORD: `Adm1nIAM2025` (en .env del IAM)
- Frontend (FIAM/IAM GEA) `.env` (ejemplo):
  - VITE_API_BASE_URL=http://localhost:58080/api/v1
  - VITE_IAM_APP_ID=f4e3d8b5-2e7d-4f8a-9f5c-1a0d0a0a5b11

## Cómo levantar y probar

1) Levantar IAM + perimeter:
   - `docker compose up -d iam perimeter`

2) Seeds (si BD vacía):
   - `docker compose run --rm iam python scripts/seed_iam_gea_app.py`
   - Con service client: agregar `CREATE_SERVICE_CLIENT=true SERVICE_CLIENT_ID=... SERVICE_CLIENT_SCOPE="directory.read audit.read"`
   - Usuario seed si no existe: `SEED_USER_EMAIL=admin@gea.local SEED_USER_PASSWORD='Adm1nIAM2025'`

3) Frontend:
   - `.env` con VITE_API_BASE_URL y VITE_IAM_APP_ID
   - `npm install && npm run dev` (puerto 5173 por defecto)

4) Login de prueba:
   - user: admin@gea.local
   - pass: Adm1nIAM2025
   - app_id: f4e3d8b5-2e7d-4f8a-9f5c-1a0d0a0a5b11

## Notas

- Si aparece CAPTCHA_REQUIRED, revisar lockout/attempts y limpiar `login_attempt` o failed_attempts; pero con la clave correcta ya no debe ocurrir.
- Si se añaden nuevos frontends/hosts, agregar sus URLs a CORS_ALLOWED_ORIGINS (coma-separado, sin espacios).