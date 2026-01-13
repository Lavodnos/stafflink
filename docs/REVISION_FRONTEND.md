# Revision frontend

## Resumen
El frontend es React + Vite + TypeScript con feature-sliced parcial, react-query y Tailwind v4. La base es buena, pero hay deuda de higiene, configuracion y consistencia de estilo.

## Hallazgos prioritarios
- Higiene de repo: `frontend/node_modules/`, `frontend/dist/` y `frontend/.env` estan en el repo. Tambien existe `frontend/package.json (partial)` y un `src/` en la raiz que parece obsoleto. Estos archivos/directorios deberian eliminarse del git y quedar ignorados.
- Configuracion hardcodeada: `frontend/src/components/layout/UserMenu.tsx` usa `IAM_SECURITY_URL` fijo. Mejor mover a `VITE_IAM_SECURITY_URL` en `.env.example`.
- Debug en produccion: hay `console.log` en `frontend/src/pages/CandidatesPage.tsx`. Remover antes de release.
- Duplicidad de tema: `frontend/src/context/ThemeContext.tsx` no se usa y ademas usa `"use client"` (directiva de Next) y una clave distinta de `ThemeToggle` (`theme` vs `stafflink-theme`). Consolidar una sola fuente.
- Estilo inconsistente: hay mezcla de comillas simples/dobles y formato (ej. `frontend/src/layout/AppHeader.tsx` vs otros). No hay script de Prettier aunque esta el plugin en `package.json`.
- TODOs pendientes: exportaciones marcadas como TODO en `frontend/src/pages/*Page.tsx` (Campaigns, Links, Candidates, Blacklist).
- HTTP client: `frontend/src/lib/http.ts` siempre envia `Content-Type: application/json`. Si se agregan uploads (FormData), conviene detectar y no forzar el header.

## Recomendaciones rapidas
- Limpiar artefactos, mover `.env` a local y agregar reglas a `.gitignore`.
- Centralizar configuracion en `import.meta.env` y documentar en `.env.example`.
- Agregar `npm run format` con Prettier y alinear el estilo.
- Eliminar/actualizar TODOs o crear tickets de seguimiento.

## Mejoras sugeridas (investigacion, core)
Fuera de alcance: autenticacion/login (API externa).

- Usar `.env`, `.env.development`, `.env.production` con prefijo `VITE_` para toda configuracion, sin hardcode.
- Integrar Prettier con ESLint (`eslint-config-prettier`) y crear script `npm run format`.
- Definir una sola estrategia de tema (remover `ThemeContext` si no se usa o integrarlo con `ThemeToggle`).
- Asegurar que `apiFetch` no fuerce `Content-Type` cuando se use `FormData` (uploads).
- Documentar y limpiar `src/` raiz y archivos parciales para evitar confusion en el equipo.

Fuentes consultadas:
- https://vite.dev/guide/env-and-mode
- https://eslint.org/docs/latest/use/configure/
- https://prettier.io/docs/en/integrating-with-linters.html
- https://github.com/github/gitignore
