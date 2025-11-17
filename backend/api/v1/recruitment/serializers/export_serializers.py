from __future__ import annotations

from rest_framework import serializers

from .. import models


class SmartExportBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.SmartExportBatch
        fields = [
            "id",
            "batch_code",
            "status",
            "generated_by_name",
            "generated_at",
            "notes",
        ]


class SmartExportBatchDetailSerializer(SmartExportBatchSerializer):
    items = serializers.SerializerMethodField()

    class Meta(SmartExportBatchSerializer.Meta):
        fields = SmartExportBatchSerializer.Meta.fields + ["file_path", "items"]

    def get_items(self, obj: models.SmartExportBatch):
        return [
            {
                "applicant_id": str(item.applicant_id),
                "status": item.status,
                "exported_at": item.exported_at,
            }
            for item in obj.items.all()
        ]


class SmartExportBatchCreateSerializer(serializers.Serializer):
    applicant_ids = serializers.ListField(
        child=serializers.UUIDField(), allow_empty=False
    )
    notes = serializers.CharField(required=False, allow_blank=True)


class ApplicantExportRowSerializer(serializers.ModelSerializer):
    campaign = serializers.CharField(source="link.campaign.name")
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = models.Applicant
        fields = ["document_number", "full_name", "campaign"]

    def get_full_name(self, obj: models.Applicant) -> str:
        parts = [obj.first_name, obj.last_name, obj.second_last_name]
        return " ".join(part for part in parts if part)
