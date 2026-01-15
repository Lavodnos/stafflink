"""Servicios para operar sobre candidatos y sus entidades relacionadas."""

from __future__ import annotations

from django.db import IntegrityError, transaction
from django.utils import timezone

from .. import models
from ..validators.document_validator import validate_document
from .exceptions import CandidateError


def _sanitize(value: str | None) -> str:
    return (value or "").strip().upper()


def _ensure_not_blacklisted(tipo_documento: str, numero_documento: str) -> None:
    if tipo_documento != "dni":
        return
    exists = models.Blacklist.objects.filter(
        dni=_sanitize(numero_documento), estado=models.Blacklist.Status.ACTIVO
    ).exists()
    if exists:
        raise CandidateError(
            "El documento se encuentra en blacklist.", field="numero_documento"
        )


def _ensure_convocatoria_available(link: models.Link) -> None:
    if link.estado != models.Link.Estado.ACTIVO:
        raise CandidateError("La convocatoria no está activa.")
    if link.expires_at < timezone.now():
        raise CandidateError("La convocatoria ya venció.")


def _apply_defaults(link: models.Link, data: dict[str, object]) -> None:
    data.setdefault("modalidad", link.modalidad)
    data.setdefault("condicion", link.condicion)
    data.setdefault("hora_gestion", link.hora_gestion)
    data.setdefault("descanso", link.descanso)


def _ensure_related(candidate: models.Candidate, actor_id: str | None) -> None:
    link = candidate.link
    models.CandidateDocuments.objects.get_or_create(candidate=candidate)
    models.CandidateProcess.objects.get_or_create(
        candidate=candidate, defaults={"updated_by": actor_id}
    )
    assignment_defaults = {
        "tipo_contratacion": link.tipo_contratacion,
        "razon_social": link.razon_social,
        "remuneracion": link.remuneracion,
        "bono_variable": link.bono_variable,
        "bono_movilidad": link.bono_movilidad,
        "bono_bienvenida": link.bono_bienvenida,
        "bono_permanencia": link.bono_permanencia,
        "bono_asistencia": link.bono_asistencia,
        "cargo_contractual": link.cargo_contractual,
    }
    models.CandidateAssignment.objects.get_or_create(
        candidate=candidate, defaults=assignment_defaults
    )


def create_candidate(
    *, link: models.Link, data: dict[str, object], actor_id: str | None
) -> models.Candidate:
    _ensure_convocatoria_available(link)
    doc_type = str(data["tipo_documento"])  # type: ignore[index]
    doc_number = str(data["numero_documento"])  # type: ignore[index]
    numero_documento = validate_document(
        doc_type,
        doc_number,
    )
    _ensure_not_blacklisted(doc_type, numero_documento)
    payload = {**data}
    payload["numero_documento"] = numero_documento
    payload["tipo_documento"] = doc_type
    payload["link"] = link
    payload["created_by"] = actor_id
    payload["updated_by"] = actor_id
    _apply_defaults(link, payload)
    try:
        with transaction.atomic():
            candidate = models.Candidate.objects.create(**payload)
            _ensure_related(candidate, actor_id)
    except IntegrityError as exc:
        raise CandidateError(
            "Ya existe un postulante con ese documento para esta convocatoria."
        ) from exc
    return candidate


def update_candidate(
    *, candidate: models.Candidate, data: dict[str, object], actor_id: str | None
) -> models.Candidate:
    if "numero_documento" in data:
        doc_type = str(data.get("tipo_documento", candidate.tipo_documento))
        data["numero_documento"] = validate_document(
            doc_type, str(data["numero_documento"])  # type: ignore[index]
        )
    if "tipo_documento" in data and "numero_documento" in data:
        _ensure_not_blacklisted(
            str(data["tipo_documento"]), str(data["numero_documento"])  # type: ignore[index]
        )
    for field, value in data.items():
        setattr(candidate, field, value)
    candidate.updated_by = actor_id
    candidate.save()
    return candidate


def update_documents(
    *, candidate: models.Candidate, data: dict[str, object]
) -> models.CandidateDocuments:
    docs, _ = models.CandidateDocuments.objects.get_or_create(candidate=candidate)
    for field, value in data.items():
        setattr(docs, field, value)
    docs.save()
    return docs


def update_process(
    *, candidate: models.Candidate, data: dict[str, object], actor_id: str | None
) -> models.CandidateProcess:
    process, _ = models.CandidateProcess.objects.get_or_create(candidate=candidate)
    for field, value in data.items():
        setattr(process, field, value)
    process.updated_by = actor_id
    process.save()
    return process


def update_assignment(
    *, candidate: models.Candidate, data: dict[str, object]
) -> models.CandidateAssignment:
    assignment, _ = models.CandidateAssignment.objects.get_or_create(
        candidate=candidate
    )
    for field, value in data.items():
        setattr(assignment, field, value)
    assignment.save()
    return assignment
