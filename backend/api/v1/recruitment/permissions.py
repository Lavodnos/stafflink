"""Permisos basados en roles/permisos provenientes de IAM."""

from __future__ import annotations

from typing import Set

from rest_framework.permissions import BasePermission


def get_permissions_from_request(request) -> Set[str]:
    """Intenta leer los permisos adjuntos a la solicitud.

    La autenticación definitiva todavía no está implementada, pero este helper ya soporta
    varios escenarios: objetos auth estilo dict, usuarios con atributo `permissions`
    y el header `X-Stafflink-Permissions` para pruebas locales.
    """

    candidates: list[str] = []
    auth = getattr(request, "auth", None)
    if isinstance(auth, dict):
        values = auth.get("permissions") or auth.get("perms")
        if isinstance(values, (list, tuple, set)):
            candidates.extend(str(value) for value in values)
    user = getattr(request, "user", None)
    if hasattr(user, "permissions"):
        perms = getattr(user, "permissions")
        if isinstance(perms, (list, tuple, set)):
            candidates.extend(str(value) for value in perms)
    header = request.META.get("HTTP_X_STAFFLINK_PERMISSIONS")
    if header:
        candidates.extend(part.strip() for part in header.split(",") if part.strip())
    return {perm.strip().lower() for perm in candidates if perm}


class HasIAMPermissions(BasePermission):
    """Verifica que el request incluya todos los permisos requeridos."""

    required_permissions: tuple[str, ...] = tuple()

    def has_permission(self, request, view) -> bool:  # type: ignore[override]
        if not self.required_permissions:
            return True
        current = get_permissions_from_request(request)
        return all(perm.lower() in current for perm in self.required_permissions)


class HasAnyIAMPermission(HasIAMPermissions):
    """Autoriza cuando el usuario tiene al menos uno de los permisos requeridos."""

    def has_permission(self, request, view) -> bool:  # type: ignore[override]
        if not self.required_permissions:
            return True
        current = get_permissions_from_request(request)
        return any(perm.lower() in current for perm in self.required_permissions)


def permission_class(*permissions: str) -> type[HasIAMPermissions]:
    """Factory helper para evitar clases boilerplate en los viewsets."""

    class _Permission(HasIAMPermissions):
        required_permissions = tuple(perm.lower() for perm in permissions)

    return _Permission


def request_has_permission(request, permission: str) -> bool:
    return permission.lower() in get_permissions_from_request(request)
