"""Valida archivos subidos en el flujo one-pass."""

from __future__ import annotations

import os

from django.conf import settings
from rest_framework import serializers


def validate_file(uploaded_file) -> None:
    max_bytes = settings.STAFFLINK_UPLOAD_MAX_SIZE_BYTES
    allowed = {ext.lower() for ext in settings.STAFFLINK_ALLOWED_UPLOAD_EXTENSIONS}

    if uploaded_file.size > max_bytes:
        raise serializers.ValidationError("El archivo excede el tamaño permitido.")

    _, ext = os.path.splitext(uploaded_file.name)
    ext = ext.lstrip(".").lower()
    if ext not in allowed:
        raise serializers.ValidationError("Tipo de archivo no permitido.")
