# Requisitos (RQ) y Endpoints — Reclutamiento GEA (ONE-PASS)

> **Modo ONE-PASS**: el postulante llena datos y **sube DNI/CE** en el mismo formulario; el Backoffice (BO) verifica todo en **una sola vista**.

---

## Requisitos (RQ) por Vista

### Vista 1 — Generar link (con fecha límite)

**Qué hace:** Crea y mantiene el “link/grupo” que define campaña/sede y condiciones.

- **RQ-1.1 Campaña** — Seleccionar campaña.
- **RQ-1.2 Reclutador (propietario)** — Asociar al creador del link.
- **RQ-1.3 Modalidad** — Full time / híbrido / teletrabajo.
- **RQ-1.4 Condición laboral** — Planilla / honorarios.
- **RQ-1.5 Período del reclutado** — Automático o manual.
- **RQ-1.7 Fecha límite** — Expira por fecha/hora (TZ America/Lima).
- **RQ-1.8 URL/QR + estado** — Activo / Vencido / Anulado.
- **RQ-1.9 Edición sin pérdida** — Se puede editar cualquier campo; los postulantes referencian **link_id**.

---

### Vista 2 — Formulario del postulante (llenado)

**Qué hace:** El postulante registra sus datos.

- **RQ-2.1 Datos personales en MAYÚSCULAS** — Apellidos, nombres, contacto, etc.
- **RQ-2.2 Documento + validación** — **DNI: 8 dígitos / CE: 12 dígitos (política actual)**.
- **RQ-2.3 Adjuntos obligatorios (one-pass)** — **DNI/CE anverso y reverso** (JPG/PNG/PDF, tamaño máx.).
- **RQ-2.4 Asociación automática al link** — Hereda campaña/sede/grupo.
- **RQ-2.5 Borrador y envío** — Guardado parcial y envío final (bloquea si faltan adjuntos).
- **RQ-2.6 LPDP + aviso** — Consentimiento antes de enviar.

---

### Vista 3 — Verificación integral (Datos + CRUD controlado) — Backoffice

**Qué hace:** BO valida todo en **una sola pantalla** y decide el caso.  
**Aquí se permite CRUD controlado del postulante si hay errores declarativos.**

- **RQ-3.1 Cola de verificación** — Filtros por campaña/grupo/estado.
- **RQ-3.2 Panel “Datos”** — Formato DNI/CE, duplicidad, **reingreso**, **blacklist GEA/Cliente**, coherencia (nombre/teléfono).
- **RQ-3.3 Edición (CRUD controlado)** — Corregir campos evidentes (p. ej., tildes, errores tipográficos de correo/teléfono) con auditoría.
- **RQ-3.4 Decisión única** — **Apto / Observado / Rechazado** (motivo, usuario, fecha).
  - Si **Observado**: solicitar reenvío de datos/archivos desde el mismo caso.
- **RQ-3.5 Estado tras Apto** — **Verificado OK** (listo para Smart).

---

### Vista 4 — Exportar a Smart Boleta

**Qué hace:** Genera el lote en formato Smart y marca creación.

- Se exportan grupos con los postulantes en un formato configurable.

---

### Extras transversales

- **RQ-X.1 Auditoría** — Registrar quién, cuándo y qué cambió (links, correcciones, decisiones, exportes).
- **RQ-X.4 Estados claros** — Cada vista muestra el estado actual y el **próximo paso**.

---

## Endpoints por Vista

```text
# Vista 1 — Generar link
GET    /api/campaigns
POST   /api/links
GET    /api/links
GET    /api/links/{id}
PATCH  /api/links/{id}
POST   /api/links/{id}/expire
POST   /api/links/{id}/revoke

# Vista 2 — Formulario del postulante (público)
GET    /api/public/links/{slug}
POST   /api/public/candidates
GET    /api/public/candidates/{id}        <- reanudar borrador
PATCH  /api/public/candidates/{id}
POST   /api/public/uploads
POST   /api/public/candidates/{id}/submit

# Vista 3 — Verificación integral (Backoffice)
GET    /api/verify/queue
GET    /api/verify/{candidate_id}
PATCH  /api/verify/{candidate_id}
POST   /api/verify/{candidate_id}/decision
POST   /api/verify/{candidate_id}/request-correction

# Vista 4 — Exportar a Smart Boleta
POST   /api/exports/smart/batches
GET    /api/exports/smart/batches         <- listar historial
GET    /api/exports/smart/batches/{batch_id}
GET    /api/exports/smart/batches/{batch_id}/file
POST   /api/exports/smart/batches/{batch_id}/mark-created

# Extras transversales
GET    /api/audit/events
GET    /api/candidates/{id}/status
```
