"""Modelos del dominio de reclutamiento (modo ONE-PASS)."""

from __future__ import annotations

import uuid
from typing import Any

from django.core.validators import (MaxValueValidator, MinValueValidator,
                                    RegexValidator)
from django.db import models
from django.utils import timezone


class TimeStampedModel(models.Model):
    """Agrega campos de auditoría simples a los modelos."""

    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


def _empty_dict() -> dict[str, Any]:
    """Return a new dict for JSONField defaults."""

    return {}


class Campaign(TimeStampedModel):
    """Campaña y sede asociada a un grupo/link."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    site_name = models.CharField(max_length=255, blank=True, default="")
    description = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:  # pragma: no cover - para admin
        return f"{self.code} - {self.name}"


class RecruitmentLink(TimeStampedModel):
    """Link/QR que reciben los postulantes para un grupo específico."""

    class LinkStatus(models.TextChoices):
        ACTIVE = "active", "Activa"
        EXPIRED = "expired", "Vencida"
        REVOKED = "revoked", "Anulada"

    class Modality(models.TextChoices):
        ONSITE = "onsite", "Presencial"
        HYBRID = "hybrid", "Híbrido"
        REMOTE = "remote", "Remoto"

    class EmploymentCondition(models.TextChoices):
        PAYROLL = "payroll", "Planilla"
        CONTRACTOR = "contractor", "Honorarios"

    class Weekday(models.TextChoices):
        MONDAY = "monday", "Lunes"
        TUESDAY = "tuesday", "Martes"
        WEDNESDAY = "wednesday", "Miércoles"
        THURSDAY = "thursday", "Jueves"
        FRIDAY = "friday", "Viernes"
        SATURDAY = "saturday", "Sábado"
        SUNDAY = "sunday", "Domingo"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(
        Campaign,
        on_delete=models.PROTECT,
        related_name="links",
        db_index=True,
    )
    slug = models.SlugField(
        max_length=64, unique=True, help_text="Identificador público del link"
    )
    title = models.CharField(max_length=255)
    owner_id = models.UUIDField(help_text="UUID del usuario IAM reclutador")
    owner_name = models.CharField(max_length=255, blank=True, default="")
    status = models.CharField(
        max_length=20,
        choices=LinkStatus.choices,
        default=LinkStatus.ACTIVE,
        db_index=True,
    )
    modality = models.CharField(
        max_length=20,
        choices=Modality.choices,
        default=Modality.ONSITE,
    )
    employment_condition = models.CharField(
        max_length=20,
        choices=EmploymentCondition.choices,
        default=EmploymentCondition.PAYROLL,
    )
    period_label = models.CharField(max_length=120, blank=True, default="")
    period_start = models.DateField(null=True, blank=True)
    period_end = models.DateField(null=True, blank=True)
    rest_day = models.CharField(
        max_length=12,
        choices=Weekday.choices,
        blank=True,
        default="",
    )
    work_week = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(53)],
    )
    quota = models.PositiveIntegerField(null=True, blank=True)
    expires_at = models.DateTimeField(
        help_text="Fecha/hora límite del link (America/Lima)"
    )
    expires_automatically = models.BooleanField(default=True)
    qr_reference = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Referencia al código QR almacenado en el frontend/perimeter",
    )
    notes = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "expires_at"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.title} ({self.slug})"


class Applicant(TimeStampedModel):
    """Postulante que llena el formulario ONE-PASS."""

    class DocumentType(models.TextChoices):
        DNI = "dni", "DNI"
        CE = "ce", "Carné de extranjería"

    class Status(models.TextChoices):
        DRAFT = "draft", "Borrador"
        SUBMITTED = "submitted", "Enviado"
        UNDER_REVIEW = "under_review", "En revisión"
        VERIFIED_OK = "verified_ok", "Verificado"
        OBSERVED = "observed", "Observado"
        REJECTED = "rejected", "Rechazado"
        EXPORTED = "exported", "Exportado"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    link = models.ForeignKey(
        RecruitmentLink,
        on_delete=models.CASCADE,
        related_name="applicants",
        db_index=True,
    )
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    second_last_name = models.CharField(max_length=150, blank=True, default="")
    document_type = models.CharField(max_length=10, choices=DocumentType.choices)
    document_number = models.CharField(
        max_length=16,
        validators=[RegexValidator(r"^[0-9A-Za-z]{4,16}$", "Formato inválido")],
    )
    birth_date = models.DateField(null=True, blank=True)
    email = models.EmailField()
    phone = models.CharField(max_length=32)
    alternate_phone = models.CharField(max_length=32, blank=True, default="")
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )
    submitted_at = models.DateTimeField(null=True, blank=True)
    last_reviewed_at = models.DateTimeField(null=True, blank=True)
    lpdp_consent = models.BooleanField(default=False)
    lpdp_accepted_at = models.DateTimeField(null=True, blank=True)
    origin_ip = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=512, blank=True, default="")
    metadata = models.JSONField(default=_empty_dict, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "-submitted_at"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["document_type", "document_number", "link"],
                name="unique_document_per_link",
            )
        ]

    def save(self, *args: Any, **kwargs: Any) -> None:
        self.first_name = (self.first_name or "").upper()
        self.last_name = (self.last_name or "").upper()
        self.second_last_name = (self.second_last_name or "").upper()
        self.document_number = (self.document_number or "").upper()
        super().save(*args, **kwargs)

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.last_name} {self.first_name}"


class ApplicantDocument(TimeStampedModel):
    """Documento adjunto (DNI/CE u otros)."""

    class DocumentKind(models.TextChoices):
        DNI_FRONT = "dni_front", "DNI anverso"
        DNI_BACK = "dni_back", "DNI reverso"
        CE_FRONT = "ce_front", "CE anverso"
        CE_BACK = "ce_back", "CE reverso"
        OTHER = "other", "Otro"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    applicant = models.ForeignKey(
        Applicant,
        on_delete=models.CASCADE,
        related_name="documents",
        db_index=True,
    )
    kind = models.CharField(max_length=20, choices=DocumentKind.choices)
    file_path = models.CharField(max_length=512)
    original_name = models.CharField(max_length=255)
    content_type = models.CharField(max_length=120)
    size_bytes = models.PositiveIntegerField()
    checksum = models.CharField(max_length=64, blank=True, default="")
    uploaded_by = models.UUIDField(null=True, blank=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.kind} ({self.original_name})"


class Verification(TimeStampedModel):
    """Resultado del análisis BO para un postulante."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente"
        APPROVED = "approved", "Apto"
        OBSERVED = "observed", "Observado"
        REJECTED = "rejected", "Rechazado"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    applicant = models.OneToOneField(
        Applicant,
        on_delete=models.CASCADE,
        related_name="verification",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    reviewed_by = models.UUIDField(null=True, blank=True)
    reviewed_by_name = models.CharField(max_length=255, blank=True, default="")
    decided_at = models.DateTimeField(null=True, blank=True)
    decision_reason = models.TextField(blank=True, default="")
    requested_correction_by = models.UUIDField(null=True, blank=True)
    requested_correction_at = models.DateTimeField(null=True, blank=True)
    risk_flags = models.JSONField(
        default=_empty_dict,
        blank=True,
        help_text="Resultados de deduplicación/blacklist",
    )
    notes = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self) -> str:  # pragma: no cover
        return f"Verification {self.status} for {self.applicant_id}"


