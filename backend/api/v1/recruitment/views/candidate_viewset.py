from __future__ import annotations

from rest_framework import decorators, response, viewsets

from .. import models
from ..permissions import permission_class
from ..request_context import get_user_id
from ..serializers.candidate_serializers import (
    CandidateAssignmentSerializer,
    CandidateDetailSerializer,
    CandidateDocumentsSerializer,
    CandidateListSerializer,
    CandidateProcessSerializer,
    CandidateWriteSerializer,
)
from ..services import candidate_service


class CandidateViewSet(viewsets.ModelViewSet):
    queryset = models.Candidate.objects.select_related("link", "link__campaign")
    serializer_class = CandidateListSerializer
    permission_classes = [permission_class("candidates.read")]

    permission_action_map = {
        "list": permission_class("candidates.read"),
        "retrieve": permission_class("candidates.read"),
        "create": permission_class("candidates.manage"),
        "update": permission_class("candidates.manage"),
        "partial_update": permission_class("candidates.manage"),
        "documents": permission_class("candidates.process"),
        "process": permission_class("candidates.process"),
        "assignment": permission_class("candidates.contract"),
    }

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params
        if document := params.get("documento"):
            qs = qs.filter(numero_documento__iexact=document.strip())
        if campaign_id := params.get("campaign_id"):
            qs = qs.filter(link__campaign_id=campaign_id)
        if link_id := params.get("link_id"):
            qs = qs.filter(link_id=link_id)
        if grupo := params.get("grupo"):
            qs = qs.filter(link__grupo__iexact=grupo.strip())
        # Si no tiene permisos globales, limitar a links del usuario
        if not self.request or not self.request.auth:
            return qs
        if not self.request.auth or not hasattr(self.request, "auth"):
            return qs
        if not self.request.auth:
            return qs
        if not self.request.auth.get("permissions"):
            return qs
        perms = {p.lower() for p in self.request.auth.get("permissions", [])}
        if "candidates.manage" in perms or "candidates.read" in perms:
            return qs
        owner_id = get_user_id(self.request)
        if owner_id:
            return qs.filter(link__user_id=owner_id)
        return qs.none()

    def get_serializer_class(self):
        if self.action == "list":
            return CandidateListSerializer
        if self.action == "retrieve":
            return CandidateDetailSerializer
        if self.action in {"create", "update", "partial_update"}:
            return CandidateWriteSerializer
        return super().get_serializer_class()

    def get_permissions(self):
        perm = self.permission_action_map.get(self.action)
        if perm:
            return [perm()]
        return super().get_permissions()

    @decorators.action(detail=True, methods=["patch"], url_path="documents")
    def documents(self, request, pk=None):
        candidate = self.get_object()
        serializer = CandidateDocumentsSerializer(
            data=request.data, partial=True, context=self.get_serializer_context()
        )
        serializer.is_valid(raise_exception=True)
        docs = candidate_service.update_documents(
            candidate=candidate, data=serializer.validated_data
        )
        return response.Response(CandidateDocumentsSerializer(docs).data)

    @decorators.action(detail=True, methods=["patch"], url_path="process")
    def process(self, request, pk=None):
        candidate = self.get_object()
        serializer = CandidateProcessSerializer(
            data=request.data, partial=True, context=self.get_serializer_context()
        )
        serializer.is_valid(raise_exception=True)
        actor_id = get_user_id(request)
        process = candidate_service.update_process(
            candidate=candidate,
            data=serializer.validated_data,
            actor_id=actor_id,
        )
        return response.Response(CandidateProcessSerializer(process).data)

    @decorators.action(detail=True, methods=["patch"], url_path="assignment")
    def assignment(self, request, pk=None):
        candidate = self.get_object()
        serializer = CandidateAssignmentSerializer(
            data=request.data, partial=True, context=self.get_serializer_context()
        )
        serializer.is_valid(raise_exception=True)
        assignment = candidate_service.update_assignment(
            candidate=candidate, data=serializer.validated_data
        )
        return response.Response(CandidateAssignmentSerializer(assignment).data)
