# IAM Permissions Strategy for Stafflink
- Permissions are defined per resource/action (e.g., `links.create`, `links.read_own`, `candidates.read_documents`, `verification.decide`, `exports.download`, `audit.read_sensitive`). This granular approach lets IAM manage read vs write vs decision independently.
- Roles:
  - **Recruiter**: can create/manage their own links, read their candidates, run exports for their links. No verification or audit access.
  - **BackOffice**: view all links/candidates, perform verification (decisions, request corrections), run exports, view general audit logs. Cannot create/edit links.
  - **Admin**: superset of Recruiter + BO plus delete candidates, view sensitive audits, and manage roles/permissions.
- Implementation: create the Stafflink application in IAM, seed the permissions per module (campaigns, links, candidates, verification, exports, audit), map them to roles via `role_permission`, and assign users via `user_role`. Stafflink backend and frontend read these claims from IAM tokens to enforce route guards and DRF permissions.