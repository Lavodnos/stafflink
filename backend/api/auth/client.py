"""HTTP client helper to talk to the IAM service."""

from __future__ import annotations

from typing import Any
from urllib.parse import urljoin

import httpx
from django.conf import settings

from .exceptions import IAMServiceError, IAMUnavailableError


class IAMClient:
    """Thin wrapper around httpx to call IAM endpoints."""

    def __init__(
        self,
        *,
        base_url: str | None = None,
        app_id: str | None = None,
        timeout: float | int | None = None,
    ) -> None:
        self.base_url = (base_url or settings.IAM_BASE_URL).rstrip("/")
        self.app_id = app_id or settings.IAM_APP_ID
        self.timeout = timeout or settings.IAM_TIMEOUT_SECONDS

    def login(
        self,
        *,
        username_or_email: str,
        password: str,
        captcha_token: str | None = None,
        force: bool = False,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "username_or_email": username_or_email,
            "password": password,
            "app_id": self.app_id,
            "force": force,
        }
        if captcha_token:
            payload["captcha_token"] = captcha_token

        return self._post("auth/login", payload)

    def _post(self, path: str, payload: dict[str, Any]) -> dict[str, Any]:
        url = urljoin(f"{self.base_url}/", path)
        try:
            with httpx.Client(timeout=self.timeout) as client:
                response = client.post(url, json=payload)
        except httpx.RequestError as exc:
            raise IAMUnavailableError(detail={"detail": "IAM request failed", "error": str(exc)}) from exc

        data: dict[str, Any] | None
        try:
            data = response.json()
        except ValueError:
            data = None

        if response.status_code >= 400:
            raise IAMServiceError(status_code=response.status_code, detail=data or {"detail": "IAM error"})

        return data or {}


def get_iam_client() -> IAMClient:
    """Helper to lazy-instantiate the IAM client (useful for testing)."""

    return IAMClient()
