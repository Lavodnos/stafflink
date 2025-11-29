# Estado actual – modal de detalle de candidatos (28-nov-2025, update)

## Ajuste de overlay
- Fondo ahora más opaco y gris: `bg-slate-900/80` + `backdrop-blur-sm`, z-index elevado a `z-[90]`.
- Sigue siendo `fixed inset-0 flex items-start justify-center overflow-y-auto px-4 py-8` para permitir scroll del contenido largo, pero bloquear fondo.
- Scroll del body/html sigue bloqueado al abrir (useEffect previo).

## Archivo
- `frontend/src/pages/CandidatesPage.tsx`

## Lint
- `npm run lint -- --max-warnings=0` OK.

## Qué verificar
- Al abrir “Ver / Editar” el fondo debe quedar plomo/oscuro y borroso, sin que se note el contenido detrás; modal centrado con scroll interno si es muy largo.
