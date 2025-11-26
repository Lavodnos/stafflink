from __future__ import annotations

from rest_framework import mixins, viewsets

from .. import models
from ..permissions import permission_class
from ..serializers.campaign_serializer import CampaignSerializer
from ..services import campaign_service


class CampaignViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = models.Campaign.objects.all()
    serializer_class = CampaignSerializer
    permission_classes = [permission_class("campaigns.read")]

    def get_queryset(self):
        return campaign_service.list_campaigns()

    def get_permissions(self):
        if self.action in {"create", "update", "partial_update"}:
            return [permission_class("campaigns.manage")()]
        return super().get_permissions()
