"""API endpoints that proxy authentication to IAM."""

from __future__ import annotations

from typing import Any

from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .client import get_iam_client
from .serializers import LoginSerializer


class LoginView(APIView):
    """Proxy login credentials to IAM and set access token cookie."""

    authentication_classes: list[Any] = []
    permission_classes: list[Any] = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        client = get_iam_client()
        iam_response = client.login(**serializer.validated_data)

        response = Response(iam_response, status=status.HTTP_200_OK)
        token = iam_response.get("access_token") or iam_response.get("token")
        expires_in = iam_response.get("expires_in")

        if token:
            max_age: int | None = None
            if isinstance(expires_in, (int, float)):
                max_age = int(expires_in)
            response.set_cookie(
                settings.STAFFLINK_ACCESS_TOKEN_COOKIE_NAME,
                token,
                max_age=max_age,
                secure=settings.STAFFLINK_ACCESS_TOKEN_COOKIE_SECURE,
                httponly=True,
                samesite=settings.STAFFLINK_ACCESS_TOKEN_COOKIE_SAMESITE,
                path=settings.STAFFLINK_ACCESS_TOKEN_COOKIE_PATH,
            )

        return response
