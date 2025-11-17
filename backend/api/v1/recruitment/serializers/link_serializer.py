from __future__ import annotations

from rest_framework import serializers

from .. import models
from ..request_context import get_user_id, get_user_name
from ..serializers.campaign_serializer import CampaignSerializer
from ..services import link_service


class RecruitmentLinkSerializer(serializers.ModelSerializer):
    campaign = serializers.PrimaryKeyRelatedField(
        queryset=models.Campaign.objects.filter(is_active=True)
    )
    owner_name = serializers.CharField(read_only=True)
    owner_id = serializers.UUIDField(read_only=True)
    status = serializers.CharField(read_only=True)

    class Meta:
        model = models.RecruitmentLink
        fields = [
            "id",
            "campaign",
            "slug",
            "title",
            "owner_id",
            "owner_name",
            "status",
            "modality",
            "employment_condition",
            "period_label",
            "period_start",
            "period_end",
            "rest_day",
            "work_week",
            "quota",
            "expires_at",
            "expires_automatically",
            "qr_reference",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = (
            "id",
            "owner_id",
            "owner_name",
            "status",
            "created_at",
            "updated_at",
        )

    def create(self, validated_data):
        request = self.context["request"]
        return link_service.create_link(data=validated_data, request=request)


class RecruitmentLinkDetailSerializer(RecruitmentLinkSerializer):
    campaign = CampaignSerializer(read_only=True)


class RecruitmentLinkUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.RecruitmentLink
        fields = [
            "title",
            "modality",
            "employment_condition",
            "period_label",
            "period_start",
            "period_end",
            "rest_day",
            "work_week",
            "quota",
            "expires_at",
            "expires_automatically",
            "qr_reference",
            "notes",
        ]

    def update(self, instance, validated_data):
        request = self.context.get("request")
        actor_id = get_user_id(request) if request else None
        actor_name = get_user_name(request) if request else ""
        return link_service.update_link(
            link=instance,
            data=validated_data,
            actor_id=actor_id,
            actor_name=actor_name,
        )


class LinkActionSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True)
