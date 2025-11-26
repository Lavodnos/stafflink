from __future__ import annotations

from rest_framework import viewsets

from .. import models
from ..permissions import permission_class
from ..serializers.blacklist_serializer import BlacklistSerializer


class BlacklistViewSet(viewsets.ModelViewSet):
    queryset = models.Blacklist.objects.all().order_by("-updated_at")
    serializer_class = BlacklistSerializer
    permission_classes = [permission_class("blacklist.read")]

    def get_permissions(self):
        if self.action in {"create", "update", "partial_update", "destroy"}:
            return [permission_class("blacklist.manage")()]
        return super().get_permissions()
