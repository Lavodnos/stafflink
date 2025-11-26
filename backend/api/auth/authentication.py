from __future__ import annotations

import logging
import uuid
from typing import Any, Literal, Optional

from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from rest_framework.authentication import BaseAuthentication
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed

from .client import get_iam_client
from .exceptions import IAMServiceError
from .service_token import clear_cached_service_token, get_service_token

logger = logging.getLogger(__name__)


def _get_token_from_request(request) -> Optional[str]:
    """Extract token from Authorization: Bearer or authentication cookie."""

    auth_header = request.META.get("HTTP_AUTHORIZATION") or ""
    if auth_header.lower().startswith("bearer "):
        return auth_header.split(" ", 1)[1].strip() or None

    cookie_name = getattr(
        settings, "STAFFLINK_ACCESS_TOKEN_COOKIE_NAME", "stafflink_access_token"
    )
    return request.COOKIES.get(cookie_name)


class IAMCookieAuthentication(BaseAuthentication):
    """Autenticación vía token de IAM presente en cookie o header.

    Devuelve en request.auth el payload de introspección, incluyendo permisos,
    para que los permission classes puedan evaluarlo.
    """

    def authenticate(self, request):
        token = _get_token_from_request(request)
        if not token:
            return None

        client = get_iam_client()
        payload: dict[str, Any] = client.introspect(token)
        if not payload.get("active"):
            raise AuthenticationFailed("Invalid or expired token")

        # Fallback: si la introspección no trae permisos, consultamos Directory
        perms = _normalize_permission_list(
            payload.get("permissions") or payload.get("perms")
        )

        # Algunos despliegues devuelven permisos por aplicación en un array "applications"
        if not perms:
            perms = _extract_app_permissions(payload)

        # Como último recurso consultamos Directory para extraer roles/permisos del usuario
        if not perms:
            perms = _fetch_directory_permissions(token, payload, on_error="raise")

        if perms:
            payload["permissions"] = perms

        # Construimos un user anónimo enriquecido con permisos y datos básicos
        user = AnonymousUser()
        setattr(user, "permissions", perms)
        user_data = payload.get("user") or {}
        for key in ("id", "email", "first_name", "last_name"):
            if key in user_data:
                setattr(user, key, user_data.get(key))
        return (user, payload)


def _extract_app_permissions(payload: Any) -> list[str]:
    """Extrae permisos desde la sección applications del payload de IAM."""

    app_id = str(getattr(settings, "IAM_APP_ID", "")).lower()
    apps = payload.get("applications") if isinstance(payload, dict) else None
    if not isinstance(apps, (list, tuple)):
        return []

    collected: set[str] = set()
    for app in apps:
        if not isinstance(app, dict):
            continue
        candidate_id = _coerce_name(
            app.get("id")
            or app.get("app_id")
            or app.get("application_id")
            or app.get("application")
        )
        if app_id and candidate_id != app_id:
            continue

        collected.update(
            _normalize_permission_list(app.get("permissions") or app.get("perms"))
        )

        # Agrega permisos declarados dentro de cada rol devuelto por Directory
        for role in app.get("roles") or []:
            if not isinstance(role, dict):
                continue
            collected.update(
                _normalize_permission_list(role.get("permissions") or role.get("perms"))
            )

    return sorted(collected)


def _fetch_directory_permissions(
    token: str,
    payload: dict[str, Any],
    *,
    on_error: Literal["raise", "empty"] = "empty",
) -> list[str]:
    """Consulta IAM Directory para recuperar permisos del usuario para esta app."""

    user_id = payload.get("sub") or (payload.get("user") or {}).get("id")
    if not user_id:
        return []
    # Si el user_id no es un UUID válido, evitamos llamar a Directory
    try:
        uuid.UUID(str(user_id))
    except Exception:
        return []

    client = get_iam_client()
    try:
        service_token = get_service_token()
    except Exception as exc:
        logger.warning(
            "IAM service token unavailable, using user token (user=%s): %s",
            user_id,
            exc,
            exc_info=False,
        )
        service_token = None

    token_to_use = service_token or token

    try:
        data = client.get_user_roles(str(user_id), token_to_use)
    except IAMServiceError as exc:
        logger.warning(
            "IAM Directory roles failed (status=%s, user=%s): %s",
            getattr(exc, "status_code", None),
            user_id,
            getattr(exc, "detail", exc),
            exc_info=False,
        )
        if exc.status_code == 401:
            clear_cached_service_token()
            try:
                refreshed_token = get_service_token() or token
            except Exception:
                logger.warning(
                    "IAM service token refresh failed after 401 (user=%s)",
                    user_id,
                    exc_info=False,
                )
                if on_error == "raise":
                    raise
                return []
            try:
                data = client.get_user_roles(str(user_id), refreshed_token)
            except Exception:
                logger.warning(
                    "IAM Directory retry failed after 401 (user=%s)",
                    user_id,
                    exc_info=False,
                )
                if on_error == "raise":
                    raise
                return []
        else:
            if on_error == "raise":
                raise
            return []
    except Exception as exc:
        logger.warning(
            "IAM Directory request failed (user=%s): %s", user_id, exc, exc_info=False
        )
        if on_error == "raise":
            raise IAMServiceError(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={
                    "error": "IAM_DIRECTORY_UNAVAILABLE",
                    "message": "No pudimos obtener permisos desde IAM Directory.",
                    "reason": str(exc),
                },
            ) from exc
        return []

    if not isinstance(data, dict):
        return []

    # Se espera una clave "applications" con roles/permisos agrupados por app
    perms = _extract_app_permissions({"applications": data.get("applications")})
    if perms:
        return perms

    # Si la respuesta es una lista de aplicaciones directamente
    if isinstance(data.get("applications"), (list, tuple)):
        return _extract_app_permissions(data)

    # Si IAM devuelve roles/permisos planos
    perms = _normalize_permission_list(data.get("permissions") or data.get("perms"))
    if perms:
        return perms
    return []


def _normalize_permission_list(raw: Any) -> list[str]:
    """Acepta listas de strings o dicts con 'name' y las normaliza a strings."""

    if not raw:
        return []
    perms: list[str] = []
    for item in raw:
        name = _coerce_name(item)
        if name:
            perms.append(name)
    return perms


def _coerce_name(value: Any) -> str | None:
    if isinstance(value, str):
        return value.strip().lower() or None
    if isinstance(value, dict):
        if "name" in value:
            return str(value.get("name")).strip().lower() or None
        if "permission" in value:
            return str(value.get("permission")).strip().lower() or None
        if "code" in value:
            return str(value.get("code")).strip().lower() or None
    return None
