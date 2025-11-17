# Code Style & Conventions
- Backend (Django/DRF): use serializers for validation, thin APIViews/ViewSets delegating to service/helper layers; keep IAM integrations isolated in `api/auth/client.py`. Configuration via `.env`/`settings.py` (python-dotenv). Maintain Unix line endings for scripts that run in Docker.
- Frontend (React/Vite): TypeScript everywhere, hooks + context for global state (AuthProvider), React Hook Form for forms, and API helpers wrapping fetch with an `ApiError`. Components split into UI (presentational) and page/feature containers.
- Styling: Tailwind CSS v4 only via `src/styles/tailwind.css` tokens (GEA blues/greens, Montserrat Variable font). No legacy CSS files; prefer semantic utility compositions and `@tailwindcss/forms` for inputs.
- UX: login requires duplicate-session messaging (first attempt shows warning, second forces logout). Future flows should follow the same pattern (user-friendly messages, graceful handling of IAM errors).
- Docs: major flows documented under `docs/` (e.g., `LOGIN_FLOW.md`); update SERENA/README when behavior changes.
