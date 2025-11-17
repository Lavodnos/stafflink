from __future__ import annotations

from rest_framework import serializers

from .. import models


class ApplicantQueueSerializer(serializers.ModelSerializer):
    campaign = serializers.CharField(source="link.campaign.name")
    link_title = serializers.CharField(source="link.title")

    class Meta:
        model = models.Applicant
        fields = [
            "id",
            "first_name",
            "last_name",
            "document_type",
            "document_number",
            "status",
            "submitted_at",
            "campaign",
            "link_title",
        ]


class ApplicantDetailSerializer(serializers.ModelSerializer):
    link = serializers.CharField(source="link.title")
    campaign = serializers.CharField(source="link.campaign.name")
    documents = serializers.SerializerMethodField()

    class Meta:
        model = models.Applicant
        fields = [
            "id",
            "first_name",
            "last_name",
            "second_last_name",
            "document_type",
            "document_number",
            "email",
            "phone",
            "alternate_phone",
            "status",
            "submitted_at",
            "link",
            "campaign",
            "documents",
        ]

    def get_documents(self, obj: models.Applicant):
        return [
            {
                "id": str(doc.id),
                "kind": doc.kind,
                "original_name": doc.original_name,
                "url": doc.file_path,
            }
            for doc in obj.documents.all()
        ]


class ApplicantControlledUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    second_last_name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False)
    alternate_phone = serializers.CharField(required=False, allow_blank=True)


class VerificationDecisionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=models.Verification.Status.choices)
    reason = serializers.CharField(required=False, allow_blank=True)


class VerificationCorrectionSerializer(serializers.Serializer):
    message = serializers.CharField()
