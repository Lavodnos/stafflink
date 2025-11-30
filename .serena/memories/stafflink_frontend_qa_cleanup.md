# Limpieza y QA – 29-nov-2025

## Acciones recientes
- Agregadas herramientas para detectar código basura:
  - Scripts: `npm run check:deps` (depcheck), `npm run check:exports` (ts-prune), `npm run lint -- --max-warnings=0`, `npm run test`.
  - DevDeps instaladas: depcheck, ts-prune.
- Limpieza de dependencias no usadas (según depcheck) y desinstaladas:
  - `@fontsource-variable/montserrat`
  - `@hookform/resolvers`
  - `zod`
  - `@tailwindcss/forms`
  - `@testing-library/user-event`
  - `prettier-plugin-tailwindcss`
  - `tailwindcss`
- Re-ejecutado lint y tests:
  - `npm run lint -- --max-warnings=0` ✅
  - `npm run test` (Vitest) ✅
  - `npm run check:deps` ahora limpio tras desinstalar.
  - `npm run check:exports` (ts-prune) sin exports huérfanos.

## Rutas de edición dedicadas
- Links: `/links/:id/edit` precarga formulario; si no existe, redirige a `/links`.
- Campañas: `/campaigns/:id/edit` precarga formulario; si no existe, redirige a `/campaigns`.
- Blacklist: `/blacklist/:id/edit` precarga formulario; si no existe, redirige a `/blacklist`.

## Modal de candidatos
- Modal via `createPortal` a `document.body`, overlay `bg-slate-900/80` blur, z-index alto, max-w configurable.
- Tablas con acciones ajustadas (links: botones según estado).

## Próximos comandos útiles
- Lint: `npm run lint -- --max-warnings=0`
- Tests: `npm run test`
- Deps no usadas: `npm run check:deps`
- Exports huérfanos: `npm run check:exports`

