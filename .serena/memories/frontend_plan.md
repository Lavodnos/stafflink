# Plan frontend (React + Tailwind + identidad GEA)

## Arquitectura y estado
- FSD: `src/app` (App, rutas, providers IAM/permisos), `src/pages` (rutas), `src/features` (Campaigns, Blacklist, Links, Candidates, Auth, PublicApply), `src/entities` (tipos/util de dominio), `src/shared` (UI kit, hooks, http client).
- Estado: React Query para datos remotos; Zustand/Context para sesión/permissions y UI (filtros/modales).
- Guardas: `<RequireAuth>` + `<RequirePermission perm="...">` con permisos simplificados (campaigns.read/manage, blacklist.read/manage, links.read/manage/close, candidates.read/manage/process/contract, exports.download).

## Identidad visual GEA en Tailwind
- `tailwind.config.js`: colores brand (brand-blue #0B1658, brand-green-from #004021 → brand-green-to #7A9A32, brand-orange-from #5A1D32 → brand-orange-to #E96F36, text-secondary #8785AB, blanco) y `fontFamily.sans = ["Futura Std","sans-serif"]`.
- Utilidades con `@apply` para btn primario (gradiente verde, texto blanco), secundario (borde azul), cards, tabs. Gradientes con `bg-gradient-to-r from-... to-...`.
- Cargar Futura Std (Light, Book, Medium) con `font-display: swap` y preload.

## Flujo público `/apply/:slug`
- Landing link: card con gradiente azul y CTA primario verde; muestra campaña/grupo/mod/cond/hora/descanso; valida activo/no vencido.
- Form candidato: secciones del formulario (datos personales, residencia, experiencia CC/otra, canal); React Hook Form + Zod/Yup; normalizar a mayúsculas en onBlur; pasos/progreso.
- API: `GET /api/v1/recruitment/public/links/:slug`, `POST /api/v1/recruitment/public/candidates`.

## BackOffice
- Dashboard básico (stats por estado/campaña/link).
- Campañas: lista/crear/editar (manage).
- Blacklist: lista/CRUD (manage).
- Links: lista, crear/editar, expire/revoke/activate (manage/close).
- Candidatos: lista con filtros; detalle con tabs Datos (manage), Documentos/Proceso (process), Contrato (contract). 
- Exportes (si aplica): vista con `exports.download`.

## Formularios y UX
- Validación onBlur/onSubmit, mensajes cercanos al campo, aria-live. Pasos con progreso y navegación clara. Transformadores uppercase para nombres/apellidos/dni.
- Accesibilidad: labels, focus visible (azul primario), contraste WCAG (azul sobre blanco; gris secundario para texto grande/secondary).

## Performance
- Code splitting por ruta (React.lazy/Suspense). Lazy en vistas BO pesadas. React Query caching/revalidate.
- Purga Tailwind, minificación/gzip/Brotli. Preload de fuentes críticas; iconos SVG lineales.

## Iteración
1) Config Tailwind (tokens GEA) + layout base + providers (QueryClient, Auth/Perms).
2) Público `/apply/:slug` + formulario completo.
3) BO campañas/blacklist/links (guardas permisos).
4) BO candidatos lista + detalle/tabs (checklist/proceso/contrato).
5) Exportes y pulir accesibilidad/contrastes.
