from __future__ import annotations

from rest_framework import decorators, response, viewsets

from .. import models
from ..permissions import (HasAnyIAMPermission, permission_class,
                           request_has_permission)
from ..request_context import get_user_id, get_user_name
from ..serializers.link_serializer import (RecruitmentLinkDetailSerializer,
                                           RecruitmentLinkSerializer,
                                           RecruitmentLinkUpdateSerializer)
from ..services import link_service


class RecruitmentLinkViewSet(viewsets.ModelViewSet):
    queryset = models.RecruitmentLink.objects.select_related("campaign")
    serializer_class = RecruitmentLinkSerializer
    permission_classes: list = []

    permission_action_map = {
        "list": HasAnyIAMPermission,
        "retrieve": HasAnyIAMPermission,
        "create": permission_class("links.create"),
        "partial_update": HasAnyIAMPermission,
        "update": HasAnyIAMPermission,
        "destroy": permission_class("links.update_all"),
    }

    def get_permissions(self):
        cls = self.permission_action_map.get(self.action)
        if cls:
            if issubclass(cls, HasAnyIAMPermission):
                if self.action in {"list", "retrieve"}:
                    instance = HasAnyIAMPermission()
                    instance.required_permissions = ("links.read_all", "links.read_own")
                    return [instance]
                if self.action in {"partial_update", "update"}:
                    instance = HasAnyIAMPermission()
                    instance.required_permissions = (
                        "links.update_all",
                        "links.update_own",
                    )
                    return [instance]
            return [cls()]
        return super().get_permissions()

    def get_queryset(self):
        qs = super().get_queryset()
        if request_has_permission(self.request, "links.read_all"):
            return qs
        owner_id = get_user_id(self.request)
        if owner_id:
            return qs.filter(owner_id=owner_id)
        return qs.none()

    def get_serializer_class(self):
        if self.action in {"retrieve"}:
            return RecruitmentLinkDetailSerializer
        if self.action in {"partial_update", "update"}:
            return RecruitmentLinkUpdateSerializer
        return super().get_serializer_class()

    @decorators.action(detail=True, methods=["post"], url_path="expire")
    def expire(self, request, pk=None):
        self._assert_action_permission("links.expire", owns_required=True)
        link = self.get_object()
        actor_id = get_user_id(request)
        actor_name = get_user_name(request)
        link_service.expire_link(link, actor_id=actor_id, actor_name=actor_name)
        serializer = RecruitmentLinkDetailSerializer(link)
        return response.Response(serializer.data)

    @decorators.action(detail=True, methods=["post"], url_path="revoke")
    def revoke(self, request, pk=None):
        self._assert_action_permission("links.revoke", owns_required=True)
        link = self.get_object()
        actor_id = get_user_id(request)
        actor_name = get_user_name(request)
        link_service.revoke_link(link, actor_id=actor_id, actor_name=actor_name)
        serializer = RecruitmentLinkDetailSerializer(link)
        return response.Response(serializer.data)

    def _assert_action_permission(
        self, permission: str, owns_required: bool = False
    ) -> None:
        if request_has_permission(self.request, permission):
            return
        if owns_required:
            link = self.get_object()
            if link.owner_id == get_user_id(self.request) and request_has_permission(
                self.request, f"{permission}_own"
            ):
                return
        self.permission_denied(self.request, message="No tiene permisos suficientes")
