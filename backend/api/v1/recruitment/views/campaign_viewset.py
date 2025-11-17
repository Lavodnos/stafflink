from __future__ import annotations

from rest_framework import viewsets

from ..permissions import permission_class
from ..serializers.campaign_serializer import CampaignSerializer
from ..services import campaign_service


class CampaignViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CampaignSerializer
    permission_classes = [permission_class("campaigns.read")]

    def get_queryset(self):
        return campaign_service.list_campaigns()
