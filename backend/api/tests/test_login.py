from __future__ import annotations

from unittest.mock import MagicMock, patch

from django.conf import settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.auth.exceptions import IAMServiceError, IAMUnavailableError


class LoginViewTests(APITestCase):
    url = reverse("auth-login")

    @patch("api.auth.views.get_iam_client")
    def test_login_success_sets_cookie_and_payload(
        self, mock_get_client: MagicMock
    ) -> None:
        iam_client = MagicMock()
        mock_get_client.return_value = iam_client
        iam_response = {
            "access_token": "jwt-token",
            "token_type": "Bearer",
            "expires_in": 3600,
            "session": {"session_id": "abc", "user_agent": "Chrome"},
            "user": {"id": "123", "email": "user@example.com"},
        }
        iam_client.login.return_value = iam_response

        payload = {
            "username_or_email": "user@example.com",
            "password": "Secret#123",
        }

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        expected_session = {
            "session_id": "abc",
            "application_name": None,
            "issued_at": None,
            "last_seen_at": None,
            "ip_address": None,
            "user_agent": "Chrome",
        }
        expected_payload = {
            "access_token": "jwt-token",
            "token_type": "Bearer",
            "expires_in": 3600,
            "session_id": "abc",
            "message": "Inicio de sesión exitoso.",
            "session": expected_session,
        }
        self.assertEqual(data, expected_payload)
        cookie = response.cookies.get(settings.STAFFLINK_ACCESS_TOKEN_COOKIE_NAME)
        self.assertIsNotNone(cookie)
        self.assertEqual(cookie.value, iam_response["access_token"])
        self.assertTrue(cookie["httponly"])
        self.assertEqual(int(cookie["max-age"]), iam_response["expires_in"])

    @patch("api.auth.views.get_iam_client")
    def test_login_invalid_credentials_message(self, mock_get_client: MagicMock) -> None:
        iam_client = MagicMock()
        mock_get_client.return_value = iam_client
        error_detail = {"error": "INVALID_CREDENTIALS"}
        iam_client.login.side_effect = IAMServiceError(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error_detail,
        )

        payload = {
            "username_or_email": "user@example.com",
            "password": "wrong",
        }

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        data = response.json()
        self.assertEqual(data["error"], "INVALID_CREDENTIALS")
        self.assertIn("contraseña no coinciden", data["message"])

    @patch("api.auth.views.get_iam_client")
    def test_login_user_not_found_message(self, mock_get_client: MagicMock) -> None:
        iam_client = MagicMock()
        mock_get_client.return_value = iam_client
        error_detail = {"error": "USER_NOT_FOUND"}
        iam_client.login.side_effect = IAMServiceError(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_detail,
        )

        payload = {
            "username_or_email": "missing@example.com",
            "password": "Secret#123",
        }

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        data = response.json()
        self.assertEqual(data["error"], "USER_NOT_FOUND")
        self.assertIn("no existe", data["message"])

    @patch("api.auth.views.get_iam_client")
    def test_duplicate_session_message_is_customized(
        self, mock_get_client: MagicMock
    ) -> None:
        iam_client = MagicMock()
        mock_get_client.return_value = iam_client
        error_detail = {
            "error": "SESSION_ALREADY_ACTIVE",
            "session": {
                "session_id": "abc",
                "application_name": "Stafflink",
                "issued_at": "2025-12-01T10:00:00Z",
                "ip_address": "1.1.1.1",
            },
        }
        iam_client.login.side_effect = IAMServiceError(
            status_code=status.HTTP_409_CONFLICT,
            detail=error_detail,
        )

        payload = {
            "username_or_email": "user@example.com",
            "password": "Secret#123",
        }

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        data = response.json()
        self.assertEqual(data["error"], "SESSION_ALREADY_ACTIVE")
        self.assertIn("Ya existe una sesión activa", data["message"])
        self.assertEqual(
            data["session"],
            {
                "session_id": "abc",
                "application_name": "Stafflink",
                "issued_at": "2025-12-01T10:00:00Z",
                "last_seen_at": None,
                "ip_address": "1.1.1.1",
                "user_agent": None,
            },
        )

    @patch("api.auth.views.get_iam_client")
    def test_login_handles_iam_unavailable(self, mock_get_client: MagicMock) -> None:
        iam_client = MagicMock()
        mock_get_client.return_value = iam_client
        iam_client.login.side_effect = IAMUnavailableError()

        payload = {
            "username_or_email": "user@example.com",
            "password": "Secret#123",
        }

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        data = response.json()
        self.assertEqual(data["error"], "IAM_UNAVAILABLE")
        self.assertIn("servicio de identidad", data["message"])


