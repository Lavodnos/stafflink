"""Enrutador principal de la API v1."""

from __future__ import annotations

from django.urls import include, path

urlpatterns = [
    path("", include("api.v1.recruitment.urls")),
]
