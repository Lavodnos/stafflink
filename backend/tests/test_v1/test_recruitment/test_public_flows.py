from __future__ import annotations

from datetime import timedelta

from django.utils import timezone
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase

from api.v1.recruitment import models

from .utils import create_campaign, create_link


class PublicFlowTests(APITestCase):
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
            status=models.Link.Estado.EXPIRADO,
        )
        url = reverse("public:public-link", kwargs={"slug": expired_link.slug})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)

    def test_public_link_returns_active(self) -> None:
        url = reverse("public:public-link", kwargs={"slug": self.link.slug})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["slug"], self.link.slug)
        self.assertEqual(data["titulo"], self.link.titulo)

    def test_create_candidate_with_valid_link(self) -> None:
        url = reverse("public:public-candidate")
        payload = {
            "link_slug": self.link.slug,
            "tipo_documento": models.Candidate.DocumentType.DNI,
            "numero_documento": "87654321",
            "apellido_paterno": "LOPEZ",
            "apellido_materno": "RAMIREZ",
            "nombres_completos": "MARIA LOPEZ",
            "telefono": "999000111",
            "telefono_referencia": "988888888",
            "email": "maria@example.com",
        }
        resp = self.client.post(url, payload, format="json")
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        self.assertEqual(data["numero_documento"], "87654321")
        self.assertIn("id", data)

    def test_create_candidate_with_invalid_link(self) -> None:
        url = reverse("public:public-candidate")
        payload = {
            "link_slug": "no-existe",
            "tipo_documento": models.Candidate.DocumentType.DNI,
            "numero_documento": "1234",
            "apellido_paterno": "X",
            "apellido_materno": "",
            "nombres_completos": "X",
            "telefono": "123",
            "telefono_referencia": "123",
            "email": "test@example.com",
        }
        resp = self.client.post(url, payload, format="json")
        self.assertEqual(resp.status_code, 400)
