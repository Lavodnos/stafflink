# Suggested Commands

- Start IAM services: `cd /home/lavodnos/code/SERVICES IAM GEA && docker compose up --build -d` (API on 58000, perimeter on 58080).
- Backend dev server: `cd backend && source venv/bin/activate OR .\venv\Scripts\activate
- python manage.py runserver 0.0.0.0:8000`.
- Backend tests: `cd backend && source venv/bin/activate && python manage.py test`.
- Frontend install: `cd frontend && npm install` (needed when deps change).
- Frontend dev server: `cd frontend && npm run dev`.
- Frontend lint/build: `cd frontend && npm run lint && npm run build`.
- Login E2E manual test: open `http://localhost:5173/login`, authenticate via IAM, verify session cookie and duplicate-session flow.
