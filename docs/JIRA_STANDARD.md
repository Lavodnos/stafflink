# Estandar Jira (Scrum) para Proyectos

Este documento define un estandar reutilizable para estructurar backlog, historias y evidencias en Jira. Esta basado en buenas practicas de Scrum y guias de historias de usuario/criterios de aceptacion (Atlassian) y Definition of Done (Scrum.org).

## 1) Estructura recomendada
- **Epica**: resultado grande (ej. Seguridad IAM, Postulacion publica).
- **Historia de usuario**: valor entregable en una iteracion.
- **Tarea/Subtarea**: trabajo tecnico por disciplina (FE/BE/QA/Infra).
- **Bug**: comportamiento incorrecto con pasos y evidencia.
- **Spike**: investigacion con salida documentada.

Regla: si la historia ya esta implementada, no crear tareas historicas. Registrar **Evidencia** y marcar Done.

## 2) Plantilla de Historia de Usuario
**Resumen**: [Modulo] - [Accion] - [Resultado]

**Historia**: Como [persona], quiero [necesidad] para [proposito].

**Criterios de aceptacion (Given/When/Then)**:
- Dado [contexto], cuando [accion], entonces [resultado].
- Dado [restriccion], cuando [accion], entonces [resultado].

**Evidencia (si Done)**:
- FE: ruta/pantalla + archivo
- BE: endpoint + archivo
- DB: tabla/campos
- Tests: comando + archivo

**Dependencias**:
- Blocks / Is blocked by: [Ticket]

## 3) Definition of Ready (DoR)
- Alcance claro y acotado.
- Criterios de aceptacion definidos y testeables.
- Dependencias resueltas o identificadas.
- Contrato API definido si aplica.

## 4) Definition of Done (DoD)
- Criterios de aceptacion cumplidos.
- Tests relevantes pasan (unit/integration).
- Documentacion actualizada si aplica.
- Riesgos de seguridad basicos revisados.

## 5) Components y Labels
- **Components (disciplina)**: Frontend, Backend, QA, Infra
- **Labels (modulo funcional)**: auth, campaigns, links, public, backoffice, contract, exports

## 6) Version/Release
- Usar **Fix Version** para releases (ej. v1.0, MVP-1).
- Todo ticket en Done debe estar asociado a una version.

## 7) Ejemplo corto (historia Done)
**Resumen**: Links - Crear link con defaults

**Historia**: Como recruiter, quiero crear links con defaults para no repetir datos por postulante.

**Criterios**:
- Dado un link activo, cuando un candidato postula, entonces hereda modalidad/condicion/horario/descanso.

**Evidencia**:
- FE: /links (frontend/src/pages/LinksPage.tsx)
- BE: /api/v1/links (backend/api/v1/recruitment/views/link_viewset.py)
- Defaults: backend/api/v1/recruitment/services/candidate_service.py
- Tests: backend/tests/test_v1/test_recruitment/test_links.py
