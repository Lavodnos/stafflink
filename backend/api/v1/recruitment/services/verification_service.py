"""Servicios para la verificación Backoffice."""

from __future__ import annotations

from django.utils import timezone
from rest_framework import serializers

from api.shared.audit import record_audit

from .. import models

QUEUE_STATUSES = (
    models.Applicant.Status.SUBMITTED,
    models.Applicant.Status.UNDER_REVIEW,
)


def get_queue_queryset():
    return (
        models.Applicant.objects.select_related(
            "link", "link__campaign", "verification"
        )
        .filter(status__in=QUEUE_STATUSES)
        .order_by("submitted_at")
    )


def update_applicant_controlled(
    *,
    applicant: models.Applicant,
    data: dict[str, str],
    actor_id: str | None,
    actor_name: str,
) -> models.Applicant:
    allowed_fields = {
        "first_name",
        "last_name",
        "second_last_name",
        "email",
        "phone",
        "alternate_phone",
    }
    modified = {}
    for field, value in data.items():
        if field not in allowed_fields:
            continue
        setattr(applicant, field, value)
        modified[field] = value
    if not modified:
        return applicant
    applicant.save(update_fields=list(modified.keys()) + ["updated_at"])
    record_audit(
        entity_type="applicant",
        entity_id=str(applicant.id),
        action="bo_update",
        actor_id=actor_id,
        actor_name=actor_name,
        payload=modified,
    )
    return applicant


def _ensure_verification(applicant: models.Applicant) -> models.Verification:
    verification, _ = models.Verification.objects.get_or_create(applicant=applicant)
    return verification


def register_decision(
    *,
    applicant: models.Applicant,
    status: str,
    reason: str,
    actor_id: str | None,
    actor_name: str,
) -> models.Applicant:
    verification = _ensure_verification(applicant)
    if status not in models.Verification.Status.values:
        raise serializers.ValidationError("Estado de verificación inválido")
    verification.status = status
    verification.reviewed_by = actor_id
    verification.reviewed_by_name = actor_name
    verification.decision_reason = reason
    verification.decided_at = timezone.now()
    verification.save()

    if status == models.Verification.Status.APPROVED:
        applicant.status = models.Applicant.Status.VERIFIED_OK
    elif status == models.Verification.Status.OBSERVED:
        applicant.status = models.Applicant.Status.OBSERVED
    else:
        applicant.status = models.Applicant.Status.REJECTED
    applicant.last_reviewed_at = timezone.now()
    applicant.save(update_fields=["status", "last_reviewed_at", "updated_at"])

    record_audit(
        entity_type="verification",
        entity_id=str(verification.id),
        action="decision",
        actor_id=actor_id,
        actor_name=actor_name,
        payload={"status": status, "reason": reason},
    )
    return applicant


def request_correction(
    *, applicant: models.Applicant, message: str, actor_id: str | None, actor_name: str
) -> models.Applicant:
    verification = _ensure_verification(applicant)
    verification.status = models.Verification.Status.OBSERVED
    verification.requested_correction_by = actor_id
    verification.requested_correction_at = timezone.now()
    verification.decision_reason = message
    verification.save()
    applicant.status = models.Applicant.Status.OBSERVED
    applicant.save(update_fields=["status", "updated_at"])
    record_audit(
        entity_type="verification",
        entity_id=str(verification.id),
        action="request_correction",
        actor_id=actor_id,
        actor_name=actor_name,
        payload={"message": message},
    )
    return applicant
