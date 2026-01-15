from __future__ import annotations

from rest_framework import decorators, response, viewsets

from .. import models
from ..permissions import permission_class, request_has_permission
from ..request_context import get_user_id
from ..serializers.convocatoria_serializer import (
    ConvocatoriaDetailSerializer,
    ConvocatoriaSerializer,
)
from ..services import convocatoria_service


class ConvocatoriaViewSet(viewsets.ModelViewSet):
    queryset = models.Link.objects.select_related("campaign")
    serializer_class = ConvocatoriaSerializer
    permission_classes: list = []

    permission_action_map = {
        "list": permission_class("convocatorias.read"),
        "retrieve": permission_class("convocatorias.read"),
        "create": permission_class("convocatorias.manage"),
        "partial_update": permission_class("convocatorias.manage"),
        "update": permission_class("convocatorias.manage"),
        "destroy": permission_class("convocatorias.manage"),
    }

    def get_permissions(self):
        cls = self.permission_action_map.get(self.action)
        if cls:
            return [cls()]
        return super().get_permissions()

    def get_queryset(self):
        qs = super().get_queryset()
        if request_has_permission(self.request, "convocatorias.manage"):
            return qs
        owner_id = get_user_id(self.request)
        if owner_id:
            return qs.filter(user_id=owner_id)
        return qs.none()

    def get_serializer_class(self):
        if self.action in {"retrieve"}:
            return ConvocatoriaDetailSerializer
        return super().get_serializer_class()

    @decorators.action(detail=True, methods=["post"], url_path="expire")
    def expire(self, request, pk=None):
        self._assert_action_permission("convocatorias.close")
        convocatoria = self.get_object()
        actor_id = get_user_id(request)
        convocatoria_service.set_status(
            convocatoria=convocatoria,
            estado=models.Link.Estado.EXPIRADO,
            actor_id=actor_id,
        )
        serializer = ConvocatoriaDetailSerializer(convocatoria)
        return response.Response(serializer.data)

    @decorators.action(detail=True, methods=["post"], url_path="revoke")
    def revoke(self, request, pk=None):
        self._assert_action_permission("convocatorias.close")
        convocatoria = self.get_object()
        actor_id = get_user_id(request)
        convocatoria_service.set_status(
            convocatoria=convocatoria,
            estado=models.Link.Estado.REVOCADO,
            actor_id=actor_id,
        )
        serializer = ConvocatoriaDetailSerializer(convocatoria)
        return response.Response(serializer.data)

    @decorators.action(detail=True, methods=["post"], url_path="activate")
    def activate(self, request, pk=None):
        self._assert_action_permission("convocatorias.close")
        convocatoria = self.get_object()
        actor_id = get_user_id(request)
        convocatoria_service.set_status(
            convocatoria=convocatoria,
            estado=models.Link.Estado.ACTIVO,
            actor_id=actor_id,
        )
        serializer = ConvocatoriaDetailSerializer(convocatoria)
        return response.Response(serializer.data)

    def _assert_action_permission(self, permission: str) -> None:
        if request_has_permission(self.request, permission):
            return
        convocatoria = self.get_object()
        if convocatoria.user_id == get_user_id(self.request) and request_has_permission(
            self.request, f"{permission}"
        ):
            return
        self.permission_denied(self.request, message="No tiene permisos suficientes")
