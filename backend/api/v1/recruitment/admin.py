"""Configuración del admin para las entidades de reclutamiento."""

from __future__ import annotations

from django.contrib import admin

from . import models


@admin.register(models.Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ("codigo", "nombre", "sede", "area", "estado", "created_at")
    list_filter = ("estado", "sede")
    search_fields = ("codigo", "nombre", "sede", "area")


@admin.register(models.Blacklist)
class BlacklistAdmin(admin.ModelAdmin):
    list_display = ("dni", "nombres", "estado", "updated_at")
    list_filter = ("estado",)
    search_fields = ("dni", "nombres")


@admin.register(models.Link)
class LinkAdmin(admin.ModelAdmin):
    list_display = (
        "titulo",
        "slug",
        "campaign",
        "grupo",
        "user_name",
        "estado",
        "expires_at",
    )
    list_filter = ("estado", "modalidad", "condicion")
    search_fields = (
        "titulo",
        "slug",
        "grupo",
        "campaign__codigo",
        "campaign__nombre",
        "user_name",
    )
    autocomplete_fields = ("campaign",)


class CandidateDocumentsInline(admin.StackedInline):
    model = models.CandidateDocuments
    extra = 0


class CandidateProcessInline(admin.StackedInline):
    model = models.CandidateProcess
    extra = 0


class CandidateAssignmentInline(admin.StackedInline):
    model = models.CandidateAssignment
    extra = 0


@admin.register(models.Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = (
        "numero_documento",
        "nombres_completos",
        "link",
        "email",
        "telefono",
        "created_at",
    )
    list_filter = ("link__campaign__nombre", "has_callcenter_experience")
    search_fields = (
        "numero_documento",
        "nombres_completos",
        "apellido_paterno",
        "apellido_materno",
        "email",
        "telefono",
    )
    autocomplete_fields = ("link",)
    inlines = [
        CandidateDocumentsInline,
        CandidateProcessInline,
        CandidateAssignmentInline,
    ]
