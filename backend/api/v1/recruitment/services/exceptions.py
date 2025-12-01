"""Excepciones de dominio para recruitment."""

from __future__ import annotations


class CandidateError(Exception):
  """
  Error de dominio para candidatos.

  Permite opcionalmente asociar el mensaje a un campo específico del formulario
  (por ejemplo, numero_documento), de modo que la capa DRF pueda devolverlo
  en el formato estándar {campo: [mensaje]}.
  """

  def __init__(self, message: str, field: str | None = None):
    super().__init__(message)
    self.field = field
