# Stafflink Backend – Guía por Vista (API v1)

Este documento mapea cada vista del flujo ONE-PASS contra los archivos del backend, describe qué hace cada capa y qué pasos seguir si necesitas extender o modificar el comportamiento.

## Vista 1 – Generar Links / Campañas

| Componente | Ubicación | Descripción |
|------------|-----------|-------------|
| Modelos | `backend/api/v1/recruitment/models.py` (`Campaign`, `RecruitmentLink`) | Definen campañas, links/QR, modalidad, cuotas, expiración, etc. |
| Serializadores | `serializers/campaign_serializer.py`, `serializers/link_serializer.py` | Validan entrada/salida (respectivamente list/detail/update). |
| Servicios | `services/campaign_service.py`, `services/link_service.py` | Contienen la lógica de negocio: generar slug, auditoría, expirar/anular, etc. |
| Vistas | `views/campaign_viewset.py`, `views/link_viewset.py` | Exponen `/api/v1/campaigns/` y `/api/v1/links/…` con permisos IAM. |
| Rutas | `backend/api/v1/recruitment/urls.py` | Registro en el router DRF. |

**Agregar/editar campos en links**
1. Edita el modelo `RecruitmentLink` (agrega atributo, choices, etc.).
2. Corre `python manage.py makemigrations recruitment` y revisa el archivo generado en `migrations/`.
3. Actualiza los serializadores (input/output), servicios y vistas si el nuevo campo se usa en lógica.
4. Corre `python manage.py migrate`.

## Vista 2 – Formulario Público ONE-PASS

| Componente | Ubicación | Descripción |
|------------|-----------|-------------|
| Modelos | `Applicant`, `ApplicantDocument` | Guardan datos personales y adjuntos (DNI/CE). |
| Validadores | `validators/document_validator.py`, `validators/file_validator.py` | Reglas de formato (DNI 8 dígitos, CE 9-12, extensiones permitidas, tamaño máx.). |
| Servicio | `services/applicant_service.py` | Crea/edita postulantes, sube archivos (usa `storage.py`), valida LPDP y documentos requeridos. |
| Vistas públicas | `views/public_views.py` | Endpoints `/api/v1/public/*` para consultar link, crear borrador, subir archivos, enviar. |
| Serializadores | `serializers/public_serializers.py` | DTO para borrador, detalle, submit y uploads. |

**Editar el formulario**
- Para agregar un campo nuevo al formulario: añade el campo en `Applicant`, ajusta validadores/serializadores y el front consumirá la nueva estructura desde `/api/v1/public/candidates/{id}`.
- Para forzar nuevos adjuntos, modifica `REQUIRED_DOCUMENTS` en `applicant_service.py`.

## Vista 3 – Verificación Backoffice

| Componente | Ubicación | Descripción |
|------------|-----------|-------------|
| Modelos | `Applicant` (status), `Verification` | Estado de revisión, motivos, flags de riesgo. |
| Servicio | `services/verification_service.py` | Crea/verifica cola, ediciones controladas, decisiones y corrección. |
| Serializadores | `serializers/verification_serializers.py` | `ApplicantQueue`, `ApplicantDetail`, actualizaciones parciales, decisión/corrección. |
| Vista | `views/verification_viewset.py` | Expone `/api/v1/verify/…` con acciones `decision` y `request-correction`. |

**Agregar nuevos checks o flags**
1. Añade campos en `Verification` (por ejemplo `external_score`).
2. Ajusta `ApplicantDetailSerializer` y las vistas para incluir/editar el dato.
3. Si es una regla automática, impléméntala en `verification_service.py` (por ejemplo en `get_queue_queryset` o en `register_decision`).

## Vista 4 – Exportes Smart Boleta

| Componente | Ubicación | Descripción |
|------------|-----------|-------------|
| Modelos | `SmartExportBatch`, `SmartExportBatchItem` | Representan un lote y sus postulantes. |
| Servicio | `services/export_service.py` | Genera el lote (CSV con `SmartFormatter`, `SmartClient`), marca exportados, marca entregados. |
| Serializadores | `serializers/export_serializers.py` | `SmartExportBatchSerializer`, `SmartExportBatchDetailSerializer`, `SmartExportBatchCreateSerializer`. |
| Vista | `views/export_viewset.py` | Endpoints `/api/v1/exports/smart/batches/…` para crear, descargar archivo y marcar creado. |

**Modificar formato del archivo**
- Edita `integrations/smart/formatter.py` o `client.py` para cambiar columnas o formato (CSV/XML).
- Si debes almacenar metadatos extra, añade campos en `SmartExportBatch`/`SmartExportBatchItem` y actualiza los serializadores.

## Capas Compartidas / Infraestructura

- **Permisos IAM:** `permissions.py` contiene `HasIAMPermissions`, `HasAnyIAMPermission` y helpers (`request_has_permission`). Úsalos en viewsets para condicionar acciones.
- **Auditoría:** `api/shared/audit.py` registra cambios en `AuditLog`. Invocado desde los servicios (`link_service`, `applicant_service`, etc.).
- **Storage:** `storage.py` devuelve el cliente configurado (`local` por defecto). Usa `STAFFLINK_STORAGE_*` en `.env` para cambiarlo.
- **OpenAPI:** `drf-spectacular` genera `/api/schema/`, `/api/docs/`, `/api/redoc/`. Configurado en `config/settings.py`.
- **Base de datos:** PostgreSQL 17 (variables `POSTGRES_*`); ejecutar `manage.py migrate` crea todas las tablas `recruitment_*` automáticamente.
- **Índices:** campos que se filtran frecuentemente (FKs, `Applicant.status/submitted_at`) cuentan con `db_index=True` y un índice compuesto (`status`, `-submitted_at`). Si agregas filtrados nuevos, recuerda crear el índice correspondiente en `Meta.indexes` y generar la migración.

## Flujo para Agregar Nuevos Atributos o Vistas

1. **Modelos** – añade o modifica campos en `models.py` y crea migración (`makemigrations`).
2. **Serializadores** – actualiza los campos expuestos en los serializers relevantes.
3. **Servicios** – aplica la lógica de negocio (validaciones, cálculos, auditoría).
4. **Vistas/Rutas** – expón los endpoints en viewsets o APIViews y registra en `urls.py`.
5. **Permisos** – define los permisos IAM necesarios y aplícalos en las vistas.
6. **Documentación y Tests** – reejecuta `manage.py test` y verifica `/api/docs` para confirmar que el esquema refleja los cambios.

## Llenado de Información (Formulario Público)

- El front crea un draft con `POST /api/v1/public/candidates` enviando `link_slug` y datos iniciales.
- El postulante puede actualizar (PATCH) ese registro hasta completar los campos requeridos.
- Los adjuntos obligatorios dependen de `document_type` (ver `REQUIRED_DOCUMENTS`); se suben vía `POST /api/v1/public/uploads` enviando `applicant_id`, `kind` y el archivo.
- Para enviar definitivamente se llama `POST /api/v1/public/candidates/{id}/submit` con `lpdp_consent=true`. Esto bloquea ediciones y crea/actualiza el registro en la cola BO.

Con esta guía puedes ubicar rápidamente dónde modificar cada capa del backend según la vista o entidad involucrada. EOF
