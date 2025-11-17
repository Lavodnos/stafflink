"""Cliente base para mandar correos desde Stafflink."""

from __future__ import annotations


class EmailClient:
    def send(
        self, *, to: str, subject: str, body: str
    ) -> None:  # pragma: no cover - placeholder
        # Implementar integración real (SMTP, Sendgrid, etc.)
        print(f"[email placeholder] to={to} subject={subject}")
