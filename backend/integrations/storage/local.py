"""Implementación local (filesystem) para desarrollo."""

from __future__ import annotations

from pathlib import Path
from typing import BinaryIO

from .base import StorageClient, StorageError


class LocalStorageClient(StorageClient):
    """Guarda archivos en el filesystem local dentro de `base_path`."""

    def save(self, file_obj: BinaryIO, *, destination: str, content_type: str) -> str:  # type: ignore[override]
        target_path = self.base_path / destination
        target_path.parent.mkdir(parents=True, exist_ok=True)
        try:
            with target_path.open("wb") as handle:
                handle.write(file_obj.read())
        except OSError as exc:  # pragma: no cover - errores del sistema
            raise StorageError(str(exc)) from exc
        return str(target_path)

    def delete(self, destination: str) -> None:  # type: ignore[override]
        path = Path(destination)
        if not path.is_absolute():
            path = self.base_path / destination
        try:
            path.unlink(missing_ok=True)
        except OSError as exc:  # pragma: no cover
            raise StorageError(str(exc)) from exc
