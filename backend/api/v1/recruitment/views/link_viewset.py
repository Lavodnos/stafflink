from __future__ import annotations

from rest_framework import decorators, response, viewsets

from .. import models
from ..permissions import permission_class, request_has_permission
from ..request_context import get_user_id
from ..serializers.link_serializer import LinkDetailSerializer, LinkSerializer
from ..services import link_service


class LinkViewSet(viewsets.ModelViewSet):
    queryset = models.Link.objects.select_related("campaign")
    serializer_class = LinkSerializer
    permission_classes: list = []

    permission_action_map = {
        "list": permission_class("links.read"),
        "retrieve": permission_class("links.read"),
        "create": permission_class("links.manage"),
        "partial_update": permission_class("links.manage"),
        "update": permission_class("links.manage"),
    }

    def get_permissions(self):
        cls = self.permission_action_map.get(self.action)
        if cls:
            return [cls()]
        return super().get_permissions()

    def get_queryset(self):
        qs = super().get_queryset()
        if request_has_permission(self.request, "links.manage"):
            return qs
        owner_id = get_user_id(self.request)
        if owner_id:
            return qs.filter(user_id=owner_id)
        return qs.none()

    def get_serializer_class(self):
        if self.action in {"retrieve"}:
            return LinkDetailSerializer
        return super().get_serializer_class()

    @decorators.action(detail=True, methods=["post"], url_path="expire")
    def expire(self, request, pk=None):
        self._assert_action_permission("links.close")
        link = self.get_object()
        actor_id = get_user_id(request)
        link_service.set_status(
            link=link, estado=models.Link.Estado.EXPIRADO, actor_id=actor_id
        )
        serializer = LinkDetailSerializer(link)
        return response.Response(serializer.data)

    @decorators.action(detail=True, methods=["post"], url_path="revoke")
    def revoke(self, request, pk=None):
        self._assert_action_permission("links.close")
        link = self.get_object()
        actor_id = get_user_id(request)
        link_service.set_status(
            link=link, estado=models.Link.Estado.REVOCADO, actor_id=actor_id
        )
        serializer = LinkDetailSerializer(link)
        return response.Response(serializer.data)

    @decorators.action(detail=True, methods=["post"], url_path="activate")
    def activate(self, request, pk=None):
        self._assert_action_permission("links.close")
        link = self.get_object()
        actor_id = get_user_id(request)
        link_service.set_status(
            link=link, estado=models.Link.Estado.ACTIVO, actor_id=actor_id
        )
        serializer = LinkDetailSerializer(link)
        return response.Response(serializer.data)

    def _assert_action_permission(self, permission: str) -> None:
        if request_has_permission(self.request, permission):
            return
        link = self.get_object()
        if (
            link.user_id == get_user_id(self.request)
            and request_has_permission(self.request, f"{permission}")
        ):
            return
        self.permission_denied(self.request, message="No tiene permisos suficientes")
