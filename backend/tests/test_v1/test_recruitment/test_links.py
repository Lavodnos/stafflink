from __future__ import annotations

import uuid

from rest_framework.reverse import reverse
from rest_framework.test import APITestCase

from .utils import create_campaign, create_link


class LinkViewSetTests(APITestCase):
    def setUp(self) -> None:
        self.campaign = create_campaign()
        self.owner_id = uuid.uuid4()
        self.other_owner_id = uuid.uuid4()
        self.main_link = create_link(
            self.campaign,
            slug="primary-link",
            owner_id=self.owner_id,
        )
        self.other_link = create_link(
            self.campaign,
            slug="secondary-link",
            owner_id=self.other_owner_id,
        )

    def _auth_headers(
        self, *, user_id: uuid.UUID, permissions: list[str]
    ) -> dict[str, str]:
        return {
            "HTTP_X_STAFFLINK_USER_ID": str(user_id),
            "HTTP_X_STAFFLINK_PERMISSIONS": ",".join(permissions),
        }

    def test_list_filters_by_owner_when_only_read_own(self) -> None:
        url = reverse("links-list")
        response = self.client.get(
            url,
            **self._auth_headers(user_id=self.owner_id, permissions=["links.read"]),
        )

        self.assertEqual(response.status_code, 200)
        slugs = {item["slug"] for item in response.json()}
        self.assertEqual(slugs, {self.main_link.slug})

    def test_expire_action_allows_owner_with_expire_own(self) -> None:
        url = reverse("links-expire", args=[self.main_link.pk])
        response = self.client.post(
            url,
            **self._auth_headers(user_id=self.owner_id, permissions=["links.close"]),
        )

        self.assertEqual(response.status_code, 200)
        self.main_link.refresh_from_db()
        self.assertEqual(self.main_link.estado, "expirado")

    def test_non_owner_cannot_expire_without_global_permission(self) -> None:
        url = reverse("links-expire", args=[self.main_link.pk])
        response = self.client.post(
            url,
            **self._auth_headers(user_id=self.other_owner_id, permissions=["links.close"]),
        )

        self.assertEqual(response.status_code, 404)
        self.main_link.refresh_from_db()
        self.assertEqual(self.main_link.estado, "activo")

    def test_list_all_when_user_has_read_all_permission(self) -> None:
        url = reverse("links-list")
        response = self.client.get(
            url,
            **self._auth_headers(
                user_id=self.owner_id, permissions=["links.read", "links.manage"]
            ),
        )

        self.assertEqual(response.status_code, 200)
        slugs = {item["slug"] for item in response.json()}
        self.assertEqual(slugs, {self.main_link.slug, self.other_link.slug})
