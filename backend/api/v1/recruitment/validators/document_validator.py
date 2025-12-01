"""Validaciones de documentos (DNI/CE)."""

from __future__ import annotations

from api.v1.recruitment.services.exceptions import CandidateError


def validate_document(document_type: str, document_number: str) -> str:
    document_number = (document_number or "").upper()
    if document_type == "dni":
        if len(document_number) != 8 or not document_number.isdigit():
            raise CandidateError(
                "El DNI debe tener 8 dígitos.", field="numero_documento"
            )
    elif document_type == "ce":
        if len(document_number) not in {9, 12}:
            raise CandidateError(
                "El CE debe tener 9-12 caracteres.", field="numero_documento"
            )
    else:
        raise CandidateError(
            "Tipo de documento no soportado.", field="tipo_documento"
        )
    return document_number
