# Backend Structure Summary
- `config/`: central Django project with `settings.py` (IAM config, storage vars, `INSTALLED_APPS`), `urls.py` (routes `/api/auth/` → `api.auth.urls` and `/api/v1/` → `api.v1.urls`), and ASGI/WSGI entrypoints.
- `api/`:
  - `auth/`: legacy IAM proxy (client, serializers, views, urls) serving `/api/auth/login|logout|session`.
  - `shared/`: cross-cutting helpers for audit logs, exceptions, and utilities.
  - `v1/`: versioned API namespace with `urls.py` aggregating v1 modules.
    - `recruitment/`: full ONE-PASS domain (AppConfig label `recruitment`, models, admin, migrations, permissions, pagination, request_context, storage selector, validators, services, serializers, views, and router for public + guarded endpoints).
- `integrations/`: adapters for storage (base/local/S3), Smart exporter (formatter/client), and notifications (email stub).
- `tests/`: legacy auth tests plus `tests/test_v1/test_recruitment` prepared for the new API.
- Entry-level files: `manage.py`, `requirements.txt`, `.env.example`, `db.sqlite3`. The entire API meant for clients is exposed via `/api/v1/...`, keeping future versioning clean.