class SmartExportBatch(TimeStampedModel):
    """Lote exportado a Smart Boleta."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente"
        GENERATED = "generated", "Generado"
        DELIVERED = "delivered", "Entregado"
        FAILED = "failed", "Fallido"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    batch_code = models.CharField(max_length=64, unique=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    generated_by = models.UUIDField(null=True, blank=True)
    generated_by_name = models.CharField(max_length=255, blank=True)
    generated_at = models.DateTimeField(default=timezone.now)
    file_path = models.CharField(max_length=512, blank=True)
    file_checksum = models.CharField(max_length=64, blank=True)
    notes = models.TextField(blank=True)
    applicants = models.ManyToManyField(
        Applicant,
        through="SmartExportBatchItem",
        related_name="export_batches",
    )

    class Meta:
        ordering = ["-generated_at"]

    def __str__(self) -> str:  # pragma: no cover
        return self.batch_code


class SmartExportBatchItem(TimeStampedModel):
    """Relación postulante ↔ lote con estado individual."""

    class Status(models.TextChoices):
        QUEUED = "queued", "En cola"
        EXPORTED = "exported", "Exportado"
        FAILED = "failed", "Fallido"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    batch = models.ForeignKey(
        SmartExportBatch,
        on_delete=models.CASCADE,
        related_name="items",
    )
    applicant = models.ForeignKey(
        Applicant,
        on_delete=models.CASCADE,
        related_name="export_items",
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.QUEUED
    )
    exported_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)

    class Meta:
        unique_together = ("batch", "applicant")

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.batch_id} -> {self.applicant_id} ({self.status})"


class AuditLog(TimeStampedModel):
    """Registro de auditoría para cualquier cambio relevante (RQ-X.1)."""

    class Entity(models.TextChoices):
        CAMPAIGN = "campaign", "Campaña"
        LINK = "link", "Link"
        APPLICANT = "applicant", "Postulante"
        VERIFICATION = "verification", "Verificación"
        EXPORT = "export", "Exportación"
        OTHER = "other", "Otros"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    entity_type = models.CharField(max_length=32, choices=Entity.choices)
    entity_id = models.UUIDField()
    action = models.CharField(max_length=64)
    actor_id = models.UUIDField(null=True, blank=True)
    actor_name = models.CharField(max_length=255, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=512, blank=True)
    payload = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["entity_type", "entity_id"]),
            models.Index(fields=["actor_id"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.entity_type}:{self.entity_id} - {self.action}"


__all__ = [
    "AuditLog",
    "Applicant",
    "ApplicantDocument",
    "Campaign",
    "RecruitmentLink",
    "SmartExportBatch",
    "SmartExportBatchItem",
    "Verification",
]
