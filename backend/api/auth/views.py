"""API endpoints que actúan como proxy para la autenticación a IAM."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from django.conf import settings
from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework.views import APIView

from .client import get_iam_client
from .serializers import LoginSerializer, SessionIntrospectSerializer

LOGIN_SUCCESS_MESSAGE = "Inicio de sesión exitoso."
DEFAULT_LOGIN_ERROR_MESSAGE = "No pudimos validar las credenciales proporcionadas."
SERVER_SIDE_LOGIN_ERROR_MESSAGE = (
    "El servicio de identidad no está disponible en este momento. Intenta nuevamente más tarde."
)
SESSION_ALREADY_ACTIVE_MESSAGE = (
    'Ya existe una sesión activa en otro navegador. Presiona nuevamente "Ingresar" para cerrarla y continuar aquí.'
)
LOGOUT_SUCCESS_MESSAGE = "Sesión cerrada correctamente."
TOKEN_REQUIRED_MESSAGE = (
    "Debes enviar Authorization: Bearer <token> o contar con la cookie de autenticación para cerrar la sesión."
)
LOGIN_ERROR_MESSAGES = {
    "INVALID_CREDENTIALS": "El usuario o la contraseña no coinciden.",
    "USER_NOT_FOUND": "El usuario ingresado no existe o no tiene acceso a Stafflink.",
    "PASSWORD_EXPIRED": "Tu contraseña expiró. Actualízala en IAM antes de continuar.",
    "ACCOUNT_LOCKED": "Tu cuenta está bloqueada. Comunícate con el equipo de soporte.",
}
SESSION_DETAIL_KEYS = (
    "session_id",
    "application_name",
    "issued_at",
    "last_seen_at",
    "ip_address",
    "user_agent",
)


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
        except APIException as exc:  # IAMServiceError | IAMUnavailableError
            return Response(_format_api_exception(exc), status=exc.status_code)

        expires_in = _coerce_int(iam_response.get("expires_in"))
        response_payload = _build_login_success_payload(
            iam_response, expires_in=expires_in
        )
        response = Response(response_payload, status=status.HTTP_200_OK)
        token = response_payload.get("access_token")
        if token:
            response.set_cookie(
                settings.STAFFLINK_ACCESS_TOKEN_COOKIE_NAME,
                token,
                max_age=expires_in,
                secure=settings.STAFFLINK_ACCESS_TOKEN_COOKIE_SECURE,
                httponly=True,
                samesite=settings.STAFFLINK_ACCESS_TOKEN_COOKIE_SAMESITE,
                path=settings.STAFFLINK_ACCESS_TOKEN_COOKIE_PATH,
            )

        return response


class LogoutView(APIView):
    """Invalidar la sesión de IAM y borrar la cookie local."""

    authentication_classes: list[Any] = []
    permission_classes: list[Any] = []

    def post(self, request):
        token = _get_token_from_header(request) or _get_token_from_cookie(request)
        if not token:
            return Response(
                _build_error_payload("TOKEN_REQUIRED", TOKEN_REQUIRED_MESSAGE),
                status=status.HTTP_401_UNAUTHORIZED,
            )

        client = get_iam_client()
        try:
            client.logout(token)
        except APIException as exc:
            return Response(_format_api_exception(exc), status=exc.status_code)

        response = Response(
            {"message": LOGOUT_SUCCESS_MESSAGE}, status=status.HTTP_200_OK
        )
        _delete_auth_cookie(response)
        return response


class SessionView(APIView):
    """Devuelve el estado actual de la sesión utilizando la introspección de IAM."""

    authentication_classes: list[Any] = []
    permission_classes: list[Any] = []

    def get(self, request):
        token = _get_token_from_cookie(request)
        if not token:
            return Response({"active": False}, status=status.HTTP_200_OK)

        return self._introspect_and_respond(token, clear_cookie=True)

    def post(self, request):
        serializer = SessionIntrospectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return self._introspect_and_respond(serializer.validated_data["token"])

    def _introspect_and_respond(self, token: str, *, clear_cookie: bool = False):
        client = get_iam_client()
        try:
            payload = client.introspect(token)
        except APIException as exc:
            return Response(_format_api_exception(exc), status=exc.status_code)

        if not payload.get("active"):
            response = Response({"active": False}, status=status.HTTP_200_OK)
            if clear_cookie:
                _delete_auth_cookie(response)
            return response

        return Response(payload, status=status.HTTP_200_OK)


def _delete_auth_cookie(response: Response) -> None:
    response.delete_cookie(
        settings.STAFFLINK_ACCESS_TOKEN_COOKIE_NAME,
        path=settings.STAFFLINK_ACCESS_TOKEN_COOKIE_PATH,
        samesite=settings.STAFFLINK_ACCESS_TOKEN_COOKIE_SAMESITE,
    )


def _build_login_success_payload(
    iam_response: Mapping[str, Any], *, expires_in: int | None
) -> dict[str, Any]:
    token = iam_response.get("access_token") or iam_response.get("token")
    session_detail = _extract_session_detail(iam_response)
    payload: dict[str, Any] = {
        "access_token": token,
        "token_type": iam_response.get("token_type", "Bearer"),
        "expires_in": expires_in if expires_in is not None else 0,
        "session_id": (session_detail or {}).get("session_id")
        or iam_response.get("session_id"),
        "message": LOGIN_SUCCESS_MESSAGE,
    }
    if session_detail:
        payload["session"] = session_detail
    return payload


def _format_api_exception(exc: APIException) -> dict[str, Any]:
    detail = _extract_error_detail(exc.detail)
    error_code = detail.get("error") or "IAM_SERVICE_ERROR"

    if error_code == "SESSION_ALREADY_ACTIVE":
        message = SESSION_ALREADY_ACTIVE_MESSAGE
    elif error_code in LOGIN_ERROR_MESSAGES:
        message = LOGIN_ERROR_MESSAGES[error_code]
    elif exc.status_code >= status.HTTP_500_INTERNAL_SERVER_ERROR:
        message = SERVER_SIDE_LOGIN_ERROR_MESSAGE
    else:
        message = detail.get("message") or DEFAULT_LOGIN_ERROR_MESSAGE

    session_detail = _normalize_session_detail(detail.get("session"))
    return _build_error_payload(error_code, message, session_detail)


def _build_error_payload(
    error: str, message: str, session: dict[str, Any] | None = None
) -> dict[str, Any]:
    payload: dict[str, Any] = {"error": error, "message": message}
    if session:
        payload["session"] = session
    return payload


def _extract_error_detail(raw: Any) -> dict[str, Any]:
    if isinstance(raw, dict):
        inner = raw.get("detail")
        if isinstance(inner, dict):
            return inner
        return raw
    if isinstance(raw, str):
        return {"message": raw}
    return {}


def _extract_session_detail(source: Mapping[str, Any]) -> dict[str, Any] | None:
    if not isinstance(source, Mapping):
        return None
    if isinstance(source.get("session"), Mapping):
        normalized = _normalize_session_detail(source["session"])
        if normalized:
            return normalized

    direct_candidate = {key: source.get(key) for key in SESSION_DETAIL_KEYS}
    return _normalize_session_detail(direct_candidate)


def _normalize_session_detail(raw: Mapping[str, Any] | None) -> dict[str, Any] | None:
    if not isinstance(raw, Mapping):
        return None
    detail = {key: raw.get(key) for key in SESSION_DETAIL_KEYS}
    if not any(value is not None for value in detail.values()):
        return None
    return detail


def _get_token_from_header(request) -> str | None:
    auth_header = request.META.get("HTTP_AUTHORIZATION")
    if not auth_header:
        return None
    parts = auth_header.strip().split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return None


def _get_token_from_cookie(request) -> str | None:
    return request.COOKIES.get(settings.STAFFLINK_ACCESS_TOKEN_COOKIE_NAME)


def _coerce_int(value: Any) -> int | None:
    if isinstance(value, (int, float)):
        return int(value)
    try:
        return int(str(value))
    except (TypeError, ValueError):
        return None
