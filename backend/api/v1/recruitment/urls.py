"""Router y rutas del módulo de reclutamiento."""

from __future__ import annotations

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views.campaign_viewset import CampaignViewSet
from .views.export_viewset import SmartExportBatchViewSet
from .views.link_viewset import RecruitmentLinkViewSet
from .views.public_views import (PublicApplicantCreateView,
                                 PublicApplicantDetailView,
                                 PublicApplicantSubmitView,
                                 PublicLinkDetailView, PublicUploadView)
from .views.verification_viewset import VerificationViewSet

router = DefaultRouter()
router.register(r"campaigns", CampaignViewSet, basename="campaigns")
router.register(r"links", RecruitmentLinkViewSet, basename="links")
router.register(r"verify", VerificationViewSet, basename="verify")
router.register(
    r"exports/smart/batches", SmartExportBatchViewSet, basename="smart-export-batches"
)

public_patterns = (
    [
        path("links/<slug:slug>/", PublicLinkDetailView.as_view(), name="public-link"),
        path(
            "candidates",
            PublicApplicantCreateView.as_view(),
            name="public-candidate-create",
        ),
        path(
            "candidates/<uuid:id>",
            PublicApplicantDetailView.as_view(),
            name="public-candidate-detail",
        ),
        path(
            "candidates/<uuid:id>/submit",
            PublicApplicantSubmitView.as_view(),
            name="public-candidate-submit",
        ),
        path("uploads", PublicUploadView.as_view(), name="public-upload"),
    ],
    "public",
)

urlpatterns = [
    path("", include(router.urls)),
    path("public/", include(public_patterns)),
]
