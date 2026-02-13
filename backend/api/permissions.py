from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
   

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )


class IsAdminOrManager(permissions.BasePermission):
   

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ('admin', 'manager')
        )


class TaskPermission(permissions.BasePermission):


    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

       
        if view.action in ('list', 'retrieve'):
            return True

        if view.action == 'create':
            return request.user.role in ('admin', 'manager')

        if view.action in ('update', 'partial_update', 'destroy'):
            return True

        return False

    def has_object_permission(self, request, view, obj):
        user = request.user

       
        if user.role == 'admin':
            return True

      
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
