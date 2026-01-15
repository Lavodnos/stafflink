"""Router del módulo de reclutamiento."""

from __future__ import annotations

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views.blacklist_viewset import BlacklistViewSet
from .views.campaign_viewset import CampaignViewSet
from .views.candidate_viewset import CandidateViewSet
from .views.convocatoria_viewset import ConvocatoriaViewSet
from .views.iam_views import IAMUsersView
from .views.public_views import (
    PublicCandidateCreateView,
    PublicConvocatoriaDetailView,
)

router = DefaultRouter()
router.register(r"campaigns", CampaignViewSet, basename="campaigns")
router.register(r"blacklist", BlacklistViewSet, basename="blacklist")
router.register(r"convocatorias", ConvocatoriaViewSet, basename="convocatorias")
router.register(r"candidates", CandidateViewSet, basename="candidates")

public_patterns = (
    [
        path(
            "convocatorias/<slug:slug>/",
            PublicConvocatoriaDetailView.as_view(),
            name="public-convocatoria",
        ),
        path(
            "candidates", PublicCandidateCreateView.as_view(), name="public-candidate"
        ),
    ],
    "public",
)

urlpatterns = [
    path("iam/users/", IAMUsersView.as_view(), name="iam-users"),
    path("", include(router.urls)),
    path("public/", include(public_patterns)),
]
