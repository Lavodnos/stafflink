# Backend Models Reference — Recruitment Module

Este documento resume cómo está organizado `backend/api/v1/recruitment/models.py` y cómo se conecta con el resto del backend. Sirve como guía para mantener la arquitectura cuando se agreguen campos o entidades nuevas.

## 1. Contexto general

- **Ubicación del módulo:** `backend/api/v1/recruitment/`.
- **Rol:** representa el dominio ONE-PASS (campañas, links, postulantes, verificación BO y exportaciones Smart).
- **Capas relacionadas:**  
  - `serializers/` valida/parcea datos HTTP antes de tocar los modelos.  
  - `services/` contiene la lógica de negocio por vista (link/applicant/verification/export).  
  - `validators/` encapsula validaciones especializadas que se reutilizan en serializers y servicios.  
  - `signals.py` registra auditoría (`AuditLog`) cada vez que ciertos modelos cambian.  
  - `storage.py` y `integrations/storage/*` se encargan de guardar archivos referenciados por `ApplicantDocument`.  
  - `tests/test_v1/recruitment/` cubren reglas clave (deduplicación, validaciones, servicios).

## 2. Patrones compartidos

| Elemento | Descripción |
| --- | --- |
| `TimeStampedModel` | Clase base con `created_at`/`updated_at` (`default=timezone.now` y `auto_now=True`). Todos los modelos heredan de ella para tener timestamps consistentes. |
| `_empty_dict()` | Callable usado como `default` en `JSONField` para evitar referencias a un mismo dict mutable. |
| `TextChoices` | Catálogos inmutables para estados/modos (ej. `RecruitmentLink.LinkStatus`). Garantizan datos válidos y etiquetas amigables. |
| `db_index=True` + `Meta.indexes` | Se agregan en campos filtrados frecuentemente (`status`, `expires_at`, `submitted_at`) para optimizar queries BO. |
| `UUIDField` como PK | Hace que cada entidad sea segura para exponer en URLs públicas (`/api/v1/links/{uuid}`) sin depender de IDs secuenciales. |

## 3. Modelos y responsabilidades

### 3.1 Campaign
- **Ruta:** `backend/api/v1/recruitment/models.py`.
- **Campos clave:** `code` único, `site_name`, `description`, `is_active`.
- **Relaciones:** `RecruitmentLink.campaign` (`PROTECT`).
- **Uso:** `campaign_service.py` y `campaign_serializer.py` listan campañas para Vista 1.

### 3.2 RecruitmentLink
- **Enums:** `LinkStatus`, `Modality`, `EmploymentCondition`, `Weekday`.
- **Campos destacados:** `slug` (identificador público), `owner_id`/`owner_name`, periodo laboral, `expires_at`, `quota`.
- **Integridad:** índice `["status", "expires_at"]`, `db_index=True` en `campaign`.
- **Uso:**  
  - `link_serializer.py` y `LinkViewSet` exponen CRUD/acciones (`expire`, `revoke`).  
  - `link_service.py` centraliza creación/actualización, calcula expiraciones, invoca `AuditLog`.  
  - `public_serializers.py` usa `slug` para compartir links públicos.

### 3.3 Applicant
- **Enums:** `DocumentType`, `Status`.
- **Relaciones:** `ForeignKey` a `RecruitmentLink`; `OneToOne` con `Verification`; `ManyToMany` con `SmartExportBatch` vía `SmartExportBatchItem`.
- **Integridad:**  
  - Índice compuesto `["status", "-submitted_at"]` para colas BO.  
  - `UniqueConstraint` sobre (`document_type`, `document_number`, `link`) evita duplicados en el mismo link.  
  - `save()` normaliza nombres y documento en mayúsculas para búsquedas consistentes.
- **Uso:**  
  - `public_serializers.py` valida formularios ONE-PASS y `ApplicantService` guarda metadata/IP/agentes.  
  - `verification_service.py` consulta estados y actualiza `last_reviewed_at`.  
  - `export_service.py` filtra `Status.VERIFIED_OK` para construir lotes.

### 3.4 ApplicantDocument
- **Enums:** `DocumentKind` (DNI frente/reverso, CE, otros).
- **Campos:** referencia al archivo (`file_path`, `checksum`, `size_bytes`, `content_type`).
- **Uso:**  
  - `storage.py` decide backend (local vs S3).  
  - `validators/file_validator.py` controla extensión y peso antes de crear registros.  
  - `VerificationViewSet` recupera documentos con `ApplicantDetailSerializer`.

