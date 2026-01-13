# Repository Guidelines

## Project Overview
Stafflink is a two-part web app: a Django + DRF backend and a React + Vite (TypeScript) frontend. The repo also keeps design and API references under `docs/`.

## Project Structure & Module Organization
- `backend/`: Django project with settings in `backend/config/`, core app in `backend/api/` (auth and `v1` APIs), and tests in `backend/api/tests/` and `backend/tests/`.
- `frontend/`: Vite app with source in `frontend/src/` organized by `modules/`, `features/`, `pages/`, `components/`, and `routes/`. Static assets live in `frontend/public/` and `frontend/src/assets/`.
- `docs/`: API schema and implementation notes (keep updated when behavior changes).

## Build, Test, and Development Commands
Backend (from `backend/`):
```bash
source venv/bin/activate
pip install -r requirements.txt
python manage.py runserver
python manage.py test
```
Frontend (from `frontend/`):
```bash
npm install
npm run dev
npm run build
npm run lint
npm run test     # watch mode
npm run test:run # single run (CI)
```

## Coding Style & Naming Conventions
- Python: 4-space indentation, Django/DRF conventions, snake_case modules and functions. Prefer explicit serializers/services over inline logic in views.
- TypeScript/React: 2-space indentation, single quotes, semicolons. Component files use PascalCase (e.g., `ToastContainer.tsx`), hooks use camelCase (`useAuth`).
- Linting: `npm run lint` is the standard check for frontend. No mandatory backend formatter is wired; keep changes consistent with nearby code.

## Testing Guidelines
- Backend tests use `APITestCase` and live under `backend/api/tests/` and `backend/tests/` with `test_*.py` naming. Run via `python manage.py test`.
- Frontend tests use Vitest + Testing Library under `frontend/src/**/__tests__/*.test.tsx`.
- Add or update tests when changing API behavior or UI flows.

## Commit & Pull Request Guidelines
- Commit messages in history are short, Spanish, and descriptive (e.g., "actualizacion de scripts"). Keep the same style; there is no strict conventional-commit format.
- PRs should include a brief summary, test evidence (commands and results), and screenshots for UI changes. Link issues or specs when available.

## Security & Configuration Tips
- Use `.env.example` to create local `.env` files in `backend/` and `frontend/`. Do not commit secrets.
- Default dev ports are `8000` (Django) and `5173` (Vite) with the frontend proxying `/api` to the backend.
