# Stafflink frontend – estado actual (2025-11)

- Estructura por features (campaigns, links, blacklist, candidates). Apply público sigue en modules/public; auth en modules/auth. Alias @ activo.
- API client central (`lib/apiClient`) con `ApiError`, `extractApiMessage`, toasts globales, 401→login. Permisos dinámicos con RequirePermission/usePermission.
- Formularios con RHF + Zod y helper `applyApiFieldErrors` para errores por campo. PublicApply mapea errores por campo y requiere distrito_otro, numérico/uppercase.
- Dashboard renovado con KPIs reales (funnel candidatos, canal origen, % docs por campaña, contratados vs pendientes 30 días) usando candidates/links/campaigns. Dark mode ok.
- Tailwind v4 + plugins forms/typography; logo GEA; modal candidatos via portal. Tests Vitest en verde (apply y candidates) tras instalar deps.
- Backend alineado: CandidateError por campo; serializers devuelven `{field:[msg]}`; tests backend ok.

Pendientes opcionales
- Extender `/api/auth/session/` para incluir perfil de usuario (username/email/nombres) y mostrarlo en navbar (ahora solo session/permissions).
- Migrar modules/public/auth a features para consistencia.
- Más E2E/CI y, opcional, lint Tailwind mapping.
