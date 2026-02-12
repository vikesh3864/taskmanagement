from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """Only admin users can perform this action."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )


class IsAdminOrManager(permissions.BasePermission):
    """Admin and Manager users can perform this action."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ('admin', 'manager')
        )


class TaskPermission(permissions.BasePermission):
    """
    Role-based task permissions:
    - Admin: Full access to all tasks
    - Manager: Can create tasks, edit/delete own tasks, assign tasks to members
    - Member: Can view assigned tasks, update status of own assigned tasks
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Everyone can list and retrieve tasks (filtered in the viewset)
        if view.action in ('list', 'retrieve'):
            return True

        # Only admin and manager can create tasks
        if view.action == 'create':
            return request.user.role in ('admin', 'manager')

        # Update and delete are checked at object level
        if view.action in ('update', 'partial_update', 'destroy'):
            return True

        return False

    def has_object_permission(self, request, view, obj):
        user = request.user

        # Admin has full access
        if user.role == 'admin':
            return True

        # Manager can edit/delete their own tasks
        if user.role == 'manager':
            if view.action in ('update', 'partial_update', 'destroy'):
                return obj.created_by == user
            return True

        # Member can only update status of tasks assigned to them
        if user.role == 'member':
            if view.action in ('update', 'partial_update'):
                return obj.assigned_to == user
            if view.action == 'destroy':
                return False
            return obj.assigned_to == user

        return False


class UserPermission(permissions.BasePermission):
    """
    Role-based user permissions:
    - Admin: Full access (create, list, update, delete users)
    - Manager: Can list users
    - Member: Can view own profile
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if view.action == 'create':
            return request.user.role == 'admin'

        if view.action in ('list', 'retrieve'):
            return True

        if view.action in ('update', 'partial_update', 'destroy'):
            return request.user.role == 'admin'

        return False

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True

        # Users can view their own profile
        if view.action == 'retrieve':
            return request.user.role in ('admin', 'manager') or obj == request.user

        return False
