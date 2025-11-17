"""Helper para obtener el storage backend configurado."""

from __future__ import annotations

from functools import lru_cache

from django.conf import settings

from integrations.storage.base import StorageClient
from integrations.storage.local import LocalStorageClient
from integrations.storage.s3 import S3StorageClient


@lru_cache(maxsize=1)
def get_storage_client() -> StorageClient:
    backend = settings.STAFFLINK_STORAGE_BACKEND
    base_path = settings.STAFFLINK_STORAGE_BASE_PATH
    if backend == "s3":
        bucket = getattr(settings, "STAFFLINK_STORAGE_BUCKET", "")
        region = getattr(settings, "STAFFLINK_STORAGE_REGION", None)
        return S3StorageClient(base_path, bucket=bucket, region=region)
    return LocalStorageClient(base_path)
