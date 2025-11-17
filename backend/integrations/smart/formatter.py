"""Helpers para formar la carga de Smart Boleta."""

from __future__ import annotations

from typing import Iterable, Mapping


class SmartFormatter:
    """Transforma postulantes en filas compatibles con Smart."""

    def build_rows(self, applicants: Iterable[Mapping[str, str]]) -> list[list[str]]:
        rows: list[list[str]] = []
        for applicant in applicants:
            rows.append(
                [
                    applicant.get("document_number", ""),
                    applicant.get("full_name", ""),
                    applicant.get("campaign", ""),
                ]
            )
        return rows
