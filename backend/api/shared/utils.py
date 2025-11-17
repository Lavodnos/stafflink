"""Helpers compartidos para las vistas/servicios."""

from __future__ import annotations

from django.utils import timezone


def now_lima() -> timezone.datetime:
    """Retorna el timestamp actual (timezone aware)."""

    return timezone.now()
