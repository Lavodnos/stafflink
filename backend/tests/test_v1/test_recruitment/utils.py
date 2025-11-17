"""Helper factories for recruitment tests."""

from __future__ import annotations

import uuid
from datetime import timedelta

from django.utils import timezone

from api.v1.recruitment import models


def create_campaign(code: str = "CMP1", name: str = "Campaign") -> models.Campaign:
    return models.Campaign.objects.create(code=code, name=name)


def create_link(
    campaign: models.Campaign,
    *,
    slug: str = "test-link",
    owner_id: uuid.UUID | None = None,
    status: str = "active",
    expires_at=None,
    **overrides,
) -> models.RecruitmentLink:
    owner_id = owner_id or uuid.uuid4()
    expires_at = expires_at or timezone.now() + timedelta(days=1)
    data = {
        "campaign": campaign,
        "slug": slug,
        "title": "Test Link",
        "owner_id": owner_id,
        "status": status,
        "expires_at": expires_at,
    }
    data.update(overrides)
    return models.RecruitmentLink.objects.create(**data)


def create_applicant(
    link: models.RecruitmentLink,
    *,
    status: str = "draft",
    document_type: str = "dni",
    document_number: str = "12345678",
    **overrides,
) -> models.Applicant:
    data = {
        "link": link,
        "first_name": "Test",
        "last_name": "User",
        "document_type": document_type,
        "document_number": document_number,
        "email": "test@example.com",
        "phone": "999888777",
        "status": status,
    }
    data.update(overrides)
    return models.Applicant.objects.create(**data)


def attach_document(applicant: models.Applicant, kind: str) -> models.ApplicantDocument:
    return models.ApplicantDocument.objects.create(
        applicant=applicant,
        kind=kind,
        file_path=f"{applicant.id}/{kind}.pdf",
        original_name=f"{kind}.pdf",
        content_type="application/pdf",
        size_bytes=1234,
    )
