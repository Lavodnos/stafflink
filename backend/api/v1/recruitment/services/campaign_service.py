"""Servicios relacionados a campañas."""

from __future__ import annotations

from django.db.models import QuerySet

from .. import models


def list_campaigns() -> QuerySet[models.Campaign]:
    return models.Campaign.objects.all().order_by("nombre")
