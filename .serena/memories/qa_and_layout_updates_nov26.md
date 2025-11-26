## Estado de QA y layout (26-Nov-2025)

### Cambios implementados
- **Layout GEA:** Sidebar, Header (con toggle mobile), Footer y Shell aplicados a rutas privadas; UserMenu en header (logout + enlace a seguridad IAM). Sidebar fijo en desktop y drawer en mobile. Ruta pública /apply/:slug queda fuera del Shell.
- **UX Links:** Normalización numérica (sin NaN), validaciones (slug/título, numéricos), `expires_at` ISO, edición muestra fecha. Formulario público hace todos los campos visibles obligatorios con mensajes.
- **Código limpio:** Import no usado en Sidebar; saneo LinksPage para TS build; guard en `_fetch_directory_permissions` para evitar Directory con user_id inválido.

### Tooling/tests ejecutados
- **Frontend:** `npm run lint` ✅; `npm run build` ✅; añadido Vitest + RTL + jsdom, scripts `test`/`test:run`, test de smoke `src/components/__tests__/ui.test.tsx` ✅.
- **Backend:** `ruff check` ✅; `black .` aplicado (14 files); `manage.py test` con `settings_test` ✅ (12 tests). `coverage run manage.py test` cobertura ~65% global. Instalados `coverage`, `pytest`, `pytest-django`, `bandit`, `safety`.
- **Bandit:** 2 falsos positivos low (mensaje de token en views, cookie path). **Safety:** 0 vulnerabilidades en requirements.txt (comando `check` deprecado).

### Problemas pendientes
- `pytest` (con settings_test) falla 13 tests en `backend/tests/test_v1/...` por desalineación con el modelo actual:
  - Factories usan `RecruitmentLink`/`Applicant`, fields `code/name/status/owner_id` y permisos `links.read_own/read_all/expire_own`; el modelo real es `Link` (titulo/user_id/estado) y `Candidate`; permisos actuales en `LinkViewSet` son `links.read/manage/close`.
  - Rutas públicas en tests (reverse `public-candidate-create`) no corresponden al namespace actual.
- `python manage.py test` sin settings_test sigue fallando si no hay Postgres en 127.0.0.1:2424.
- SonarQube/SonarCloud y E2E (Cypress/Playwright) no configurados.
- mypy no ejecutado aún (mypy.ini existe con ignore_missing_imports).

### Próximos pasos sugeridos
1) Alinear suite de tests `tests/test_v1` a los modelos/permisos actuales: factories a `Link`/`Candidate` con campos reales (`titulo/user_id/estado`, `tipo_documento/numero_documento/nombres_completos`, etc.) y permisos `links.read/manage/close`; actualizar rutas públicas al namespace real.
2) Ejecutar `mypy backend` y ajustar.
3) Configurar Sonar (sonar-project.properties + workflow) y opcional E2E (Cypress/Playwright) para smoke login/CRUD.
4) Decidir si se desactivan los falsos positivos de Bandit o se silencian con `# nosec`.
