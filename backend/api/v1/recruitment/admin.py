"""Configuración del admin para las entidades de reclutamiento."""

from __future__ import annotations

from django.contrib import admin

from . import models


@admin.register(models.Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "site_name", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("code", "name", "site_name")


@admin.register(models.RecruitmentLink)
class RecruitmentLinkAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "slug",
        "campaign",
        "owner_name",
        "status",
        "expires_at",
    )
    list_filter = ("status", "modality", "employment_condition")
    search_fields = ("title", "slug", "owner_name", "campaign__name", "campaign__code")
    autocomplete_fields = ("campaign",)


class ApplicantDocumentInline(admin.TabularInline):
    model = models.ApplicantDocument
    extra = 0
    readonly_fields = (
        "kind",
        "original_name",
        "content_type",
        "size_bytes",
        "file_path",
    )


@admin.register(models.Applicant)
class ApplicantAdmin(admin.ModelAdmin):
    list_display = (
        "last_name",
        "first_name",
        "document_type",
        "document_number",
        "status",
        "link",
        "submitted_at",
    )
    list_filter = ("status", "document_type", "link__campaign__name")
    search_fields = (
        "first_name",
        "last_name",
        "second_last_name",
        "document_number",
        "email",
    )
    autocomplete_fields = ("link",)
    inlines = [ApplicantDocumentInline]


@admin.register(models.Verification)
class VerificationAdmin(admin.ModelAdmin):
    list_display = ("applicant", "status", "reviewed_by_name", "decided_at")
    list_filter = ("status",)
    search_fields = (
        "applicant__first_name",
        "applicant__last_name",
        "reviewed_by_name",
    )


class SmartExportBatchItemInline(admin.TabularInline):
    model = models.SmartExportBatchItem
    extra = 0
    autocomplete_fields = ("applicant",)


@admin.register(models.SmartExportBatch)
class SmartExportBatchAdmin(admin.ModelAdmin):
    list_display = ("batch_code", "status", "generated_by_name", "generated_at")
    list_filter = ("status",)
    search_fields = ("batch_code", "generated_by_name")
    inlines = [SmartExportBatchItemInline]


@admin.register(models.AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("entity_type", "entity_id", "action", "actor_name", "created_at")
    list_filter = ("entity_type",)
    search_fields = ("entity_id", "actor_name", "action")
