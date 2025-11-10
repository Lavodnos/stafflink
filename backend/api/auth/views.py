"""API endpoints que actúan como proxy para la autenticación a IAM."""

from __future__ import annotations

from typing import Any

from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .client import get_iam_client
from .exceptions import IAMServiceError
from .serializers import LoginSerializer


class LoginView(APIView):
    """Proxy login las credenciales de inicio de sesión a IAM y establece la cookie del token de acceso."""

    authentication_classes: list[Any] = []
    permission_classes: list[Any] = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        client = get_iam_client()
        try:
            iam_response = client.login(**serializer.validated_data)
        except IAMServiceError as exc:
            _maybe_customize_duplicate_session_error(exc)
            raise

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


def _delete_auth_cookie(response: Response) -> None:
    response.delete_cookie(
        settings.STAFFLINK_ACCESS_TOKEN_COOKIE_NAME,
        path=settings.STAFFLINK_ACCESS_TOKEN_COOKIE_PATH,
        samesite=settings.STAFFLINK_ACCESS_TOKEN_COOKIE_SAMESITE,
    )


class LogoutView(APIView):
    """Invalidar la sesión de IAM y borrar la cookie local."""

    authentication_classes: list[Any] = []
    permission_classes: list[Any] = []

    def post(self, request):
        token = request.COOKIES.get(settings.STAFFLINK_ACCESS_TOKEN_COOKIE_NAME)
        if token:
            client = get_iam_client()
            client.logout(token)

        response = Response(status=status.HTTP_204_NO_CONTENT)
        _delete_auth_cookie(response)
        return response


class SessionView(APIView):
    """Devuelve el estado actual de la sesión utilizando la introspección de IAM."""

    authentication_classes: list[Any] = []
    permission_classes: list[Any] = []

    def get(self, request):
        token = request.COOKIES.get(settings.STAFFLINK_ACCESS_TOKEN_COOKIE_NAME)
        if not token:
            return Response({"active": False}, status=status.HTTP_200_OK)

        client = get_iam_client()
        payload = client.introspect(token)

        if not payload.get("active"):
            response = Response({"active": False}, status=status.HTTP_200_OK)
            _delete_auth_cookie(response)
            return response

        return Response(payload, status=status.HTTP_200_OK)


def _maybe_customize_duplicate_session_error(exc: IAMServiceError) -> None:
    """Sobrescribir el mensaje de IAM cuando se detecta una sesión duplicada."""

    detail = exc.detail
    if not isinstance(detail, dict):
        return
    inner_detail = detail.get("detail")
    if isinstance(inner_detail, dict) and inner_detail.get("error") == "SESSION_ALREADY_ACTIVE":
        inner_detail[
            "message"
        ] = "Ya existe una sesión activa en otro navegador. Presiona nuevamente \"Ingresar\" para cerrarla y continuar aquí."
