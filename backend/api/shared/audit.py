"""Ayudantes para registrar auditorías (placeholder sin persistencia)."""

from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)


def record_audit(
    *,
    entity_type: str,
    entity_id: str,
    action: str,
    actor_id: str | None = None,
    actor_name: str = "",
    payload: dict[str, Any] | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> None:
    """Registra auditoría en log (sin DB).

    Si se requiere persistir, este helper se puede redirigir a un modelo/servicio.
    """

    logger.info(
        "audit",
        extra={
            "entity_type": entity_type,
            "entity_id": entity_id,
            "action": action,
            "actor_id": actor_id,
            "actor_name": actor_name,
            "payload": payload or {},
            "ip_address": ip_address,
            "user_agent": user_agent or "",
        },
    )
