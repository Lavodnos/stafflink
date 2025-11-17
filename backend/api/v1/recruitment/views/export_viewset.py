from __future__ import annotations

from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404
from rest_framework import decorators, mixins, response, status, viewsets

from .. import models
from ..permissions import permission_class
from ..request_context import get_user_id, get_user_name
from ..serializers.export_serializers import (SmartExportBatchCreateSerializer,
                                              SmartExportBatchDetailSerializer,
                                              SmartExportBatchSerializer)
from ..services.export_service import ExportService


class SmartExportBatchViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = models.SmartExportBatch.objects.prefetch_related("items")
    permission_map = {
        "list": ("exports.read",),
        "retrieve": ("exports.read",),
        "create": ("exports.create",),
        "file": ("exports.download",),
        "mark_created": ("exports.mark_created",),
    }

    def get_permissions(self):
        perms = self.permission_map.get(self.action)
        if perms:
            return [permission_class(*perms)()]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action == "create":
            return SmartExportBatchCreateSerializer
        if self.action in {"retrieve", "file", "mark_created"}:
            return SmartExportBatchDetailSerializer
        return SmartExportBatchSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        applicants = list(
            models.Applicant.objects.select_related("link", "link__campaign").filter(
                id__in=serializer.validated_data["applicant_ids"],
                status=models.Applicant.Status.VERIFIED_OK,
            )
        )
        service = self._export_service()
        batch = service.create_batch(
            applicants=applicants,
            actor_id=get_user_id(request),
            actor_name=get_user_name(request),
            notes=serializer.validated_data.get("notes", ""),
        )
        output = SmartExportBatchDetailSerializer(batch)
        headers = self.get_success_headers(output.data)
        return response.Response(
            output.data, status=status.HTTP_201_CREATED, headers=headers
        )

    @decorators.action(detail=True, methods=["get"], url_path="file")
    def file(self, request, pk=None):
        batch = self.get_object()
        if not batch.file_path:
            raise Http404("Batch sin archivo")
        file_path = Path(batch.file_path)
        if not file_path.exists():
            raise Http404("Archivo no encontrado")
        return FileResponse(
            open(file_path, "rb"), as_attachment=True, filename=file_path.name
        )

    @decorators.action(detail=True, methods=["post"], url_path="mark-created")
    def mark_created(self, request, pk=None):
        batch = self.get_object()
        service = self._export_service()
        service.mark_delivered(
            batch, actor_id=get_user_id(request), actor_name=get_user_name(request)
        )
        return response.Response(SmartExportBatchDetailSerializer(batch).data)

    def _export_service(self) -> ExportService:
        output_dir = getattr(
            settings,
            "STAFFLINK_EXPORT_OUTPUT_DIR",
            settings.STAFFLINK_STORAGE_BASE_PATH,
        )
        return ExportService(output_dir=output_dir)
