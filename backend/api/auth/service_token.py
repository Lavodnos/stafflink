"""Proveedor de token de servicio para consultar IAM Directory.

Si existe IAM_SERVICE_TOKEN en settings, se usa tal cual. Si no,
intenta obtener un token efímero haciendo login con la cuenta de
servicio configurada (IAM_SERVICE_USER / IAM_SERVICE_PASSWORD) en
la app de IAM Control Center (IAM_CONTROL_APP_ID). Cachea en memoria
hasta que falten ~90s para expirar.
"""

from __future__ import annotations

import logging
import threading
import time
from typing import Any

from django.conf import settings

from .client import IAMClient

logger = logging.getLogger(__name__)
_lock = threading.Lock()
_cache: dict[str, Any] = {"token": None, "exp": 0.0}


def _has_env_credentials() -> bool:
    return bool(settings.IAM_SERVICE_USER and settings.IAM_SERVICE_PASSWORD)


def get_service_token() -> str | None:
    """Devuelve un token listo para usar contra IAM Directory.

    Prioridad:
    1) IAM_SERVICE_TOKEN estático (si se configuró).
    2) Token efímero obtenido con las credenciales de servicio.
    """

    if getattr(settings, "IAM_SERVICE_TOKEN", None):
        return settings.IAM_SERVICE_TOKEN

    if not _has_env_credentials():
        return None

    now = time.time()
    with _lock:
        token = _cache.get("token")
        exp = float(_cache.get("exp") or 0)
        # Renovar si faltan menos de 90s
        if token and now < exp - 90:
            return token

        client = IAMClient(
            base_url=settings.IAM_BASE_URL,
            app_id=getattr(settings, "IAM_CONTROL_APP_ID", settings.IAM_APP_ID),
            timeout=settings.IAM_TIMEOUT_SECONDS,
        )
        try:
            resp = client.login(
                username_or_email=settings.IAM_SERVICE_USER,  # type: ignore[arg-type]
                password=settings.IAM_SERVICE_PASSWORD,  # type: ignore[arg-type]
                force=True,  # Evita SESSION_ALREADY_ACTIVE al reutilizar la cuenta de servicio
            )
        except Exception as exc:  # IAMServiceError | IAMUnavailableError
            logger.warning(
                "IAM service token login failed (%s). Falling back to user token.",
                exc.__class__.__name__,
                exc_info=False,
            )
            return None
        token = resp.get("access_token")
        expires_in = int(resp.get("expires_in") or 0)
        if not token:
            return None

        _cache["token"] = token
        _cache["exp"] = now + expires_in if expires_in else now + 300
        return token


def clear_cached_service_token() -> None:
    """Borra el token cacheado (se usa al recibir 401 desde IAM)."""

    with _lock:
        _cache["token"] = None
        _cache["exp"] = 0.0
