"""Custom exceptions for IAM integration."""

from rest_framework import status
from rest_framework.exceptions import APIException


class IAMServiceError(APIException):
    """Wraps errors returned by the IAM service."""

    status_code = status.HTTP_502_BAD_GATEWAY
    default_detail = {"detail": "IAM service error"}
    default_code = "iam_service_error"

    def __init__(self, *, status_code: int | None = None, detail=None, code=None):
        if status_code is not None:
            self.status_code = status_code
        super().__init__(detail=detail, code=code)


class IAMUnavailableError(APIException):
    """Raised when IAM cannot be reached."""

    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = {"detail": "IAM service is unavailable"}
    default_code = "iam_unavailable"
