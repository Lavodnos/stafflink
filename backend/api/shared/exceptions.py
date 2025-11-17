"""Excepciones genéricas del dominio Stafflink."""

from __future__ import annotations

from rest_framework import status
from rest_framework.exceptions import APIException


class DomainError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Error en la operación solicitada."


class ForbiddenOperation(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "No cuenta con permisos para realizar esta acción."
