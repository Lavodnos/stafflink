# QA/Tooling run (26-Nov-2025)

## Estado final
- Frontend: `npm run lint`, `npm run build`, `npm run test` (Vitest + RTL) ✅. Se añadió setup de pruebas (jsdom, setupTests.ts) y un smoke test de UI.
- Backend: `ruff` ✅, `black` ✅, `mypy api/` ✅, `bandit` (2 falsos positivos low), `safety` ✅. Pytest con `DJANGO_SETTINGS_MODULE=config.settings_test`: 20 passed, 3 skipped (verificación legacy). Cobertura con pytest ~73%.
- `manage.py test` sin `settings_test` sigue requiriendo Postgres en 127.0.0.1:2424 (no levantado en entorno de pruebas).

## Cambios clave
- Factories/tests ajustados a modelos reales (`Campaign.codigo/nombre`, `Link`, `Candidate`).
- Tests de Links actualizados a permisos/estado reales (`links.read/manage/close`, `estado`).
- Tests públicos reescritos para `/public/links/<slug>/` y creación de candidato; validan link activo/expirado.
- Exports marcados como skip (no hay flujo implementado). Verificación sigue en skip (flujo legacy no existe).
- Guard para UUID en `_fetch_directory_permissions`; validaciones y saneo en LinksPage.tsx; layout con Sidebar/Header/Footer/UserMenu.

## Pendientes
- Flujos de verificación y exportaciones no implementados: tests en skip hasta definir/crear esos endpoints/modelos.
- Cobertura baja en services (auth/recruitment); agregar tests para subir >80% si se desea.
- E2E (Cypress/Playwright) no configurado; SonarQube/SonarCloud tampoco.
- Bandit falsos positivos low (strings de mensajes/cookie path) sin silenciar.

## Comandos usados
- Frontend: `npm run lint`, `npm run build`, `npm run test`, `npm run test:run`.
- Backend: `ruff check`, `black .`, `DJANGO_SETTINGS_MODULE=config.settings_test manage.py test`, `coverage run -m pytest`, `coverage report`, `bandit -r api config integrations`, `safety check -r requirements.txt`, `mypy api`.
