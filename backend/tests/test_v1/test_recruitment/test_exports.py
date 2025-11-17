from __future__ import annotations

import shutil
import tempfile
import uuid

from django.test import override_settings
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase

from api.v1.recruitment import models

from .utils import create_applicant, create_campaign, create_link


class ExportViewSetTests(APITestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls._tmpdir = tempfile.mkdtemp()
        cls._override = override_settings(STAFFLINK_EXPORT_OUTPUT_DIR=cls._tmpdir)
        cls._override.enable()

    @classmethod
    def tearDownClass(cls):
        cls._override.disable()
        shutil.rmtree(cls._tmpdir, ignore_errors=True)
        super().tearDownClass()

    def setUp(self) -> None:
        campaign = create_campaign()
        link = create_link(campaign, owner_id=uuid.uuid4())
        self.applicants = [
            create_applicant(
                link,
                status="verified_ok",
                document_number=str(100 + idx),
            )
            for idx in range(2)
        ]

    def _headers(self, *perms: str) -> dict[str, str]:
        return {"HTTP_X_STAFFLINK_PERMISSIONS": ",".join(perms)}

    def test_create_batch_exports_applicants(self) -> None:
        url = reverse("smart-export-batches-list")
        payload = {
            "applicant_ids": [str(app.id) for app in self.applicants],
            "notes": "Semana 1",
        }
        resp = self.client.post(
            url,
            payload,
            format="json",
            **self._headers("exports.create", "exports.read"),
        )
        self.assertEqual(resp.status_code, 201)
        for app in self.applicants:
            app.refresh_from_db()
            self.assertEqual(app.status, "exported")

    def test_mark_created_changes_status(self) -> None:
        batch = models.SmartExportBatch.objects.create(batch_code="B1")
        url = reverse("smart-export-batches-mark-created", args=[batch.id])
        resp = self.client.post(url, {}, **self._headers("exports.mark_created"))
        self.assertEqual(resp.status_code, 200)
        batch.refresh_from_db()
        self.assertEqual(batch.status, "delivered")
