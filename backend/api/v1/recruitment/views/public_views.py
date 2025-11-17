from __future__ import annotations

from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, response, status

from .. import models
from ..serializers.public_serializers import (ApplicantDraftSerializer,
                                              ApplicantPublicSerializer,
                                              ApplicantSubmitSerializer,
                                              ApplicantUpdateSerializer,
                                              ApplicantUploadSerializer,
                                              PublicLinkSerializer)
from ..services import applicant_service


class PublicLinkDetailView(generics.RetrieveAPIView):
    serializer_class = PublicLinkSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        return models.RecruitmentLink.objects.select_related("campaign")

    def get_object(self):
        link = super().get_object()
        if (
            link.status != models.RecruitmentLink.LinkStatus.ACTIVE
            or link.expires_at < timezone.now()
        ):
            raise generics.Http404
        return link


class PublicApplicantCreateView(generics.CreateAPIView):
    serializer_class = ApplicantDraftSerializer
    permission_classes = [permissions.AllowAny]


class PublicApplicantDetailView(generics.RetrieveUpdateAPIView):
    queryset = models.Applicant.objects.prefetch_related(
        "documents", "link", "link__campaign"
    )
    permission_classes = [permissions.AllowAny]
    lookup_field = "id"

    def get_serializer_class(self):
        if self.request.method == "GET":
            return ApplicantPublicSerializer
        return ApplicantUpdateSerializer

    def update(self, request, *args, **kwargs):
        applicant = self.get_object()
        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        applicant_service.update_applicant(
            applicant=applicant, data=serializer.validated_data
        )
        read_serializer = ApplicantPublicSerializer(applicant)
        return response.Response(read_serializer.data)


class PublicApplicantSubmitView(generics.GenericAPIView):
    serializer_class = ApplicantSubmitSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "id"
    queryset = models.Applicant.objects.all()

    def post(self, request, *args, **kwargs):
        applicant = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        applicant_service.submit_applicant(
            applicant=applicant,
            lpdp_consent=serializer.validated_data["lpdp_consent"],
            ip_address=request.META.get("REMOTE_ADDR"),
            user_agent=request.META.get("HTTP_USER_AGENT"),
        )
        return response.Response(ApplicantPublicSerializer(applicant).data)


class PublicUploadView(generics.GenericAPIView):
    serializer_class = ApplicantUploadSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data={**request.data, "file": request.FILES.get("file")}
        )
        serializer.is_valid(raise_exception=True)
        applicant = get_object_or_404(
            models.Applicant, id=serializer.validated_data["applicant_id"]
        )
        document = applicant_service.upload_document(
            applicant=applicant,
            kind=serializer.validated_data["kind"],
            uploaded_file=serializer.validated_data["file"],
        )
        return response.Response(
            {
                "id": str(document.id),
                "kind": document.kind,
                "original_name": document.original_name,
            },
            status=status.HTTP_201_CREATED,
        )
