# Task Completion Checklist
1. Ensure IAM Docker stack is running if changes depend on live authentication.
2. Backend changes: run `python manage.py test` (within venv) and, if endpoints touched, exercise manually via curl or Postman hitting `http://localhost:8000/api/...`.
3. Frontend changes: run `npm run lint` and `npm run build`; smoke-test via `npm run dev` in the browser (`http://localhost:5173`).
4. Update relevant docs (`docs/LOGIN_FLOW.md`, `SERENA.md`, README) whenever flows, env vars, or commands change.
5. Confirm login flow still works end-to-end (cookie set, duplicate-session message on first conflict, force on second click).
6. Commit with clear message and, if required, sync with the IAM repo (when both change) before handing off.
