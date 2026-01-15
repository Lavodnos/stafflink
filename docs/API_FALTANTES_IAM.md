# APIs faltantes de IAM para Stafflink

Este documento resume las APIs de IAM que Stafflink necesita para la función **Encargados** en Convocatorias (listar usuarios “agentes” y agregarlos a una convocatoria). No se implementa nada en Stafflink; solo se detalla lo que falta en IAM o lo que debe existir con filtros adecuados.

## Contexto
- IAM actual: `http://172.28.1.24:58000/docs#/`
- Stafflink debe mostrar un selector de usuarios **agentes** y permitir agregarlos a una lista de encargados.

## APIs requeridas (o filtros faltantes)

### 1) Listar usuarios con filtros por rol/app
**Endpoint disponible**
- `GET /api/v1/directory/users`

**Soporta (según docs IAM)**
- `search`, `status`, `app_id`, `role_id`, `limit`, `offset`

**Faltante / requerido para Stafflink**
- **Role ID de agentes** (dato operativo): se necesita un `role_id` específico para filtrar “agentes”.
- Respuesta más rica (opcional): `first_name` / `last_name` o `display_name` para mostrar en UI.

### 2) Listar usuarios por grupo (si se usa grupos de agentes)
**Endpoint existente**
- `GET /api/v1/directory/groups/{group_id}/members`

**Faltante / requerido**
- Búsqueda por `group_code` o `group_name` para evitar depender de IDs internos.
- Respuesta con los mismos campos mínimos de usuario.

### 3) Búsqueda rápida (autocomplete)
**Endpoint base esperado**
- `GET /api/v1/directory/users`

**Faltante / requerido**
- Soporte de `search` con búsqueda parcial por `email`, `username`, `dni`.
- Respuesta liviana (solo campos mínimos) para autocomplete.

### 4) Modelo de “agente” o clasificación
Si IAM no tiene una forma clara de clasificar usuarios “agentes”, se requiere al menos uno de:
- Rol dedicado (`role=agent`) asignado en la app Stafflink.
- Grupo dedicado (`group_code=AGENTES_TMK`).
- Permiso específico (`stafflink.agents.read`) para filtrar la lista.

## Observación
Stafflink no debe crear ni administrar usuarios IAM. Solo consume IAM para listar y asignar encargados.  
Si estas APIs/filtros no existen, deben implementarse en IAM-GEA-API antes de continuar con el frontend.
