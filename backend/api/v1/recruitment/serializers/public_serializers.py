from __future__ import annotations

from django.utils import timezone
from rest_framework import serializers
from rest_framework.settings import api_settings

from .. import models
from ..services import candidate_service
from ..services.exceptions import CandidateError


class PublicLinkSerializer(serializers.ModelSerializer):
    campaign = serializers.CharField(source="campaign.nombre")

    class Meta:
        model = models.Link
        fields = [
            "id",
            "titulo",
            "slug",
            "campaign",
            "modalidad",
            "condicion",
            "hora_gestion",
            "descanso",
            "cuotas",
            "semana_trabajo",
            "expires_at",
        ]


class PublicCandidateSerializer(serializers.ModelSerializer):
    link_slug = serializers.SlugField(write_only=True)

    class Meta:
        model = models.Candidate
        fields = [
            "id",
            "link_slug",
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
        read_only_fields = (
            "id",
            "modalidad",
            "condicion",
            "hora_gestion",
            "descanso",
            "created_at",
            "updated_at",
        )

    def validate_link_slug(self, value: str) -> str:
        link = self._get_active_link(value)
        self.context["link"] = link
        return value

    def create(self, validated_data):
        link = self.context["link"]
        validated_data.pop("link_slug", None)
        try:
            return candidate_service.create_candidate(
                link=link, data=validated_data, actor_id=None
            )
        except CandidateError as exc:
            # Si viene con campo específico, devolver formato DRF estándar
            if exc.field:
                raise serializers.ValidationError({exc.field: [str(exc)]})
            # Si no se especifica campo, usar non_field_errors
            non_field = api_settings.NON_FIELD_ERRORS_KEY
            raise serializers.ValidationError({non_field: [str(exc)]})

    def _get_active_link(self, slug: str) -> models.Link:
        now = timezone.now()
        try:
            link = models.Link.objects.select_related("campaign").get(slug=slug)
        except models.Link.DoesNotExist as exc:
            raise serializers.ValidationError({"link_slug": ["Link no encontrado"]}) from exc
        if link.estado != models.Link.Estado.ACTIVO:
            raise serializers.ValidationError({"link_slug": ["El link no está activo"]})
        if link.expires_at < now:
            raise serializers.ValidationError({"link_slug": ["El link ya venció"]})
        return link
