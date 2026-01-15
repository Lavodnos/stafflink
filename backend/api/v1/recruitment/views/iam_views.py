from __future__ import annotations

from typing import Any

from django.conf import settings
import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from api.auth.client import get_iam_client
from api.auth.service_token import get_service_token

from ..permissions import permission_class

logger = logging.getLogger(__name__)


def _get_token_from_request(request) -> str | None:
    auth_header = request.META.get("HTTP_AUTHORIZATION") or ""
    if auth_header.lower().startswith("bearer "):
        return auth_header.split(" ", 1)[1].strip() or None
    cookie_name = getattr(
        settings, "STAFFLINK_ACCESS_TOKEN_COOKIE_NAME", "stafflink_access_token"
    )
    return request.COOKIES.get(cookie_name)


class IAMUsersView(APIView):
    permission_classes = [permission_class("convocatorias.manage")]

    def get(self, request):
        token = get_service_token() or _get_token_from_request(request)
        if not token:
            return Response(
                {"detail": "Token requerido para consultar IAM."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        params: dict[str, Any] = {}
        search = request.query_params.get("search")
        limit = request.query_params.get("limit")
        offset = request.query_params.get("offset")
        app_id = settings.IAM_APP_ID

        if search:
            params["search"] = search
        if limit:
            params["limit"] = limit
        if offset:
            params["offset"] = offset

        if app_id:
            params["app_id"] = app_id

        role_id = settings.IAM_AGENT_ROLE_ID
        if not role_id:
            role_id = self._resolve_role_id(token, app_id)
        if role_id:
            params["role_id"] = role_id
        logger.info(
            "IAM users filter (app_id=%s, role_id=%s, status=ACTIVE)",
            app_id,
            role_id,
        )
        print(f"IAM users filter (app_id={app_id}, role_id={role_id}, status=ACTIVE)")

        params["status"] = "ACTIVE"

        client = get_iam_client()
        payload = client.list_users(token, params=params or None)
        return Response(payload)

    def _resolve_role_id(self, token: str, app_id: str | None) -> str | None:
        if not app_id:
            return None
        client = get_iam_client()
        roles = client.list_roles(app_id, token)
        if not isinstance(roles, list):
            return None
        role_name = settings.IAM_RECRUITER_ROLE_NAME.lower()
        for role in roles:
            if not isinstance(role, dict):
                continue
            name = str(role.get("name") or "").lower()
            if name == role_name:
                return str(role.get("id") or "")
        return None
