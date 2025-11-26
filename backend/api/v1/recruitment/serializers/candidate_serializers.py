from __future__ import annotations

from rest_framework import serializers

from .. import models
from ..request_context import get_user_id
from ..services import candidate_service


class LinkSummarySerializer(serializers.ModelSerializer):
    campaign_id = serializers.UUIDField(source="campaign.id", read_only=True)
    campaign_nombre = serializers.CharField(
        source="campaign.nombre", read_only=True, default=""
    )

    class Meta:
        model = models.Link
        fields = [
            "id",
            "slug",
            "titulo",
            "grupo",
            "campaign_id",
            "campaign_nombre",
        ]


class CandidateDocumentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.CandidateDocuments
        fields = [
            "id",
            "cv_entregado",
            "dni_entregado",
            "certificado_entregado",
            "recibo_servicio_entregado",
            "ficha_datos_entregado",
            "autorizacion_datos_entregado",
            "status",
            "observacion",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "created_at", "updated_at")


class CandidateProcessSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.CandidateProcess
        fields = [
            "id",
            "envio_dni_at",
            "test_psicologico_at",
            "validacion_pc_at",
            "evaluacion_dia0_at",
            "inicio_capacitacion_at",
            "fin_capacitacion_at",
            "conexion_ojt_at",
            "conexion_op_at",
            "pago_capacitacion_at",
            "estado_dia0",
            "observaciones_dia0",
            "estado_dia1",
            "observaciones_dia1",
            "windows_status",
            "asistencia_extra",
            "status_final",
            "status_observacion",
            "updated_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "created_at", "updated_at")


class CandidateAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.CandidateAssignment
        fields = [
            "id",
            "tipo_contratacion",
            "razon_social",
            "remuneracion",
            "bono_variable",
            "bono_movilidad",
            "bono_bienvenida",
            "bono_permanencia",
            "bono_asistencia",
            "cargo_contractual",
            "regimen_pago",
            "fecha_inicio",
            "fecha_fin",
            "estado",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "created_at", "updated_at")


class CandidateWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Candidate
        fields = [
            "id",
            "link",
            "tipo_documento",
            "numero_documento",
            "apellido_paterno",
            "apellido_materno",
            "nombres_completos",
            "telefono",
            "telefono_referencia",
            "email",
            "sexo",
            "fecha_nacimiento",
            "edad",
            "estado_civil",
            "numero_hijos",
            "nivel_academico",
            "carrera",
            "nacionalidad",
            "lugar_residencia",
            "distrito",
            "direccion",
            "has_callcenter_experience",
            "callcenter_experience_type",
            "callcenter_experience_time",
            "other_experience_type",
            "other_experience_time",
            "enteraste_oferta",
            "observacion",
            "modalidad",
            "condicion",
            "hora_gestion",
            "descanso",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "created_at", "updated_at")
        extra_kwargs = {"link": {"queryset": models.Link.objects.all()}}

    def create(self, validated_data):
        request = self.context["request"]
        actor_id = get_user_id(request)
        link = validated_data.pop("link")
        return candidate_service.create_candidate(
            link=link, data=validated_data, actor_id=actor_id
        )

    def update(self, instance, validated_data):
        request = self.context["request"]
        actor_id = get_user_id(request)
        return candidate_service.update_candidate(
            candidate=instance, data=validated_data, actor_id=actor_id
        )


class CandidateListSerializer(serializers.ModelSerializer):
    link = LinkSummarySerializer(read_only=True)

    class Meta:
        model = models.Candidate
        fields = [
            "id",
            "link",
            "tipo_documento",
            "numero_documento",
            "nombres_completos",
            "email",
            "telefono",
            "modalidad",
            "condicion",
            "hora_gestion",
            "descanso",
            "created_at",
            "updated_at",
        ]


class CandidateDetailSerializer(CandidateListSerializer):
    documents = CandidateDocumentsSerializer(read_only=True)
    process = CandidateProcessSerializer(read_only=True)
    assignment = CandidateAssignmentSerializer(read_only=True)

    class Meta(CandidateListSerializer.Meta):
        fields = CandidateListSerializer.Meta.fields + [
            "apellido_paterno",
            "apellido_materno",
            "sexo",
            "fecha_nacimiento",
            "edad",
            "estado_civil",
            "numero_hijos",
            "nivel_academico",
            "carrera",
            "nacionalidad",
            "lugar_residencia",
            "distrito",
            "direccion",
            "has_callcenter_experience",
            "callcenter_experience_type",
            "callcenter_experience_time",
            "other_experience_type",
            "other_experience_time",
            "enteraste_oferta",
            "observacion",
            "documents",
            "process",
            "assignment",
        ]
