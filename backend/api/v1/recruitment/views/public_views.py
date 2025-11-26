from __future__ import annotations

from django.utils import timezone
from rest_framework import generics, permissions

from .. import models
from ..serializers.public_serializers import (PublicCandidateSerializer,
                                              PublicLinkSerializer)


class PublicLinkDetailView(generics.RetrieveAPIView):
    serializer_class = PublicLinkSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        return models.Link.objects.select_related("campaign")

    def get_object(self):
        link = super().get_object()
        if (
            link.estado != models.Link.Estado.ACTIVO
            or link.expires_at < timezone.now()
        ):
            raise generics.Http404
        return link


class PublicCandidateCreateView(generics.CreateAPIView):
    serializer_class = PublicCandidateSerializer
    permission_classes = [permissions.AllowAny]
