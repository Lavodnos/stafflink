"""Servicios para postulación pública (ONE-PASS)."""

from __future__ import annotations

from typing import Any

from django.utils import timezone
from rest_framework import serializers

from api.shared.audit import record_audit

from .. import models
from ..storage import get_storage_client
from ..validators.document_validator import validate_document
from ..validators.file_validator import validate_file

REQUIRED_DOCUMENTS: dict[str, tuple[str, str]] = {
    "dni": (
        "dni_front",
        "dni_back",
    ),
    "ce": (
        "ce_front",
        "ce_back",
    ),
}


def create_applicant(
    *, link: models.RecruitmentLink, data: dict[str, Any]
) -> models.Applicant:
    document_number = validate_document(data["document_type"], data["document_number"])
    payload = {**data, "document_number": document_number, "link": link}
    applicant = models.Applicant.objects.create(**payload)
    return applicant


def update_applicant(
    *, applicant: models.Applicant, data: dict[str, Any]
) -> models.Applicant:
    allowed_statuses = {
        "draft",
        "submitted",
    }
    if applicant.status not in allowed_statuses:
        raise serializers.ValidationError(
            "No se puede editar un postulante en este estado."
        )
    if "document_number" in data:
        doc_type = data.get("document_type", applicant.document_type)
        data["document_number"] = validate_document(doc_type, data["document_number"])
    for field, value in data.items():
        setattr(applicant, field, value)
    applicant.save()
    return applicant


def upload_document(
    *, applicant: models.Applicant, kind: str, uploaded_file
) -> models.ApplicantDocument:
    validate_file(uploaded_file)
    storage = get_storage_client()
    destination = (
        f"{applicant.id}/{kind}-{timezone.now().timestamp()}-{uploaded_file.name}"
    )
    uploaded_file.seek(0)
    saved_path = storage.save(
        uploaded_file.file,
        destination=destination,
        content_type=uploaded_file.content_type or "application/octet-stream",
    )
    document = models.ApplicantDocument.objects.create(
        applicant=applicant,
        kind=kind,
        file_path=saved_path,
        original_name=uploaded_file.name,
        content_type=uploaded_file.content_type or "application/octet-stream",
        size_bytes=uploaded_file.size,
    )
    return document


def submit_applicant(
    *,
    applicant: models.Applicant,
    lpdp_consent: bool,
    ip_address: str | None,
    user_agent: str | None,
) -> models.Applicant:
    if not lpdp_consent:
        raise serializers.ValidationError("Debe aceptar el consentimiento LPDP.")
    required: tuple[str, ...] = REQUIRED_DOCUMENTS.get(
        applicant.document_type, tuple()
    )
    existing = set(applicant.documents.values_list("kind", flat=True))
    missing = [doc for doc in required if doc not in existing]
    if missing:
        raise serializers.ValidationError("Faltan documentos obligatorios.")
    applicant.status = models.Applicant.Status.SUBMITTED
    applicant.lpdp_consent = True
    applicant.lpdp_accepted_at = timezone.now()
    applicant.submitted_at = timezone.now()
    applicant.origin_ip = ip_address
    applicant.user_agent = user_agent or ""
    applicant.save(
        update_fields=[
            "status",
            "lpdp_consent",
            "lpdp_accepted_at",
            "submitted_at",
            "origin_ip",
            "user_agent",
            "updated_at",
        ]
    )
    models.Verification.objects.get_or_create(applicant=applicant)
    record_audit(
        entity_type="applicant",
        entity_id=str(applicant.id),
        action="submit",
        actor_id=None,
        actor_name="public_form",
        payload={"link_id": str(applicant.link_id)},
        ip_address=ip_address,
        user_agent=user_agent,
    )
    return applicant
