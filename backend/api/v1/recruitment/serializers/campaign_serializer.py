from __future__ import annotations

from rest_framework import serializers

from .. import models


class CampaignSerializer(serializers.ModelSerializer):
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
