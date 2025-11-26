from __future__ import annotations

import uuid

import django.core.validators
import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models

import api.v1.recruitment.models


class Migration(migrations.Migration):
    initial = True

    dependencies: list[tuple[str, str]] = []

    operations = [
        migrations.CreateModel(
            name="Campaign",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(
                        default=django.utils.timezone.now, editable=False
                    ),
                ),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("codigo", models.CharField(max_length=50, unique=True)),
                ("area", models.CharField(blank=True, default="", max_length=120)),
                ("nombre", models.CharField(max_length=255)),
                ("sede", models.CharField(blank=True, default="", max_length=255)),
                (
                    "estado",
                    models.CharField(
                        choices=[("activa", "Activa"), ("inactiva", "Inactiva")],
                        default="activa",
                        max_length=20,
                    ),
                ),
            ],
            options={
                "ordering": ["nombre"],
                "db_table": "campaign",
            },
        ),
        migrations.CreateModel(
            name="Candidate",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(
                        default=django.utils.timezone.now, editable=False
                    ),
                ),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "tipo_documento",
                    models.CharField(
                        choices=[("dni", "DNI"), ("ce", "Carné extranjería")],
                        max_length=10,
                    ),
                ),
                (
                    "numero_documento",
                    models.CharField(
                        max_length=16,
                        validators=[
                            django.core.validators.RegexValidator(
                                "^[0-9A-Za-z]{4,16}$", "Formato inválido"
                            )
                        ],
                    ),
                ),
                ("apellido_paterno", models.CharField(max_length=150)),
                (
                    "apellido_materno",
                    models.CharField(blank=True, default="", max_length=150),
                ),
                ("nombres_completos", models.CharField(max_length=255)),
                ("telefono", models.CharField(max_length=32)),
                (
                    "telefono_referencia",
                    models.CharField(blank=True, default="", max_length=32),
                ),
                ("email", models.EmailField(max_length=254)),
                ("sexo", models.CharField(blank=True, default="", max_length=50)),
                ("fecha_nacimiento", models.DateField(blank=True, null=True)),
                ("edad", models.PositiveSmallIntegerField(blank=True, null=True)),
                (
                    "estado_civil",
                    models.CharField(blank=True, default="", max_length=64),
                ),
                (
                    "numero_hijos",
                    models.PositiveSmallIntegerField(blank=True, null=True),
                ),
                (
                    "nivel_academico",
                    models.CharField(blank=True, default="", max_length=120),
                ),
                ("carrera", models.CharField(blank=True, default="", max_length=120)),
                (
                    "nacionalidad",
                    models.CharField(blank=True, default="", max_length=120),
                ),
                (
                    "lugar_residencia",
                    models.CharField(blank=True, default="", max_length=255),
                ),
                ("distrito", models.CharField(blank=True, default="", max_length=120)),
                ("direccion", models.CharField(blank=True, default="", max_length=255)),
                ("has_callcenter_experience", models.BooleanField(default=False)),
                (
                    "callcenter_experience_type",
                    models.CharField(blank=True, default="", max_length=255),
                ),
                (
                    "callcenter_experience_time",
                    models.CharField(blank=True, default="", max_length=100),
                ),
                (
                    "other_experience_type",
                    models.CharField(blank=True, default="", max_length=255),
                ),
                (
                    "other_experience_time",
                    models.CharField(blank=True, default="", max_length=100),
                ),
                (
                    "enteraste_oferta",
                    models.CharField(blank=True, default="", max_length=255),
                ),
                ("observacion", models.TextField(blank=True, default="")),
                ("modalidad", models.CharField(blank=True, default="", max_length=20)),
                ("condicion", models.CharField(blank=True, default="", max_length=20)),
                (
                    "hora_gestion",
                    models.CharField(blank=True, default="", max_length=64),
                ),
                ("descanso", models.CharField(blank=True, default="", max_length=64)),
                ("created_by", models.UUIDField(blank=True, null=True)),
                ("updated_by", models.UUIDField(blank=True, null=True)),
            ],
            options={
                "ordering": ["-created_at"],
                "db_table": "candidate",
            },
        ),
        migrations.CreateModel(
            name="CandidateAssignment",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(
                        default=django.utils.timezone.now, editable=False
                    ),
                ),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "tipo_contratacion",
                    models.CharField(blank=True, default="", max_length=64),
                ),
                (
                    "razon_social",
                    models.CharField(blank=True, default="", max_length=120),
                ),
                (
                    "remuneracion",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=10, null=True
                    ),
                ),
                (
                    "bono_variable",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=10, null=True
                    ),
                ),
                (
                    "bono_movilidad",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=10, null=True
                    ),
                ),
                (
                    "bono_bienvenida",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=10, null=True
                    ),
                ),
                (
                    "bono_permanencia",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=10, null=True
                    ),
                ),
                (
                    "bono_asistencia",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=10, null=True
                    ),
                ),
                (
                    "cargo_contractual",
                    models.CharField(blank=True, default="", max_length=120),
                ),
                (
                    "regimen_pago",
                    models.CharField(blank=True, default="", max_length=64),
                ),
                ("fecha_inicio", models.DateField(blank=True, null=True)),
                ("fecha_fin", models.DateField(blank=True, null=True)),
                (
                    "estado",
                    models.CharField(
                        choices=[
                            ("activo", "Activo"),
                            ("cese", "Cese"),
                            ("baja", "Baja"),
                        ],
                        default="activo",
                        max_length=20,
                    ),
                ),
            ],
            options={
                "db_table": "candidate_assignment",
            },
        ),
        migrations.CreateModel(
            name="CandidateDocuments",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(
                        default=django.utils.timezone.now, editable=False
                    ),
                ),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("cv_entregado", models.BooleanField(default=False)),
                ("dni_entregado", models.BooleanField(default=False)),
                ("certificado_entregado", models.BooleanField(default=False)),
                ("recibo_servicio_entregado", models.BooleanField(default=False)),
                ("ficha_datos_entregado", models.BooleanField(default=False)),
                ("autorizacion_datos_entregado", models.BooleanField(default=False)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("pendiente", "Pendiente"),
                            ("completo", "Completo"),
                            ("observado", "Observado"),
                        ],
                        default="pendiente",
                        max_length=20,
                    ),
                ),
                ("observacion", models.TextField(blank=True, default="")),
            ],
            options={
                "db_table": "candidate_documents",
            },
        ),
        migrations.CreateModel(
            name="CandidateProcess",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(
                        default=django.utils.timezone.now, editable=False
                    ),
                ),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("envio_dni_at", models.DateTimeField(blank=True, null=True)),
                ("test_psicologico_at", models.DateTimeField(blank=True, null=True)),
                ("validacion_pc_at", models.DateTimeField(blank=True, null=True)),
                ("evaluacion_dia0_at", models.DateTimeField(blank=True, null=True)),
                ("inicio_capacitacion_at", models.DateTimeField(blank=True, null=True)),
                ("fin_capacitacion_at", models.DateTimeField(blank=True, null=True)),
                ("conexion_ojt_at", models.DateTimeField(blank=True, null=True)),
                ("conexion_op_at", models.DateTimeField(blank=True, null=True)),
                ("pago_capacitacion_at", models.DateTimeField(blank=True, null=True)),
                (
                    "estado_dia0",
                    models.CharField(blank=True, default="", max_length=64),
                ),
                ("observaciones_dia0", models.TextField(blank=True, default="")),
                (
                    "estado_dia1",
                    models.CharField(blank=True, default="", max_length=64),
                ),
                ("observaciones_dia1", models.TextField(blank=True, default="")),
                (
                    "windows_status",
                    models.CharField(blank=True, default="", max_length=64),
                ),
                (
                    "asistencia_extra",
                    models.JSONField(
                        blank=True, default=api.v1.recruitment.models._empty_dict
                    ),
                ),
                (
                    "status_final",
                    models.CharField(blank=True, default="", max_length=64),
                ),
                ("status_observacion", models.TextField(blank=True, default="")),
                ("updated_by", models.UUIDField(blank=True, null=True)),
            ],
            options={
                "db_table": "candidate_process",
            },
        ),
        migrations.CreateModel(
            name="Link",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(
                        default=django.utils.timezone.now, editable=False
                    ),
                ),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("grupo", models.CharField(blank=True, default="", max_length=50)),
                ("user_id", models.UUIDField(blank=True, null=True)),
                ("user_name", models.CharField(blank=True, default="", max_length=255)),
                ("periodo", models.CharField(blank=True, default="", max_length=32)),
                ("slug", models.SlugField(max_length=64, unique=True)),
                ("titulo", models.CharField(max_length=255)),
                ("cuotas", models.PositiveIntegerField(blank=True, null=True)),
                (
                    "semana_trabajo",
                    models.PositiveSmallIntegerField(
                        blank=True,
                        null=True,
                        validators=[
                            django.core.validators.MinValueValidator(1),
                            django.core.validators.MaxValueValidator(53),
                        ],
                    ),
                ),
                (
                    "expires_at",
                    models.DateTimeField(help_text="Fecha/hora límite del link"),
                ),
                ("notes", models.TextField(blank=True, default="")),
                (
                    "modalidad",
                    models.CharField(
                        choices=[
                            ("presencial", "Presencial"),
                            ("remoto", "Remoto"),
                            ("hibrido", "Híbrido"),
                        ],
                        default="presencial",
                        max_length=20,
                    ),
                ),
                (
                    "condicion",
                    models.CharField(
                        choices=[
                            ("full_time", "Full Time"),
                            ("part_time", "Part Time"),
                            ("flex", "Flexible"),
                        ],
                        default="full_time",
                        max_length=20,
                    ),
                ),
                (
                    "estado",
                    models.CharField(
                        choices=[
                            ("activo", "Activo"),
                            ("expirado", "Expirado"),
                            ("revocado", "Revocado"),
                        ],
                        db_index=True,
                        default="activo",
                        max_length=20,
                    ),
                ),
                (
                    "hora_gestion",
                    models.CharField(blank=True, default="", max_length=64),
                ),
                ("descanso", models.CharField(blank=True, default="", max_length=64)),
                ("created_by", models.UUIDField(blank=True, null=True)),
                ("updated_by", models.UUIDField(blank=True, null=True)),
                (
                    "campaign",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="links",
                        to="recruitment.campaign",
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
                "db_table": "link",
            },
        ),
        migrations.AddField(
            model_name="candidateprocess",
            name="candidate",
            field=models.OneToOneField(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="process",
                to="recruitment.candidate",
            ),
        ),
        migrations.AddField(
            model_name="candidatedocuments",
            name="candidate",
            field=models.OneToOneField(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="documents",
                to="recruitment.candidate",
            ),
        ),
        migrations.AddField(
            model_name="candidateassignment",
            name="candidate",
            field=models.OneToOneField(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="assignment",
                to="recruitment.candidate",
            ),
        ),
        migrations.AddField(
            model_name="candidate",
            name="link",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name="candidates",
                to="recruitment.link",
            ),
        ),
        migrations.CreateModel(
            name="Blacklist",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(
                        default=django.utils.timezone.now, editable=False
                    ),
                ),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("dni", models.CharField(max_length=16, unique=True)),
                ("nombres", models.CharField(max_length=255)),
                ("descripcion", models.TextField(blank=True, default="")),
                (
                    "estado",
                    models.CharField(
                        choices=[("activo", "Activo"), ("inactivo", "Inactivo")],
                        default="activo",
                        max_length=20,
                    ),
                ),
            ],
            options={
                "ordering": ["-updated_at"],
                "db_table": "blacklist",
            },
        ),
        migrations.AddConstraint(
            model_name="candidate",
            constraint=models.UniqueConstraint(
                fields=("link", "tipo_documento", "numero_documento"),
                name="unique_document_per_link",
            ),
        ),
    ]
