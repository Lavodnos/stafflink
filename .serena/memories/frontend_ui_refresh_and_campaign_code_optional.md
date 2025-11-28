## Resumen frontend (layout+accesibilidad)

- Se agregaron tokens y utilidades en `frontend/src/styles/tailwind.css`: colores de superficie/bordes/sombra, focus-visible en botones/inputs, cards con borde+shadow consistentes.
- Header/Sidebar/Footer alineados con accesibilidad: `Header` ahora usa `aria-expanded/aria-controls` en el hamburger, recibe `isMenuOpen`; `Sidebar` (desktop/mobile) tiene `aria-label` y foco visible en ítems, drawer con id `app-sidebar`. `Shell` y `App` pasan estado de nav al header.
- Formularios siguen utilidades base, inputs con ring+offset en focus.
- QA frontend: `npm run lint` OK, `npm run test` (Vitest) OK (quedó en watch tras pasar 2/2).

## Campañas: código opcional y combos

- Campo `codigo` de Campaign ahora permite null/blank.
  - Modelo: `backend/api/v1/recruitment/models.py` con `codigo null=True, blank=True`.
  - Migración nueva: `backend/api/v1/recruitment/migrations/0002_alter_campaign_codigo.py`.
  - Serializer: `backend/api/v1/recruitment/serializers/campaign_serializer.py` normaliza a mayúsculas y convierte vacío -> None; `allow_null/allow_blank/required=False`.
- Front: `frontend/src/pages/CampaignsPage.tsx` normaliza `codigo` y envía `null` si está vacío; al editar carga "" cuando viene null.
- Catálogos estáticos centralizados: `frontend/src/modules/campaigns/constants.ts` con `AREA_OPTIONS`, `SEDE_OPTIONS`, `CAMPAIGN_CODE_ENABLED` (toggle de campo código).
- Área y Sede ahora son `<Select>` basados en constants.

## Pendiente operacional
- Ejecutar migraciones: `cd backend && venv/bin/python manage.py migrate` con DB levantada.

## QA backend (estado previo)
- Ruff/Black/mypy/bandit/safety OK. Pytest con settings_test en verde (20 pass, 3 skip legacy verificación). manage.py test sin settings_test requiere Postgres en 127.0.0.1:2424. Coverage ~73%.

## Otros pendientes conocidos
- Flujos de verificación y export no implementados (tests skip). Cobertura baja en services (auth/recruitment). E2E/Sonar no configurados.