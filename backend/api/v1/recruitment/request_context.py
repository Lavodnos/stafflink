"""Helpers para extraer información del request autenticado."""

from __future__ import annotations

from typing import Any

from django.conf import settings
from django.http import HttpRequest


def _get_from_auth(auth: Any, key: str) -> str | None:
    if isinstance(auth, dict):
        value = auth.get(key)
        if value:
            return str(value)
    return None


def get_user_id(request: HttpRequest) -> str | None:
    if getattr(settings, "STAFFLINK_ALLOW_DEBUG_HEADERS", settings.DEBUG):
        header = request.headers.get("X-Stafflink-User-Id") or request.headers.get(
            "X-User-Id"
        )
        if header:
            return header
    auth_value = (
        _get_from_auth(request.auth, "user_id") if hasattr(request, "auth") else None
    )
    if auth_value:
        return auth_value
    user = getattr(request, "user", None)
    if user and getattr(user, "is_authenticated", False):
        if hasattr(user, "id"):
            return str(user.id)
    return None


def get_user_name(request: HttpRequest) -> str:
    if getattr(settings, "STAFFLINK_ALLOW_DEBUG_HEADERS", settings.DEBUG):
        header = request.headers.get("X-Stafflink-User-Name")
        if header:
            return header
    auth_value = (
        _get_from_auth(request.auth, "user_name") if hasattr(request, "auth") else None
    )
    if auth_value:
        return auth_value
    user = getattr(request, "user", None)
    if user and getattr(user, "is_authenticated", False):
        return getattr(user, "get_full_name", lambda: str(user))()
    return ""


def get_client_ip(request: HttpRequest) -> str | None:
    return request.META.get("HTTP_X_FORWARDED_FOR") or request.META.get("REMOTE_ADDR")
