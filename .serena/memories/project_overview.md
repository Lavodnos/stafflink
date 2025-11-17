# Stafflink Project Overview
- Purpose: recruitment portal for GEA that orchestrates candidate intake (links, forms, verification, Smart exports) while delegating authentication to the IAM GEA service.
- Stack: Django 5 + DRF backend acting as a thin Backend-for-Frontend proxy; React 19 + Vite + TypeScript frontend using Tailwind CSS v4 for styling.
- Structure: `backend/` contains Django project (`config/`) and API apps (`api/auth` already proxies IAM; upcoming recruitment modules will live here). `frontend/` hosts the Vite app with `src/modules` (auth, recruitment), reusable components, and Tailwind tokens in `src/styles/tailwind.css`.
- Authentication flow: backend exposes `/api/auth/login|logout|session` that call IAM via httpx and manage an HttpOnly cookie; frontend consumes them through `AuthProvider` with duplicate-session messaging.
- Branding: Tailwind theme defines the GEA palette plus Montserrat Variable font; logo assets live in `src/assets/`.
- External dependency: IAM stack runs separately in `/home/lavodnos/code/SERVICES IAM GEA` via Docker compose (API on 58000, perimeter on 58080).
