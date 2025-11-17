"""Ayudantes para registrar auditorías (RQ-X.1)."""

from __future__ import annotations

from typing import Any

from django.db import transaction

from api.v1.recruitment.models import AuditLog


def record_audit(
    *,
    entity_type: str | AuditLog.Entity,
    entity_id: str,
    action: str,
    actor_id: str | None = None,
    actor_name: str = "",
    payload: dict[str, Any] | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> None:
    """Inserta un registro de auditoría de forma transaccional."""

    with transaction.atomic():
        AuditLog.objects.create(
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            actor_id=actor_id,
            actor_name=actor_name,
            payload=payload or {},
            ip_address=ip_address,
            user_agent=user_agent or "",
        )
