"""Modelos del dominio de reclutamiento (modo ONE-PASS)."""

from __future__ import annotations

import uuid
from typing import Any

from django.core.validators import MaxValueValidator, MinValueValidator, RegexValidator
from django.db import models
from django.utils import timezone


class TimeStampedModel(models.Model):
    """Agrega campos de auditoría simples a los modelos."""

    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


def _empty_dict() -> dict[str, Any]:
    """Return a new dict for JSONField defaults."""

    return {}


class Campaign(TimeStampedModel):
    """Descripción base de la campaña."""

    class Status(models.TextChoices):
        ACTIVA = "activa", "Activa"
        INACTIVA = "inactiva", "Inactiva"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    codigo = models.CharField(max_length=50, unique=True, null=True, blank=True)
    area = models.CharField(max_length=120, blank=True, default="")
    nombre = models.CharField(max_length=255)
    sede = models.CharField(max_length=255, blank=True, default="")
    estado = models.CharField(
        max_length=20, choices=Status.choices, default=Status.ACTIVA
    )

    class Meta:
        ordering = ["nombre"]
        db_table = "campaign"

    def __str__(self) -> str:  # pragma: no cover - para admin
        return f"{self.codigo} - {self.nombre}"


class Blacklist(TimeStampedModel):
    """Personas vetadas para cualquier campaña."""

    class Status(models.TextChoices):
        ACTIVO = "activo", "Activo"
        INACTIVO = "inactivo", "Inactivo"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dni = models.CharField(max_length=16, unique=True)
    nombres = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, default="")
    estado = models.CharField(
        max_length=20, choices=Status.choices, default=Status.ACTIVO
    )

    class Meta:
        ordering = ["-updated_at"]
        db_table = "blacklist"

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.dni} - {self.nombres}"


class Link(TimeStampedModel):
    """Link de reclutamiento por campaña/grupo."""

    class Estado(models.TextChoices):
        ACTIVO = "activo", "Activo"
        EXPIRADO = "expirado", "Expirado"
        REVOCADO = "revocado", "Revocado"

    class Modalidad(models.TextChoices):
        PRESENCIAL = "presencial", "Presencial"
        REMOTO = "remoto", "Remoto"
        HIBRIDO = "hibrido", "Híbrido"

    class Condicion(models.TextChoices):
        FULL_TIME = "full_time", "Full Time"
        PART_TIME = "part_time", "Part Time"
        FLEX = "flex", "Flexible"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(
        Campaign,
        on_delete=models.PROTECT,
        related_name="links",
        db_index=True,
    )
    grupo = models.CharField(max_length=50, blank=True, default="")
    user_id = models.UUIDField(null=True, blank=True)
    user_name = models.CharField(max_length=255, blank=True, default="")
    periodo = models.CharField(max_length=32, blank=True, default="")
    slug = models.SlugField(max_length=64, unique=True)
    titulo = models.CharField(max_length=255)
    cuotas = models.PositiveIntegerField(null=True, blank=True)
    semana_trabajo = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(53)],
    )
    expires_at = models.DateTimeField(help_text="Fecha/hora límite del link")
    notes = models.TextField(blank=True, default="")
    modalidad = models.CharField(
        max_length=20,
        choices=Modalidad.choices,
        default=Modalidad.PRESENCIAL,
    )
    condicion = models.CharField(
        max_length=20,
        choices=Condicion.choices,
        default=Condicion.FULL_TIME,
    )
    estado = models.CharField(
        max_length=20, choices=Estado.choices, default=Estado.ACTIVO, db_index=True
    )
    hora_gestion = models.CharField(max_length=64, blank=True, default="")
    descanso = models.CharField(max_length=64, blank=True, default="")
    created_by = models.UUIDField(null=True, blank=True)
    updated_by = models.UUIDField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        db_table = "link"

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.titulo} ({self.slug})"


class Candidate(TimeStampedModel):
    """Ficha declarativa del postulante."""

    class DocumentType(models.TextChoices):
        DNI = "dni", "DNI"
        CE = "ce", "Carné extranjería"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    link = models.ForeignKey(
        Link,
        on_delete=models.PROTECT,
        related_name="candidates",
        db_index=True,
    )
    tipo_documento = models.CharField(max_length=10, choices=DocumentType.choices)
    numero_documento = models.CharField(
        max_length=16,
        validators=[RegexValidator(r"^[0-9A-Za-z]{4,16}$", "Formato inválido")],
    )
    apellido_paterno = models.CharField(max_length=150)
    apellido_materno = models.CharField(max_length=150, blank=True, default="")
    nombres_completos = models.CharField(max_length=255)
    telefono = models.CharField(max_length=32)
    telefono_referencia = models.CharField(max_length=32, blank=True, default="")
    email = models.EmailField()
    sexo = models.CharField(max_length=50, blank=True, default="")
    fecha_nacimiento = models.DateField(null=True, blank=True)
    edad = models.PositiveSmallIntegerField(null=True, blank=True)
    estado_civil = models.CharField(max_length=64, blank=True, default="")
    numero_hijos = models.PositiveSmallIntegerField(null=True, blank=True)
    nivel_academico = models.CharField(max_length=120, blank=True, default="")
    carrera = models.CharField(max_length=120, blank=True, default="")
    nacionalidad = models.CharField(max_length=120, blank=True, default="")
    lugar_residencia = models.CharField(max_length=255, blank=True, default="")
    distrito = models.CharField(max_length=120, blank=True, default="")
    direccion = models.CharField(max_length=255, blank=True, default="")
    has_callcenter_experience = models.BooleanField(default=False)
    callcenter_experience_type = models.CharField(
        max_length=255, blank=True, default=""
    )
    callcenter_experience_time = models.CharField(
        max_length=100, blank=True, default=""
    )
    other_experience_type = models.CharField(max_length=255, blank=True, default="")
    other_experience_time = models.CharField(max_length=100, blank=True, default="")
    enteraste_oferta = models.CharField(max_length=255, blank=True, default="")
    observacion = models.TextField(blank=True, default="")
    modalidad = models.CharField(max_length=20, blank=True, default="")
    condicion = models.CharField(max_length=20, blank=True, default="")
    hora_gestion = models.CharField(max_length=64, blank=True, default="")
    descanso = models.CharField(max_length=64, blank=True, default="")
    created_by = models.UUIDField(null=True, blank=True)
    updated_by = models.UUIDField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["link", "tipo_documento", "numero_documento"],
                name="unique_document_per_link",
            )
        ]
        db_table = "candidate"

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.numero_documento} - {self.nombres_completos}"


