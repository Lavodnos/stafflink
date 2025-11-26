from __future__ import annotations

from rest_framework import serializers

from .. import models


class CampaignSerializer(serializers.ModelSerializer):
    def validate_codigo(self, value: str | None) -> str | None:
        """Normaliza el código: mayúsculas y permite null/blank."""
        if value is None:
            return None
        value = value.strip().upper()
        return value or None

    class Meta:
        model = models.Campaign
        fields = [
            "id",
            "codigo",
            "area",
            "nombre",
            "sede",
            "estado",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "created_at", "updated_at")
        extra_kwargs = {
            "codigo": {
                "allow_null": True,
                "allow_blank": True,
                "required": False,
            }
        }
