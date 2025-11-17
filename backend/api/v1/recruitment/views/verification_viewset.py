from __future__ import annotations

from rest_framework import decorators, mixins, response, viewsets

from ..permissions import permission_class
from ..request_context import get_user_id, get_user_name
from ..serializers.verification_serializers import (
    ApplicantControlledUpdateSerializer, ApplicantDetailSerializer,
    ApplicantQueueSerializer, VerificationCorrectionSerializer,
    VerificationDecisionSerializer)
from ..services import verification_service


class VerificationViewSet(
    mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet
):
    queryset = verification_service.get_queue_queryset()
    lookup_field = "id"
    permission_map = {
        "list": ("verification.view",),
        "retrieve": ("verification.view",),
        "partial_update": ("candidates.update_controlled",),
        "decision": ("verification.decide",),
        "request_correction": ("verification.request_correction",),
    }

    def get_permissions(self):
        perms = self.permission_map.get(self.action)
        if perms:
            return [permission_class(*perms)()]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action == "list":
            return ApplicantQueueSerializer
        if self.action == "retrieve":
            return ApplicantDetailSerializer
        if self.action == "partial_update":
            return ApplicantControlledUpdateSerializer
        return super().get_serializer_class()

    def partial_update(self, request, *args, **kwargs):
        applicant = self.get_object()
        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        verification_service.update_applicant_controlled(
            applicant=applicant,
            data=serializer.validated_data,
            actor_id=get_user_id(request),
            actor_name=get_user_name(request),
        )
        return response.Response(ApplicantDetailSerializer(applicant).data)

    @decorators.action(detail=True, methods=["post"], url_path="decision")
    def decision(self, request, id=None):
        applicant = self.get_object()
        serializer = VerificationDecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        verification_service.register_decision(
            applicant=applicant,
            status=serializer.validated_data["status"],
            reason=serializer.validated_data.get("reason", ""),
            actor_id=get_user_id(request),
            actor_name=get_user_name(request),
        )
        return response.Response(ApplicantDetailSerializer(applicant).data)

    @decorators.action(detail=True, methods=["post"], url_path="request-correction")
    def request_correction(self, request, id=None):
        applicant = self.get_object()
        serializer = VerificationCorrectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        verification_service.request_correction(
            applicant=applicant,
            message=serializer.validated_data["message"],
            actor_id=get_user_id(request),
            actor_name=get_user_name(request),
        )
        return response.Response(ApplicantDetailSerializer(applicant).data)