class CandidateDocuments(TimeStampedModel):
    """Checklist documental asociado a un postulante."""

    class Status(models.TextChoices):
        PENDIENTE = "pendiente", "Pendiente"
        COMPLETO = "completo", "Completo"
        OBSERVADO = "observado", "Observado"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.OneToOneField(
        Candidate,
        on_delete=models.CASCADE,
        related_name="documents",
    )
    cv_entregado = models.BooleanField(default=False)
    dni_entregado = models.BooleanField(default=False)
    certificado_entregado = models.BooleanField(default=False)
    recibo_servicio_entregado = models.BooleanField(default=False)
    ficha_datos_entregado = models.BooleanField(default=False)
    autorizacion_datos_entregado = models.BooleanField(default=False)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDIENTE
    )
    observacion = models.TextField(blank=True, default="")

    def __str__(self) -> str:  # pragma: no cover
        return f"Checklist {self.candidate_id}"

    class Meta:
        db_table = "candidate_documents"


class CandidateProcess(TimeStampedModel):
    """Estado operativo del postulante (hitos BO)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.OneToOneField(
        Candidate,
        on_delete=models.CASCADE,
        related_name="process",
    )
    envio_dni_at = models.DateTimeField(null=True, blank=True)
    test_psicologico_at = models.DateTimeField(null=True, blank=True)
    validacion_pc_at = models.DateTimeField(null=True, blank=True)
    evaluacion_dia0_at = models.DateTimeField(null=True, blank=True)
    inicio_capacitacion_at = models.DateTimeField(null=True, blank=True)
    fin_capacitacion_at = models.DateTimeField(null=True, blank=True)
    conexion_ojt_at = models.DateTimeField(null=True, blank=True)
    conexion_op_at = models.DateTimeField(null=True, blank=True)
    pago_capacitacion_at = models.DateTimeField(null=True, blank=True)
    estado_dia0 = models.CharField(max_length=64, blank=True, default="")
    observaciones_dia0 = models.TextField(blank=True, default="")
    estado_dia1 = models.CharField(max_length=64, blank=True, default="")
    observaciones_dia1 = models.TextField(blank=True, default="")
    windows_status = models.CharField(max_length=64, blank=True, default="")
    asistencia_extra = models.JSONField(default=_empty_dict, blank=True)
    status_final = models.CharField(max_length=64, blank=True, default="")
    status_observacion = models.TextField(blank=True, default="")
    updated_by = models.UUIDField(null=True, blank=True)

    def __str__(self) -> str:  # pragma: no cover
        return f"Proceso {self.candidate_id}"

    class Meta:
        db_table = "candidate_process"


class CandidateAssignment(TimeStampedModel):
    """Datos contractuales y pagos proyectados."""

    class Estado(models.TextChoices):
        ACTIVO = "activo", "Activo"
        CESE = "cese", "Cese"
        BAJA = "baja", "Baja"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.OneToOneField(
        Candidate,
        on_delete=models.CASCADE,
        related_name="assignment",
    )
    tipo_contratacion = models.CharField(max_length=64, blank=True, default="")
    razon_social = models.CharField(max_length=120, blank=True, default="")
    remuneracion = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    bono_variable = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    bono_movilidad = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    bono_bienvenida = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    bono_permanencia = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    bono_asistencia = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    cargo_contractual = models.CharField(max_length=120, blank=True, default="")
    regimen_pago = models.CharField(max_length=64, blank=True, default="")
    fecha_inicio = models.DateField(null=True, blank=True)
    fecha_fin = models.DateField(null=True, blank=True)
    estado = models.CharField(
        max_length=20, choices=Estado.choices, default=Estado.ACTIVO
    )

    def __str__(self) -> str:  # pragma: no cover
        return f"Contrato {self.candidate_id}"

    class Meta:
        db_table = "candidate_assignment"


__all__ = [
    "Campaign",
    "Blacklist",
    "Link",
    "Candidate",
    "CandidateDocuments",
    "CandidateProcess",
    "CandidateAssignment",
]
