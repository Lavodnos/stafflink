# Plan de Implementación Stafflink (BFF modular)

1. **Modelo de datos y migraciones**
   - Crear migraciones para `campaign`, `blacklist`, `link`, `candidate`, `candidate_documents`, `candidate_process`, `candidate_assignment` (incluyendo campos auxiliares como `asistencia_extra` y `regimen_pago`).
   - Configurar señales o servicios para copiar los defaults del link (modalidad, condición, horario, descanso) al crear cada candidato.
   - Sembrar catálogos mínimos (estados, modalidades) mediante fixtures si es necesario.

2. **APIs base en `api/v1/recruitment`**
   - Exponer viewsets para campañas y blacklist (acceso BO/Admin).
   - Crear endpoints para links (lista, creación, edición, filtros por campaña/estado) manteniendo la arquitectura modular del BFF.
   - Implementar `POST /api/v1/recruitment/candidates/` con validaciones de duplicidad y bloqueo por blacklist.

3. **Procesos BO (checklist, hitos, contrato)**
   - Endpoints internos para actualizar `candidate_documents`, `candidate_process` (incluyendo `asistencia_extra` para cortes puntuales) y `candidate_assignment`.
   - Acciones específicas para decisiones (Apto/Observado/Rechazado) garantizando permisos por rol (BO vs RRHH).

4. **Frontend feature-sliced**
   - Módulos React para campañas, links y candidatos (CRUD, filtros) usando el hook `useAuth` para roles.
   - Formulario público reutiliza el link para defaults y envía datos al nuevo endpoint.
   - Vista de detalle BO con tabs (Datos, Documentos, Proceso, Contrato) conectados a sus APIs.

5. **Exportaciones Smart y reportes**
   - Servicio en backend que genere el Excel con los modelos anteriores y registre la bitácora de exportaciones.
   - Endpoint protegido para descargas.

6. **QA y documentación**
   - Tests unitarios/integ. para modelos y endpoints (duplicidad, flujos Apto/Observado/Cese).
   - Lint/tests frontend para componentes críticos.
   - Mantener `npm run build` estable y documentar endpoints nuevos en `docs/` + actualizar Serena según avancen las fases.
