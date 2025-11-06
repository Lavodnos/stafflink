from __future__ import annotations

from unittest.mock import MagicMock, patch

from django.conf import settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.auth.exceptions import IAMServiceError


class LoginViewTests(APITestCase):
    url = reverse("auth-login")

    @patch("api.auth.views.get_iam_client")
    def test_login_success_sets_cookie(self, mock_get_client: MagicMock) -> None:
        iam_client = MagicMock()
        mock_get_client.return_value = iam_client
        iam_response = {
            "access_token": "jwt-token",
            "token_type": "Bearer",
            "expires_in": 3600,
            "user": {"id": "123", "email": "user@example.com"},
        }
        iam_client.login.return_value = iam_response

        payload = {
            "username_or_email": "user@example.com",
            "password": "Secret#123",
        }

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), iam_response)
        cookie = response.cookies.get(settings.STAFFLINK_ACCESS_TOKEN_COOKIE_NAME)
        self.assertIsNotNone(cookie)
        self.assertEqual(cookie.value, iam_response["access_token"])
        self.assertTrue(cookie["httponly"])
        self.assertEqual(int(cookie["max-age"]), iam_response["expires_in"])

    @patch("api.auth.views.get_iam_client")
    def test_login_error_is_propagated(self, mock_get_client: MagicMock) -> None:
        iam_client = MagicMock()
        mock_get_client.return_value = iam_client
        error_detail = {"detail": {"error": "INVALID_CREDENTIALS"}}
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
        self.assertEqual(response.json(), error_detail)
