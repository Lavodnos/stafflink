from __future__ import annotations

import uuid
import unittest

from django.utils import timezone
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase

from api.v1.recruitment import models

from .utils import create_applicant, create_campaign, create_convocatoria


@unittest.skip("Flujo de verificación legacy no alineado con modelo/proceso actual")
class VerificationViewSetTests(APITestCase):
    def setUp(self) -> None:
        self.campaign = create_campaign()
        self.link = create_convocatoria(self.campaign, owner_id=uuid.uuid4())
        self.applicant = create_applicant(
            self.link,
            status="submitted",
            submitted_at=timezone.now(),
        )
        models.Verification.objects.get_or_create(applicant=self.applicant)

    def _headers(self, *perms: str) -> dict[str, str]:
        permissions = ",".join(perms)
        return {"HTTP_X_STAFFLINK_PERMISSIONS": permissions}

    def test_list_returns_queue(self) -> None:
        url = reverse("verify-list")
        response = self.client.get(url, **self._headers("verification.view"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

    def test_partial_update_updates_phone(self) -> None:
        url = reverse("verify-detail", args=[self.applicant.id])
        payload = {"phone": "555444333"}
        resp = self.client.patch(
            url,
            payload,
            format="json",
            **self._headers("verification.view", "candidates.update_controlled"),
        )
        self.assertEqual(resp.status_code, 200)
        self.applicant.refresh_from_db()
        self.assertEqual(self.applicant.phone, "555444333")

    def test_decision_action_updates_status(self) -> None:
        url = reverse("verify-decision", args=[self.applicant.id])
        resp = self.client.post(
            url,
            {"status": "approved", "reason": "ok"},
            format="json",
            **self._headers("verification.view", "verification.decide"),
        )
        self.assertEqual(resp.status_code, 200)
        self.applicant.refresh_from_db()
        self.assertEqual(self.applicant.status, "verified_ok")
