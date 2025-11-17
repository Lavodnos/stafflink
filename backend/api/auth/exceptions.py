"""Custom exceptions for IAM integration."""

from rest_framework import status
from rest_framework.exceptions import APIException


class IAMServiceError(APIException):
    """Wraps errors returned by the IAM service."""

    status_code = status.HTTP_502_BAD_GATEWAY
    default_detail = {
        "error": "IAM_SERVICE_ERROR",
        "message": "El servicio de identidad respondió con un error inesperado.",
    }
    default_code = "iam_service_error"

    def __init__(self, *, status_code: int | None = None, detail=None, code=None):
        if status_code is not None:
            self.status_code = status_code
        super().__init__(detail=detail, code=code)


class IAMUnavailableError(APIException):
    """Raised when IAM cannot be reached."""

    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = {
        "error": "IAM_UNAVAILABLE",
        "message": "No podemos conectarnos con el servicio de identidad. Intenta nuevamente en unos minutos.",
    }
    default_code = "iam_unavailable"
