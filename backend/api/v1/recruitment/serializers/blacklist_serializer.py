from __future__ import annotations

from rest_framework import serializers

from .. import models


class BlacklistSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Blacklist
        fields = [
            "id",
            "dni",
            "nombres",
            "descripcion",
            "estado",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "created_at", "updated_at")
