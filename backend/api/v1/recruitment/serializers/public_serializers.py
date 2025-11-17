from __future__ import annotations

from django.utils import timezone
from rest_framework import serializers

from .. import models
from ..services import applicant_service


class PublicLinkSerializer(serializers.ModelSerializer):
    campaign = serializers.CharField(source="campaign.name")

    class Meta:
        model = models.RecruitmentLink
        fields = [
            "title",
            "slug",
            "campaign",
            "status",
            "modality",
            "employment_condition",
            "period_label",
            "period_start",
            "period_end",
            "rest_day",
            "work_week",
            "expires_at",
        ]


class ApplicantDraftSerializer(serializers.ModelSerializer):
    link_slug = serializers.SlugField(write_only=True)

    class Meta:
        model = models.Applicant
        fields = [
            "id",
            "link_slug",
            "first_name",
            "last_name",
            "second_last_name",
            "document_type",
            "document_number",
            "birth_date",
            "email",
            "phone",
            "alternate_phone",
        ]
        read_only_fields = ("id",)

    def validate_link_slug(self, value: str) -> str:
        link = self._get_active_link(value)
        self.context["link"] = link
        return value

    def create(self, validated_data):
        link = self.context["link"]
        validated_data.pop("link_slug", None)
        return applicant_service.create_applicant(link=link, data=validated_data)

    def _get_active_link(self, slug: str) -> models.RecruitmentLink:
        now = timezone.now()
        try:
            link = models.RecruitmentLink.objects.select_related("campaign").get(
                slug=slug
            )
        except models.RecruitmentLink.DoesNotExist as exc:
            raise serializers.ValidationError("Link no encontrado") from exc
        if link.status != models.RecruitmentLink.LinkStatus.ACTIVE:
            raise serializers.ValidationError("El link no está activo")
        if link.expires_at < now:
            raise serializers.ValidationError("El link ya venció")
        return link


class ApplicantPublicSerializer(serializers.ModelSerializer):
    documents = serializers.SerializerMethodField()

    class Meta:
        model = models.Applicant
        fields = [
            "id",
            "link",
            "first_name",
            "last_name",
            "second_last_name",
            "document_type",
            "document_number",
            "birth_date",
            "email",
            "phone",
            "alternate_phone",
            "status",
            "submitted_at",
            "documents",
        ]
        read_only_fields = fields

    def get_documents(self, obj: models.Applicant) -> list[dict[str, str]]:
        return [
            {
                "id": str(doc.id),
                "kind": doc.kind,
                "original_name": doc.original_name,
                "uploaded_at": doc.created_at,
            }
            for doc in obj.documents.all()
        ]


class ApplicantUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Applicant
        fields = [
            "first_name",
            "last_name",
            "second_last_name",
            "document_type",
            "document_number",
            "birth_date",
            "email",
            "phone",
            "alternate_phone",
        ]


class ApplicantSubmitSerializer(serializers.Serializer):
    lpdp_consent = serializers.BooleanField()


class ApplicantUploadSerializer(serializers.Serializer):
    applicant_id = serializers.UUIDField()
    kind = serializers.ChoiceField(
        choices=models.ApplicantDocument.DocumentKind.choices
    )
    file = serializers.FileField()
