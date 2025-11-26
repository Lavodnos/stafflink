from __future__ import annotations

from rest_framework import serializers

from .. import models
from ..request_context import get_user_id, get_user_name
from ..serializers.campaign_serializer import CampaignSerializer
from ..services import link_service


class LinkSerializer(serializers.ModelSerializer):
    campaign = serializers.PrimaryKeyRelatedField(
        queryset=models.Campaign.objects.all()
    )

    class Meta:
        model = models.Link
        fields = [
            "id",
            "campaign",
            "grupo",
            "user_id",
            "user_name",
            "periodo",
            "slug",
            "titulo",
            "cuotas",
            "semana_trabajo",
            "expires_at",
            "notes",
            "modalidad",
            "condicion",
            "estado",
            "hora_gestion",
            "descanso",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "estado", "created_at", "updated_at")

    def create(self, validated_data):
        request = self.context["request"]
        actor_id = get_user_id(request)
        actor_name = get_user_name(request)
        return link_service.create_link(
            data=validated_data, actor_id=actor_id, actor_name=actor_name
        )

    def update(self, instance, validated_data):
        request = self.context["request"]
        actor_id = get_user_id(request)
        return link_service.update_link(
            link=instance, data=validated_data, actor_id=actor_id
        )


class LinkDetailSerializer(LinkSerializer):
    campaign = CampaignSerializer(read_only=True)


class LinkActionSerializer(serializers.Serializer):
    motivo = serializers.CharField(required=False, allow_blank=True)
