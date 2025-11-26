# Requisitos Funcionales y Modelo de Datos — Stafflink (ONE-PASS)

Este documento alinea los requerimientos del flujo de reclutamiento con las tablas que los sustentan en base a la maqueta operativa (Excel) y los patrones de ATS/BPO.

---

## RQ-1 Autenticación e IAM

**Necesidad:** Ingresar vía IAM corporativo para garantizar sesión única y permisos centralizados.

- Endpoints proxys (`/api/auth/login|logout|session`) mantienen la cookie `stafflink_access_token`.
- Los permisos por recurso/acción (`links.create`, `verification.decide`, etc.) se leen del token IAM y controlan el acceso en backend/frontend.

**Tablas involucradas:** (no aplica; IAM es externo).

---

## RQ-2 Campañas

**Qué se pide:** CRUD completo de campañas con activación/desactivación y trazabilidad.

- Campos: código, área, nombre comercial, sede, estado, timestamps.
- Justificación: descripción de la oferta de trabajo base; múltiple links pueden heredar de la misma campaña.

**Modelo `campaign`**

```
id (PK) | codigo | area | nombre | sede | estado | created_at | updated_at
```

---

## RQ-3 Blacklist

**Qué se pide:** Registrar personas vetadas (DNI), con descripción y estado histórico.

- Permite bloquear candidatos desde el formulario y desde BackOffice.

**Modelo `blacklist`**

```
id (PK) | dni | nombres | descripcion | estado | created_at | updated_at
```

---

## RQ-4 Links de Reclutamiento

**Qué se pide:** Generar links por campaña con parámetros por defecto (modalidad, condición, horario, descanso), cuotas y responsables.

- Justificación: en el Excel, “Periodo reclutado”, “Semana de trabajo”, “Reclutador”, “Modalidad”, “Condición”, “Horario”, “Descanso” se repiten por cada postulante; deben vivir como defaults del link y copiarse al candidato para poder ajustarse individualmente.

**Modelo `link`**

```
id (PK)
campaign_id (FK)
grupo
user_id
user_name
periodo
slug
titulo
cuotas
semana_trabajo
expires_at
notes
modalidad
condicion
estado
hora_gestion
descanso
created_at
updated_at
created_by
updated_by
```

---

## RQ-5 Postulantes (Formulario Público)

**Qué se pide:** Capturar ficha completa del postulante, incluyendo copia editable de la oferta (modalidad/condición/horario/descanso). Debe permitir almacenar dos bloques de experiencia y la forma en que se enteró de la vacante.

**Justificación (data Excel):**

- Columnas de datos personales/residencia: Tipo de documento, DNl, apellidos, nombres, teléfonos, correos, sexo, fecha de nacimiento, edad, estado civil, número de hijos, nivel académico, carrera, nacionalidad, lugar/distrito/dirección.
- Experiencia se divide en dos: “¿Cuentas con experiencia en call center?” (sí/no), “¿Qué tipo?”, “Tiempo” y otra experiencia con su propio tiempo.
- “¿Cómo te enteraste de la oferta?” y observaciones del reclutador.
- Copia editable de `modalidad`, `condicion`, `hora_gestion`, `descanso`.

**Modelo `candidate`**

```
id (PK)
link_id (FK)
tipo_documento
numero_documento
apellido_paterno
apellido_materno
nombres_completos
telefono
telefono_referencia
email
sexo
fecha_nacimiento
edad
estado_civil
numero_hijos
nivel_academico
carrera
nacionalidad
lugar_residencia
distrito
direccion
has_callcenter_experience         -- ¿Cuentas con experiencia en call center?
callcenter_experience_type        -- Tipo (Retenciones, Ventas, etc.)
callcenter_experience_time        -- Tiempo (1-3 meses, 12 meses a más)
other_experience_type             -- Otra experiencia (Ej. Atención presencial)
other_experience_time             -- Tiempo de la otra experiencia
enteraste_oferta
observacion
modalidad
condicion
hora_gestion
descanso
created_at
created_by
update_at
update_by
```

> **Nota:** `has_callcenter_experience` y los dos bloques de campos evitan perder los dos tiempos de experiencia que aparecen en el Excel.

---

## RQ-6 Verificación BackOffice

**Qué se pide:** Cola de verificación con filtros, panel único con datos, documentos y proceso, edición controlada, decisiones Apto/Observado/Rechazado y estado posterior.

Se descompone en:

1. **Datos** (lectura/edición de `candidate`).
2. **Checklist documental** (columna “CV”, “DNI”, “Certijoven/Certiadulto”, “Recibo”, “Ficha”, “Autorización”).
3. **Proceso/Hitos** (envío DNI, test, validación PC, evaluación día 0, inicio/fin capacitación, conexiones OJT/OP, pago, estados día 0/día 1, status final, observaciones).

### Checklist documental

**Modelo `candidate_documents`**

```
id (PK)
candidate_id (FK)
cv_entregado
dni_entregado
certificado_entregado
recibo_servicio_entregado
ficha_datos_entregado
autorizacion_datos_entregado
status       -- PENDIENTE / COMPLETO / OBSERVADO
observacion
```

