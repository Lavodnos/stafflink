"""Servicios para la gestión de convocatorias de reclutamiento."""

from __future__ import annotations

import uuid
from typing import Any

from django.db import transaction
from django.utils.text import slugify

from rest_framework import serializers

from .. import models


def _generate_slug(data: dict[str, Any]) -> str:
    parts: list[str] = []
    campaign = data.get("campaign")
    if campaign:
        parts.append(str(campaign))
    for key in (
        "titulo",
        "grupo",
        "periodo",
        "modalidad",
        "condicion",
        "hora_gestion",
        "descanso",
    ):
        value = data.get(key)
        if value:
            parts.append(str(value))
    semana = data.get("semana_trabajo")
    if semana:
        parts.append(f"sem{semana}")
    base = slugify(" ".join(parts)) or "convocatoria"
    base = base[:40]
    return f"{base}-{uuid.uuid4().hex[:6]}"


def create_convocatoria(
    *, data: dict[str, Any], actor_id: str | None, actor_name: str
) -> models.Link:
    payload = {**data}
    if not payload.get("slug"):
        payload["slug"] = _generate_slug(payload)
    payload.setdefault("user_id", actor_id)
    payload.setdefault("user_name", actor_name)
    payload["created_by"] = actor_id
    payload["updated_by"] = actor_id
    with transaction.atomic():
        convocatoria = models.Link.objects.create(**payload)
    return convocatoria


def update_convocatoria(
    *, convocatoria: models.Link, data: dict[str, Any], actor_id: str | None
) -> models.Link:
    for field, value in data.items():
        setattr(convocatoria, field, value)
    convocatoria.updated_by = actor_id
    convocatoria.save()
    return convocatoria


def set_status(
    *, convocatoria: models.Link, estado: str, actor_id: str | None
) -> models.Link:
    if convocatoria.estado == estado:
        return convocatoria
    if estado not in models.Link.Estado.values:
        raise serializers.ValidationError(
            {"estado": ["Estado de convocatoria inválido."]}
        )
    convocatoria.estado = estado
    convocatoria.updated_by = actor_id
    convocatoria.save(update_fields=["estado", "updated_by", "updated_at"])
    return convocatoria
