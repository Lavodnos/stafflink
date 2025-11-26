"""Router del módulo de reclutamiento."""

from __future__ import annotations

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views.blacklist_viewset import BlacklistViewSet
from .views.campaign_viewset import CampaignViewSet
from .views.candidate_viewset import CandidateViewSet
from .views.link_viewset import LinkViewSet
from .views.public_views import (PublicCandidateCreateView,
                                 PublicLinkDetailView)

router = DefaultRouter()
router.register(r"campaigns", CampaignViewSet, basename="campaigns")
router.register(r"blacklist", BlacklistViewSet, basename="blacklist")
router.register(r"links", LinkViewSet, basename="links")
router.register(r"candidates", CandidateViewSet, basename="candidates")

public_patterns = (
    [
        path("links/<slug:slug>/", PublicLinkDetailView.as_view(), name="public-link"),
        path("candidates", PublicCandidateCreateView.as_view(), name="public-candidate"),
    ],
    "public",
)

urlpatterns = [
    path("", include(router.urls)),
    path("public/", include(public_patterns)),
]