class SessionViewTests(APITestCase):
    url = reverse("auth-session")

    def test_session_without_cookie_returns_inactive(self) -> None:
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {"active": False})

    @patch("api.auth.views.get_iam_client")
    def test_session_with_cookie_returns_payload(
        self, mock_get_client: MagicMock
    ) -> None:
        iam_client = MagicMock()
        mock_get_client.return_value = iam_client
        iam_response = {
            "active": True,
            "user": {"id": "123", "email": "user@example.com"},
            "session": {"session_id": "abc"},
        }
        iam_client.introspect.return_value = iam_response

        self.client.cookies[settings.STAFFLINK_ACCESS_TOKEN_COOKIE_NAME] = "jwt-token"

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), iam_response)
        iam_client.introspect.assert_called_once_with("jwt-token")

    @patch("api.auth.views.get_iam_client")
    def test_session_post_allows_explicit_token(
        self, mock_get_client: MagicMock
    ) -> None:
        iam_client = MagicMock()
        mock_get_client.return_value = iam_client
        iam_response = {"active": True, "session_id": "abc"}
        iam_client.introspect.return_value = iam_response

        response = self.client.post(self.url, {"token": "provided"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), iam_response)
        iam_client.introspect.assert_called_once_with("provided")

    @patch("api.auth.views.get_iam_client")
    def test_session_inactive_clears_cookie(self, mock_get_client: MagicMock) -> None:
        iam_client = MagicMock()
        mock_get_client.return_value = iam_client
        iam_client.introspect.return_value = {"active": False}

        self.client.cookies[settings.STAFFLINK_ACCESS_TOKEN_COOKIE_NAME] = "jwt-token"

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {"active": False})
        cookie = response.cookies.get(settings.STAFFLINK_ACCESS_TOKEN_COOKIE_NAME)
        self.assertIsNotNone(cookie)
        self.assertEqual(cookie.value, "")
        self.assertEqual(cookie["max-age"], 0)


class LogoutViewTests(APITestCase):
    url = reverse("auth-logout")

    def test_logout_without_token_returns_error(self) -> None:
        response = self.client.post(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        data = response.json()
        self.assertEqual(data["error"], "TOKEN_REQUIRED")

    @patch("api.auth.views.get_iam_client")
    def test_logout_with_cookie_calls_iam_and_returns_message(
        self, mock_get_client: MagicMock
    ) -> None:
        iam_client = MagicMock()
        mock_get_client.return_value = iam_client
        self.client.cookies[settings.STAFFLINK_ACCESS_TOKEN_COOKIE_NAME] = "jwt-token"

        response = self.client.post(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {"message": "Sesión cerrada correctamente."})
        iam_client.logout.assert_called_once_with("jwt-token")
        cookie = response.cookies.get(settings.STAFFLINK_ACCESS_TOKEN_COOKIE_NAME)
        self.assertIsNotNone(cookie)
        self.assertEqual(cookie["max-age"], 0)

    @patch("api.auth.views.get_iam_client")
    def test_logout_reads_authorization_header(
        self, mock_get_client: MagicMock
    ) -> None:
        iam_client = MagicMock()
        mock_get_client.return_value = iam_client

        response = self.client.post(
            self.url, HTTP_AUTHORIZATION="Bearer header-token"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        iam_client.logout.assert_called_once_with("header-token")
