"""Validaciones de documentos (DNI/CE)."""

from __future__ import annotations

from rest_framework import serializers


def validate_document(document_type: str, document_number: str) -> str:
    document_number = (document_number or "").upper()
    if document_type == "dni":
        if len(document_number) != 8 or not document_number.isdigit():
            raise serializers.ValidationError("El DNI debe tener 8 dígitos.")
    elif document_type == "ce":
        if len(document_number) not in {9, 12}:
            raise serializers.ValidationError("El CE debe tener 9-12 caracteres.")
    else:
        raise serializers.ValidationError("Tipo de documento no soportado.")
    return document_number
