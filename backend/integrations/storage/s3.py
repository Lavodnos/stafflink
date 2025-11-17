"""Placeholder para almacenamiento en S3/compatibles."""

from __future__ import annotations

from typing import BinaryIO

from .base import StorageClient, StorageError


class S3StorageClient(StorageClient):
    """Se implementará cuando Stafflink despliegue en la nube."""

    def __init__(
        self, base_path: str, *, bucket: str, region: str | None = None
    ) -> None:
        super().__init__(base_path)
        self.bucket = bucket
        self.region = region

    def save(self, file_obj: BinaryIO, *, destination: str, content_type: str) -> str:  # type: ignore[override]
        raise StorageError("S3StorageClient no está implementado todavía")

    def delete(self, destination: str) -> None:  # type: ignore[override]
        raise StorageError("S3StorageClient no está implementado todavía")
