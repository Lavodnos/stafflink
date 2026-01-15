"""Helper factories for recruitment tests."""

from __future__ import annotations

import uuid
from datetime import timedelta

from django.utils import timezone

from api.v1.recruitment import models


def create_campaign(codigo: str = "CMP1", nombre: str = "Campaign") -> models.Campaign:
    return models.Campaign.objects.create(codigo=codigo, nombre=nombre)


def create_convocatoria(
    campaign: models.Campaign,
    *,
    slug: str = "test-convocatoria",
    owner_id: uuid.UUID | None = None,
    status: str = models.Link.Estado.ACTIVO,
    expires_at=None,
    **overrides,
) -> models.Link:
    owner_id = owner_id or uuid.uuid4()
    expires_at = expires_at or timezone.now() + timedelta(days=1)
    data = {
        "campaign": campaign,
        "slug": slug,
        "titulo": "Test Convocatoria",
        "user_id": owner_id,
        "estado": status,
        "expires_at": expires_at,
    }
    data.update(overrides)
    return models.Link.objects.create(**data)


def create_applicant(
    link: models.Link,
    *,
    document_type: str = "dni",
    document_number: str = "12345678",
    **overrides,
) -> models.Candidate:
    data = {
        "link": link,
        "tipo_documento": document_type,
        "numero_documento": document_number,
        "apellido_paterno": "TEST",
        "apellido_materno": "USER",
        "nombres_completos": "TEST USER",
        "telefono": "999888777",
        "telefono_referencia": "988888888",
        "email": "test@example.com",
        "estado_civil": "SOLTERO",
        "nivel_academico": "UNIVERSITARIO EN CURSO",
        "lugar_residencia": "LIMA",
        "distrito": "LIMA",
        "direccion": "AV SIEMPRE VIVA",
    }
    data.update(overrides)
    return models.Candidate.objects.create(**data)


def attach_document(applicant: models.Candidate, kind: str) -> models.CandidateDocuments:
    return models.CandidateDocuments.objects.create(
        applicant=applicant,
        kind=kind,
        file_path=f"{applicant.id}/{kind}.pdf",
        original_name=f"{kind}.pdf",
        content_type="application/pdf",
        size_bytes=1234,
    )
