"""Servicios para exportar postulantes a Smart Boleta."""

from __future__ import annotations

import uuid
from typing import Iterable

from django.db import transaction
from rest_framework import serializers

from api.shared.audit import record_audit
from integrations.smart.client import SmartClient
from integrations.smart.formatter import SmartFormatter

from .. import models
from ..serializers.export_serializers import ApplicantExportRowSerializer


class ExportService:
    def __init__(self, *, output_dir: str) -> None:
        self.formatter = SmartFormatter()
        self.client = SmartClient(output_dir=output_dir)

    def create_batch(
        self,
        *,
        applicants: Iterable[models.Applicant],
        actor_id: str | None,
        actor_name: str,
        notes: str = "",
    ) -> models.SmartExportBatch:
        applicants = list(applicants)
        if not applicants:
            raise serializers.ValidationError("No hay postulantes para exportar.")
        for applicant in applicants:
            if applicant.status != models.Applicant.Status.VERIFIED_OK:
                raise serializers.ValidationError(
                    "Solo se pueden exportar postulantes verificados."
                )

        batch_code = f"BATCH-{uuid.uuid4().hex[:8].upper()}"
        with transaction.atomic():
            batch = models.SmartExportBatch.objects.create(
                batch_code=batch_code,
                status=models.SmartExportBatch.Status.GENERATED,
                generated_by=actor_id,
                generated_by_name=actor_name,
                notes=notes,
            )
            rows = ApplicantExportRowSerializer(applicants, many=True).data
            csv_rows = self.formatter.build_rows(rows)
            file_path = self.client.save_batch(batch_code, csv_rows)
            batch.file_path = file_path
            batch.save(update_fields=["file_path"])

            for applicant in applicants:
                models.SmartExportBatchItem.objects.create(
                    batch=batch, applicant=applicant
                )
                applicant.status = models.Applicant.Status.EXPORTED
                applicant.save(update_fields=["status", "updated_at"])

            record_audit(
                entity_type="export",
                entity_id=str(batch.id),
                action="create_batch",
                actor_id=actor_id,
                actor_name=actor_name,
                payload={"batch_code": batch_code, "count": len(applicants)},
            )
        return batch

    def mark_delivered(
        self, batch: models.SmartExportBatch, actor_id: str | None, actor_name: str
    ) -> models.SmartExportBatch:
        batch.status = models.SmartExportBatch.Status.DELIVERED
        batch.save(update_fields=["status", "updated_at"])
        record_audit(
            entity_type="export",
            entity_id=str(batch.id),
            action="mark_delivered",
            actor_id=actor_id,
            actor_name=actor_name,
            payload={},
        )
        return batch
