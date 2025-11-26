"""Servicios para la gestión de links de reclutamiento."""

from __future__ import annotations

import uuid
from typing import Any

from django.db import transaction
from django.utils.text import slugify

from rest_framework import serializers

from .. import models


def _generate_slug(title: str) -> str:
    base = slugify(title) or "link"
    base = base[:40]
    return f"{base}-{uuid.uuid4().hex[:6]}"


def create_link(
    *, data: dict[str, Any], actor_id: str | None, actor_name: str
) -> models.Link:
    payload = {**data}
    payload.setdefault("slug", _generate_slug(payload["titulo"]))
    payload.setdefault("user_id", actor_id)
    payload.setdefault("user_name", actor_name)
    payload["created_by"] = actor_id
    payload["updated_by"] = actor_id
    with transaction.atomic():
        link = models.Link.objects.create(**payload)
    return link


def update_link(
    *, link: models.Link, data: dict[str, Any], actor_id: str | None
) -> models.Link:
    for field, value in data.items():
        setattr(link, field, value)
    link.updated_by = actor_id
    link.save()
    return link


def set_status(*, link: models.Link, estado: str, actor_id: str | None) -> models.Link:
    if link.estado == estado:
        return link
    if estado not in models.Link.Estado.values:
        raise serializers.ValidationError("Estado de link inválido.")
    link.estado = estado
    link.updated_by = actor_id
    link.save(update_fields=["estado", "updated_by", "updated_at"])
    return link
