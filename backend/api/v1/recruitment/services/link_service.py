"""Servicios para la gestión de links y grupos."""

from __future__ import annotations

import uuid
from typing import Any

from django.db import transaction
from django.utils.text import slugify

from api.shared.audit import record_audit

from .. import models
from ..request_context import get_client_ip


def _generate_slug(title: str) -> str:
    base = slugify(title) or "grupo"
    base = base[:40]
    return f"{base}-{uuid.uuid4().hex[:6]}"


def create_link(*, data: dict[str, Any], request) -> models.RecruitmentLink:
    owner_id = data.pop("owner_id", None) or get_request_owner_id(request)
    owner_name = data.pop("owner_name", None) or request.headers.get(
        "X-Stafflink-User-Name", ""
    )
    slug = data.get("slug") or _generate_slug(data["title"])
    data["slug"] = slug
    with transaction.atomic():
        link = models.RecruitmentLink.objects.create(
            owner_id=owner_id,
            owner_name=owner_name,
            **data,
        )
        record_audit(
            entity_type="link",
            entity_id=str(link.id),
            action="create",
            actor_id=owner_id,
            actor_name=owner_name,
            payload={"slug": link.slug},
            ip_address=get_client_ip(request),
        )
    return link


def update_link(
    *,
    link: models.RecruitmentLink,
    data: dict[str, Any],
    actor_id: str | None,
    actor_name: str,
) -> models.RecruitmentLink:
    for field, value in data.items():
        setattr(link, field, value)
    link.save(update_fields=list(data.keys()) + ["updated_at"])
    record_audit(
        entity_type="link",
        entity_id=str(link.id),
        action="update",
        actor_id=actor_id,
        actor_name=actor_name,
        payload=data,
    )
    return link


def expire_link(
    link: models.RecruitmentLink, *, actor_id: str | None, actor_name: str
) -> models.RecruitmentLink:
    if link.status == models.RecruitmentLink.LinkStatus.EXPIRED:
        return link
    link.status = models.RecruitmentLink.LinkStatus.EXPIRED
    link.expires_automatically = False
    link.save(update_fields=["status", "expires_automatically", "updated_at"])
    record_audit(
        entity_type="link",
        entity_id=str(link.id),
        action="expire",
        actor_id=actor_id,
        actor_name=actor_name,
        payload={},
    )
    return link


def revoke_link(
    link: models.RecruitmentLink, *, actor_id: str | None, actor_name: str
) -> models.RecruitmentLink:
    if link.status == models.RecruitmentLink.LinkStatus.REVOKED:
        return link
    link.status = models.RecruitmentLink.LinkStatus.REVOKED
    link.save(update_fields=["status", "updated_at"])
    record_audit(
        entity_type="link",
        entity_id=str(link.id),
        action="revoke",
        actor_id=actor_id,
        actor_name=actor_name,
        payload={},
    )
    return link


def get_request_owner_id(request) -> str:
    from ..request_context import get_user_id

    user_id = get_user_id(request)
    if not user_id:
        raise ValueError("No se pudo determinar el usuario autenticado")
    return user_id
