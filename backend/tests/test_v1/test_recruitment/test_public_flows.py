from __future__ import annotations

import shutil
import tempfile
from datetime import timedelta

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.utils import timezone
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase

from api.v1.recruitment import models, storage

from .utils import (attach_document, create_applicant, create_campaign,
                    create_link)


class PublicFlowTests(APITestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls._tmpdir = tempfile.mkdtemp()
        cls._override = override_settings(STAFFLINK_STORAGE_BASE_PATH=cls._tmpdir)
        cls._override.enable()
        storage.get_storage_client.cache_clear()

    @classmethod
    def tearDownClass(cls):
        storage.get_storage_client.cache_clear()
        cls._override.disable()
        shutil.rmtree(cls._tmpdir, ignore_errors=True)
        super().tearDownClass()

    def setUp(self) -> None:
        self.campaign = create_campaign()
        self.link = create_link(
            self.campaign,
            slug="open-link",
            expires_at=timezone.now() + timedelta(days=1),
        )

    def test_public_link_rejects_expired(self) -> None:
        expired_link = create_link(
            self.campaign,
            slug="expired-link",
            expires_at=timezone.now() - timedelta(minutes=1),
        )
        url = reverse("public:public-link", kwargs={"slug": expired_link.slug})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)

    def test_create_and_update_applicant(self) -> None:
        create_url = reverse("public:public-candidate-create")
        payload = {
            "link_slug": self.link.slug,
            "first_name": "Maria",
            "last_name": "Lopez",
            "document_type": models.Applicant.DocumentType.DNI,
            "document_number": "87654321",
            "email": "maria@example.com",
            "phone": "999000111",
        }
        create_resp = self.client.post(create_url, payload, format="json")
        self.assertEqual(create_resp.status_code, 201)
        applicant_id = create_resp.json()["id"]

        detail_url = reverse(
            "public:public-candidate-detail", kwargs={"id": applicant_id}
        )
        patch_resp = self.client.patch(
            detail_url, {"phone": "111222333"}, format="json"
        )
        self.assertEqual(patch_resp.status_code, 200)
        self.assertEqual(patch_resp.json()["phone"], "111222333")

    def test_submit_requires_documents(self) -> None:
        applicant = create_applicant(self.link, status="draft")
        submit_url = reverse(
            "public:public-candidate-submit", kwargs={"id": applicant.id}
        )
        resp = self.client.post(submit_url, {"lpdp_consent": True}, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_submit_success_when_documents_present(self) -> None:
        applicant = create_applicant(self.link, status="draft")
        attach_document(applicant, "dni_front")
        attach_document(applicant, "dni_back")

        submit_url = reverse(
            "public:public-candidate-submit", kwargs={"id": applicant.id}
        )
        resp = self.client.post(submit_url, {"lpdp_consent": True}, format="json")
        self.assertEqual(resp.status_code, 200)
        applicant.refresh_from_db()
        self.assertEqual(applicant.status, "submitted")

    def test_upload_endpoint_creates_document(self) -> None:
        applicant = create_applicant(self.link, status="draft")
        upload_url = reverse("public:public-upload")
        payload = {
            "applicant_id": applicant.id,
            "kind": "dni_front",
            "file": SimpleUploadedFile(
                "dni.pdf", b"fake", content_type="application/pdf"
            ),
        }
        resp = self.client.post(upload_url, payload)
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(applicant.documents.count(), 1)
