## Estado de buenas prácticas (Frontend Stafflink)

- Arquitectura por features: links, campaigns, blacklist, candidates en `src/features/*` con api/hooks/constants/index y permisos dinámicos. Alias `@` activo.
- Cliente API central `src/lib/apiClient` + `apiFetch`, cookies, baseURL env; 401 -> redirect login, 403/otros -> toast. ToastContainer global.
- Permisos: `RequirePermission` protege rutas y botones (no hay permisos estáticos). `modules/auth` sigue manejando login/session/usePermission.
- Formularios: RHF + Zod en CRUD (links, campaigns, blacklist, candidates) con `ErrorText` reutilizable.
- Tailwind v4 con tokens en @theme, plugins forms/typography; dark mode; logo GEA; modal candidatos via portal.
- QA: `npm run lint -- --max-warnings=0` y `npm run test:run` OK (tras npm install limpio si hace falta).
- Público apply: se mantiene en `modules/public`, solo la ruta de apply.

### Sobre migrar auth/public
- `modules/auth` y `modules/public` (apply) no se movieron; auth maneja login/session/permisos y funciona. Migrarlo es opcional, beneficia consistencia pero tiene riesgo de romper login/SSO y no da mejora inmediata.

### Pendientes opcionales
- Más tests/E2E; toasts más específicos.
- Lint Tailwind (plugin incompatible con v4; habría que mapear utilidades).