> **Justificación:** El Excel marca “OK”, “PENDIENTE”, “COMPLETO”. Por eso se añade `status` y `observacion` además de los flags.

### Proceso / Hitos

**Modelo `candidate_process`**

```
id (PK)
candidate_id (FK)
envio_dni_at
test_psicologico_at
validacion_pc_at
evaluacion_dia0_at
inicio_capacitacion_at
fin_capacitacion_at
conexion_ojt_at
conexion_op_at
pago_capacitacion_at
estado_dia0
observaciones_dia0
estado_dia1
observaciones_dia1
windows_status           -- Permite registrar validación Windows (columna en Excel)
asistencia_extra         -- JSON u objeto flexible para cortes puntuales (ej. asistencia al 04/10)
status_final
status_observacion
updated_by
updated_at
```

> **Nota:** Para datos puntuales como “Asistencia al 04/10” se propone `asistencia_extra` (objeto JSON) dentro de la misma tabla, dado que son cortes específicos y no requieren tabla adicional.

---

## RQ-7 Asignación / Contrato

**Qué se pide:** Registrar tipo de contratación, empresa (razón social), remuneración, bonos (variables, movilidad, bienvenida, permanencia, asistencia), cargo contractual y estado (Activo, Cese, Baja). También se usa el campo `RXH` como régimen de pago.

**Modelo `candidate_assignment`**

```
id (PK)
candidate_id (FK)
tipo_contratacion
razon_social
remuneracion
bono_variable
bono_movilidad
bono_bienvenida
bono_permanencia
bono_asistencia
cargo_contractual
regimen_pago
fecha_inicio
fecha_fin
estado
```

---

## RQ-8 Exportaciones Smart

**Qué se pide:** Descargar grupos/campañas en Excel formato Smart registrando usuario, fecha y alcance; permitir relanzar exportaciones.

- No requiere tabla adicional más allá de registrar logs en base a las entidades anteriores o en un módulo de auditoría.

---

## Flujo Operativo (resumen)

1. **Autenticación IAM** → Login vía `/api/auth/login/` (sesión única).
2. **Administración base** → Configurar campañas (`campaign`) y blacklist (`blacklist`).
3. **Generación de links** → Crear `link` con defaults (modalidad, condición, horario, descanso).
4. **Captura de postulantes** → Formulario público por link crea `candidate` y marca checklist pendiente (`candidate_documents`).
5. **Verificación BO** → Vista con pestañas: Datos (`candidate`), Documentos (`candidate_documents`), Proceso (`candidate_process`), Decisión (Apto/Observado/Rechazado).
6. **Asignación / Contrato** → Registrar `candidate_assignment` (tipo de contrato, remuneración, bonos, estado).
7. **Exportaciones Smart** → Reportes por campaña/link/estado y bitácora de descargas.

---

## Cobertura de campos del Excel

| Columna Excel                                           | Tabla / Campo                                                       |
| ------------------------------------------------------- | ------------------------------------------------------------------- |
| PERIODO RECLUTADO, SEMANA DE TRABAJO                    | `link.periodo`, `link.semana_trabajo`                               |
| RECLUTADOR, SEDE, CAMPAÑA, GRUPO                        | `link.user_*`, `campaign.sede`, `campaign.codigo`, `link.grupo`     |
| MODALIDAD, CONDICIÓN, HORARIO, DESCANSO                 | `link.modalidad` (default) → `candidate.modalidad` (copia editable) |
| Datos personales (documento, nombre, teléfonos, etc.)   | `candidate.*`                                                       |
| ¿Cuenta con experiencia en call center?, Tipo, Tiempo   | `candidate.has_callcenter_experience`, `callcenter_experience_*`    |
| Otra experiencia y tiempo                               | `candidate.other_experience_*`                                      |
| ¿Cómo se enteró?, Observación                           | `candidate.enteraste_oferta`, `candidate.observacion`               |
| ENVIO DNI, TEST, VALIDACIÓN PC, EVALUACIÓN DÍA 0, etc.  | `candidate_process.envio_dni_at`, `test_psicologico_at`, etc.       |
| DÍA 0, STATUS DÍA 1, OBSERVACIONES                      | `candidate_process.estado_dia0/dia1`, `observaciones_*`             |
| Asistencia puntual (“Asistencia al 04/10”)              | `candidate_process.asistencia_extra` (JSON o campos puntuales)      |
| Tipo de contratación, Razón social, Remuneración, Bonos | `candidate_assignment.*`                                            |
| CV, DNI, Certijoven, Recibo, Ficha, Autorización        | `candidate_documents.*` + `status` / `observacion`                  |
| STATUS/Observación final                                | `candidate_process.status_final`, `status_observacion`              |

Con este modelo, cada campo del Excel tiene un lugar definido y se evita duplicar información entre postulantes del mismo link. Además, al mantener `candidate_process.asistencia_extra` como JSON opcional, se cubren los cortes puntuales sin crear una tabla exclusiva de fechas.
