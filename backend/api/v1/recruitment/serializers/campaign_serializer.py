from __future__ import annotations

from rest_framework import serializers

from .. import models


class CampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Campaign
        fields = ["id", "code", "name", "site_name", "description", "is_active"]
        read_only_fields = fields
