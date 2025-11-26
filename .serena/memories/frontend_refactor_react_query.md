Refactor frontend (Nov 2025):
- Added TanStack Query client (src/lib/queryClient.ts) and wrapped app in QueryClientProvider (src/main.tsx). Installed @tanstack/react-query, @hookform/resolvers, zod (unused yet), clsx.
- Created shared UI components (Card, SectionHeader, Field, Input, Select, Textarea, Pill) in src/components/ui.tsx using Tailwind tokens.
- Added query hooks for campaigns/blacklist/links in src/modules/*/hooks.ts (CRUD mutations update cache). Blacklist hook includes delete.
- Pages CampaignsPage, BlacklistPage, LinksPage now use React Hook Form + React Query hooks, shared UI; uppercase normalization via setValue; better error handling.
- LinksPage rebuild to use LinkPayload + mutations; Campaigns/Blacklist similar.
- Reinstalled node_modules (moved old node_modules -> node_modules_old due to Windows exe delete issue), npm install, build now succeeds (`npm run build`).
- Pending: candidate module still not implemented; per-permission guards still to add; could remove node_modules_old manually if space is concern.