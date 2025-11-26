Added Candidates module (Nov 2025):
- New API/types in src/modules/candidates/api.ts (candidate, documents, process, assignment), endpoints for list/detail, patch subresources.
- Hooks with TanStack Query: useCandidates, useCandidate(id), useUpdateCandidate/Documents/Process/Assignment (cache updates) in src/modules/candidates/hooks.ts.
- New page src/pages/CandidatesPage.tsx: list of candidates, detail panel with tabs (Datos, Documentos, Proceso, Contrato). Uses shared UI components and React Hook Form; lists use cached queries; updates via mutations.
- App route /candidates added in src/App.tsx (RequireAuth); Dashboard already links to it.
- Build passes after changes (npm run build).
Pending: fine-grained permission guards and deeper validation/schemas.