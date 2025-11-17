# Stafflink – Handoff Backend → Frontend (API v1)

Este documento explica cómo consumir el backend ONE-PASS desde el frontend React (arquitectura feature-sliced descrita en SERENA) y qué pasos seguir para extenderlo. Se basa en la arquitectura aprobada: Django/DRF como BFF versionado (`/api/v1/…`) + React/Vite organizado por módulos (`modules/auth`, `modules/recruitment`).

## 1. Arquitectura en Contexto

| Capa | Descripción | Archivos clave |
|------|-------------|----------------|
| Backend (BFF) | Django/DRF con app `api.v1.recruitment` expone las vistas ONE-PASS y Swagger/Redoc (`/api/docs`, `/api/redoc`). IAM maneja la autenticación/roles; Stafflink solo proxya. | `backend/api/v1/recruitment/*`, `backend/config/urls.py`, `docs/BACKEND_VIEWS_GUIDE.md` |
| Frontend | React 19 + Vite + Tailwind. Feature modules (`modules/auth`, `modules/recruitment`). El login consume `/api/auth/login/` y guarda cookies HttpOnly. Cada submódulo usa hooks/contexts. | `frontend/src/modules/auth/*`, `frontend/src/modules/recruitment/*` (próximo trabajo) |
| Permisos | IAM entrega las claims/roles. El backend exige headers `X-Stafflink-Permissions`, `X-Stafflink-User-Id` en rutas privadas. El frontend debe incluirlos (al menos durante pruebas con mocks) o trabajar con la cookie oficial cuando se integre con IAM real. | `backend/api/v1/recruitment/permissions.py`, `docs/permissions_strategy.md` |

## 2. Endpoints → Módulos Frontend

| Backend vista | Endpoint principal | Módulo Frontend sugerido | Componente/Página |
|---------------|--------------------|--------------------------|-------------------|
| Campañas/Links | `/api/v1/campaigns/`, `/api/v1/links/…` | `modules/recruitment/link` | `LinkListPage`, `LinkGeneratorPage` |
| Formulario público | `/api/v1/public/links/{slug}/`, `/api/v1/public/candidates`, `/api/v1/public/uploads`, `/api/v1/public/candidates/{id}/submit` | `modules/recruitment/applicant` | `ApplicantFormPage` (multi-step) |
| Verificación BO | `/api/v1/verify/…` (`list`, `retrieve`, `PATCH`, `decision`, `request-correction`) | `modules/recruitment/verification` | `VerificationQueuePage`, `VerificationDetailPage` |
| Exportes Smart | `/api/v1/exports/smart/batches`, `/file`, `/mark-created` | `modules/recruitment/export` | `ExportPage`, `ExportHistoryPage` |

## 3. Contratos principales

Resumen de los payloads más usados (ver `/api/docs` para el detalle completo):

- **Link** (`RecruitmentLinkSerializer`)
  ```json
  {
    "id": "uuid",
    "campaign": "uuid",
    "slug": "comercial-x-2025",
    "title": "Comercial X",
    "status": "active",
    "modality": "onsite",
    "employment_condition": "payroll",
    "period_start": "2025-11-01",
    "expires_at": "2025-12-01T23:59:00Z"
  }
  ```
  - Acciones: `POST /links/{id}/expire`, `POST /links/{id}/revoke` (exigen permisos). El frontend debe enviar la cookie IAM y/o header `X-Stafflink-Permissions` para simular roles.

- **Formulario Público**
  - Crear borrador: `POST /api/v1/public/candidates` con `{ link_slug, first_name, … }`. Devuelve `id`.  
  - Subir archivo: `POST /api/v1/public/uploads` con `multipart/form-data` (`applicant_id`, `kind`, `file`).  
  - Enviar: `POST /api/v1/public/candidates/{id}/submit` con `{ "lpdp_consent": true }`. Requiere que existan DNI frente/reverso.

- **Verificación**
  - Cola: `GET /api/v1/verify/` devuelve `[{ id, document_number, submitted_at, status, campaign, link_title }]`.  
  - Detalle: `GET /api/v1/verify/{id}/` retorna los campos y documentos.  
  - Edición controlada: `PATCH /api/v1/verify/{id}/` con subset de campos (`phone`, `alternate_phone`, etc.).  
  - Decisión: `POST /api/v1/verify/{id}/decision` con `{ "status": "approved|observed|rejected", "reason": "…" }`.

- **Exportes**
  - Crear lote: `POST /api/v1/exports/smart/batches` con `{ "applicant_ids": [], "notes": "Semana 1" }`. Cambia `status` de cada postulante a `exported`.  
  - Descargar CSV: `GET /api/v1/exports/smart/batches/{id}/file`.  
  - Marcar entregado: `POST /api/v1/exports/smart/batches/{id}/mark-created`.

## 4. Cómo enganchar el Frontend

1. **Configurar `frontend/src/config.ts`** con `API_BASE_URL = http://localhost:8000` (ajusta según env).  
2. **AuthProvider**: ya maneja `/api/auth/login|logout|session`. Para entornos sin IAM, puedes enviar headers manuales en el `apiFetch` (p.ej. `X-Stafflink-Permissions`). Una vez IAM esté integrado, la cookie HttpOnly será suficiente.
3. **Crear módulos por vista** (según `docs/BACKEND_VIEWS_GUIDE.md`):
   - `modules/recruitment/link/api.ts`: wrappers `listLinks`, `createLink`, `expireLink`.  
   - `modules/recruitment/applicant/api.ts`: `getLink`, `createDraft`, `uploadFile`, `submit`.  
   - `modules/recruitment/verification/api.ts`: `getQueue`, `getApplicant`, `patchApplicant`, `decision`, `requestCorrection`.  
   - `modules/recruitment/export/api.ts`: `createBatch`, `listBatches`, `downloadFile`, `markCreated`.
4. **Estados globales**: usa React Query o hooks contextuales por módulo; no mezclar con `AuthProvider` salvo para signout.
5. **Permisos en UI**: reusa `lastError` del AuthProvider y el claim de permisos para habilitar/ocultar botones (p.ej. `links.expire`, `verification.decide`).

## 5. Flujo de despliegue y prueba

1. **Backend**: `pip install -r requirements.txt`, `python manage.py migrate`, `python manage.py runserver 0.0.0.0:8000`.  
2. **Swagger/Redoc**: revisar `/api/docs` y `/api/redoc` para tener la referencia actual.  
3. **Frontend**: `npm install`, `npm run dev` (localhost:5173).  
4. **Pruebas manuales**: 
   - Autenticarse en `/login`.  
   - Consumir `/api/v1/…` desde el UI.  
   - En caso de errores de permisos durante QA, agregar headers manuales (ej. `X-Stafflink-Permissions: links.read_all,links.expire`).
5. **Automatización**: usar los tests del backend como referencia al implementar los equivalentes en el frontend (por ejemplo, mockear `createDraft` siguiendo `test_public_flows.py`).

## 6. Extensiones futuras

- **MFA / Sesiones**: Backend soporta `force=true` en login para tomar control de sesiones duplicadas. El frontend debe exponer este flujo (primer click muestra mensaje, segundo click `force=true`).
- **Nuevos módulos (Documentos, Remuneración)**: seguir el patrón `api/v1/<nuevo>` y crear el módulo de frontend equivalente (`modules/recruitment/<nuevo>`). Recuerda registrar la app en IAM y documentarlo en `SERENA.md`.

Con esta guía tienes el mapa exacto para integrar el backend actual en los módulos del frontend y una ruta clara para añadir nuevas vistas sin perder el orden arquitectónico original. EOF
