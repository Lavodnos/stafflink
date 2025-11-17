"""Serializadores para los puntos de conexión de autenticación."""

from __future__ import annotations

from django.conf import settings
from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    username_or_email = serializers.CharField(max_length=255, required=True)
    password = serializers.CharField(
        max_length=128, style={"input_type": "password"}, trim_whitespace=False
    )
    captcha_token = serializers.CharField(
        required=False, allow_null=True, allow_blank=True
    )
    force = serializers.BooleanField(required=False, default=False)
    app_id = serializers.UUIDField(required=False)

    def validate_username_or_email(self, value: str) -> str:
        candidate = value.strip()
        if not candidate or len(candidate) < 3:
            raise serializers.ValidationError(
                "Debe ingresar un usuario o correo válido."
            )
        return candidate

    def validate(self, attrs):  # type: ignore[override]
        if settings.IAM_CAPTCHA_REQUIRED and not attrs.get("captcha_token"):
            raise serializers.ValidationError(
                {"captcha_token": "Se requiere CAPTCHA para esta aplicación."}
            )
        attrs["app_id"] = str(attrs.get("app_id") or settings.IAM_APP_ID)
        return attrs


class SessionIntrospectSerializer(serializers.Serializer):
    token = serializers.CharField(max_length=4096, trim_whitespace=True)
