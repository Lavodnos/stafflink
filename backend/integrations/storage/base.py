"""Interfaces base para almacenamiento de archivos."""

from __future__ import annotations

import abc
from pathlib import Path
from typing import BinaryIO


class StorageError(RuntimeError):
    """Error genérico al interactuar con el backend de almacenamiento."""


class StorageClient(abc.ABC):
    """Cliente base para almacenar archivos generados por Stafflink."""

    def __init__(self, base_path: str) -> None:
        self.base_path = Path(base_path)

    @abc.abstractmethod
    def save(self, file_obj: BinaryIO, *, destination: str, content_type: str) -> str:
        """Guarda un archivo y devuelve la ruta lógica resultante."""

    @abc.abstractmethod
    def delete(self, destination: str) -> None:
        """Elimina un archivo previamente guardado."""
