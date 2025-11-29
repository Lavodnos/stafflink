# UI TailAdmin migration status (frontend)

- Adopted TailAdmin look & feel (light/dark), tokens moved to `src/styles/tailwind.css` with navy dark palette (#0b1220/#0f172a backgrounds, #1f2a3d borders, #e8eefc text). Inputs/cards/pills/buttons updated; Shell/Header/Sidebar use new colors.
- Layout: using AppLayout (Sidebar/Header). Theme toggle works. Icons via vite-plugin-svgr. Sidebar/Header adjusted for dark navy.
- Lists reworked to TailAdmin tables:
  - Campañas: table with search/filter; button “Crear campaña” goes to /campaigns/new; form only on /campaigns/new.
  - Links: same pattern; /links/new for form.
  - Blacklist: same pattern; /blacklist/new for form.
  - Candidatos: table listing; /candidates/new placeholder for create. Detail panel remains on selection.
- Routes added: /campaigns/new, /links/new, /blacklist/new, /candidates/new.
- Dashboard: added TailAdmin-style metrics + charts using react-apexcharts. Metrics from react-query data (campaigns, links, candidates, blacklist). Chart 1 placeholder trend (static). Chart 2 links status active/inactive (live counts). Dark mode aware.
- SVG handling: vite-plugin-svgr enabled; imports use default `*.svg?react` and `src/types/svgr.d.ts` plus tsconfig types.
- Vitest config split: vite.config.ts without test block; vitest.config.ts handles tests. tsconfig.app includes vitest/globals and svgr types; tests excluded from build.
- Campaign payload no longer sends null for codigo.
- Lint/test/build: npm run lint/test/build pass as of last run.
- Pending: implement real create-flow for candidates (/candidates/new currently placeholder). Charts use placeholder trend data except link status.
- API endpoints available: /api/v1/{campaigns,links,candidates,blacklist,...} (DRF). No series endpoints; counts used for summary.
- Dark mode adjusted to match TailAdmin demo; contrast improved vs previous.