### 3.5 Verification
- **Relación:** `OneToOneField` con `Applicant`.
- **Campos:** `status`, `reviewed_by`, `decision_reason`, `risk_flags` (`JSONField` con resultados automáticos), timestamps de decisiones/correcciones.
- **Uso:** `verification_service.py` y `verification_viewset.py` administran decisiones BO, escriben en `AuditLog`.

### 3.6 SmartExportBatch & SmartExportBatchItem
- **SmartExportBatch:** lote generado para Smart Boleta. Incluye `batch_code`, `status`, archivo generado y metadata (`generated_by`, `file_checksum`).
- **SmartExportBatchItem:** tabla intermedia `ManyToMany` con `status` por postulante (cola/exportado/fallido).
- **Uso:** `export_service.py` crea lotes (`ExportViewSet`), usa `integrations/smart/formatter.py` para archivos.

### 3.7 AuditLog
- **Rol:** guardar acciones cruzadas (RQ-X.1) con `entity_type`, `entity_id`, `action`, `actor`, `payload`.
- **Índices:** sobre (`entity_type`, `entity_id`) y `actor_id` para consultas rápidas en BO.
- **Uso:** `shared/audit.py` + `signals.py` generan registros automáticamente desde los servicios.

## 4. Mapa de relaciones

- `Campaign 1─∞ RecruitmentLink`
- `RecruitmentLink 1─∞ Applicant`
- `Applicant 1─∞ ApplicantDocument`
- `Applicant 1─1 Verification`
- `SmartExportBatch ∞─∞ Applicant` (a través de `SmartExportBatchItem`)
- `AuditLog` apunta lógicamente a cualquiera mediante `entity_type` + `entity_id`

Este grafo está documentado en las vistas dentro de `docs/BACKEND_VIEWS_GUIDE.md` y se refleja en los endpoints `/api/v1/...`.

## 5. Interacción con otras capas

| Capa | Ficheros clave | Relación con modelos |
| --- | --- | --- |
| Serializers | `serializers/*.py` | Convierten payload HTTP a instancias de modelo; reutilizan enums (`choices`) y constraints para mensajes claros. |
| Services | `services/*.py` | Orquestan operaciones: invocan `full_clean()`, manejan transacciones, llaman a adapters (storage, smart). Nunca duplican reglas de integridad que ya viven en los modelos. |
| Validators | `validators/*.py` | Reglas reutilizables (DNI/CE, archivos, duplicados) que complementan constraints de BD. |
| Views | `views/*.py` | Son delgadas: resuelven permisos y delegan en servicios; serializan usando DRF. |
| Signals / Audit | `signals.py`, `shared/audit.py` | Observan eventos `post_save`/`post_delete` para `AuditLog`. |
| Tests | `tests/test_v1/recruitment/` | Cubren casos críticos (unicidad documento, servicios, validadores). |

## 6. Checklist para extender los modelos

1. **Agregar campo nuevo**  
   - Definir en `models.py` con `help_text`/`choices`/`db_index` si aplica.  
   - Ejecutar `python manage.py makemigrations` y versionar la migración.  
   - Actualizar serializers (entrada/salida) y servicios que construyen instancias.  
   - Añadir validadores o constraints si el negocio lo requiere.  
   - Cubrir con tests (`tests/test_v1/recruitment/...`).

2. **Agregar nueva entidad**  
   - Crear modelo heredando `TimeStampedModel`.  
   - Documentar relaciones y actualizar `docs/BACKEND_VIEWS_GUIDE.md` y este archivo.  
   - Exponer endpoints (serializer, viewset, router) y servicios.  
   - Si necesita archivos externos, declarar adapter en `integrations/`.

3. **Actualizar catálogos (TextChoices)**  
   - Modificar la enum correspondiente y revisar si hay fixtures o front que dependan del valor.  
   - Añadir migración si cambian defaults o longitudes.  
   - Comunicar al frontend para sincronizar opciones (`modules/recruitment/shared/constants.ts`).

## 7. Orden y estándares verificados

- Se sigue la guía de HackSoft y proyectos grandes como Saleor (UUIDs, TextChoices, constraints, servicios).
- Todos los modelos están en un único archivo para mantener trazabilidad, pero agrupados por dominio lógico (campañas, postulantes, verificación, exportación, auditoría).
- No hay lógica pesada en los modelos; cualquier operación compleja vive en servicios/validators.
- Índices y constraints ya migrados garantizan integridad y performance en PostgreSQL 17 (pero son portables a otros motores soportados por Django 5).

> Mantén este documento actualizado cada vez que cambie `models.py` para que el onboarding del equipo sea rápido y no se repitan decisiones ya tomadas.

