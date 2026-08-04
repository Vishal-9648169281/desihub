from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_super_admin)


class IsContentStaff(BasePermission):
    """Super Admin or Content Manager — allowed to upload/manage videos."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_content_staff)


class IsContentStaffOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_content_staff)
