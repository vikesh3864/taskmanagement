from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView

from .models import User, Task
from .serializers import UserSerializer, UserListSerializer, TaskSerializer
from .permissions import TaskPermission, UserPermission


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for User management.
    - Admin: Full CRUD access
    - Manager: Can list all users
    - Member: Can view own profile
    """

    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, UserPermission]

    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        return UserSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role in ('admin', 'manager'):
            return User.objects.all()
        return User.objects.filter(id=user.id)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Return the current authenticated user's profile."""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Task management.
    - Admin: Full access to all tasks
    - Manager: CRUD on own tasks, can assign to members
    - Member: View and update status of assigned tasks
    """

    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, TaskPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'due_date', 'priority', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        queryset = Task.objects.select_related('assigned_to', 'created_by')

        # Admin sees all tasks
        if user.role == 'admin':
            qs = queryset.all()
        # Manager sees tasks they created
        elif user.role == 'manager':
            qs = queryset.filter(created_by=user)
        # Member sees only tasks assigned to them
        else:
            qs = queryset.filter(assigned_to=user)

        # Optional query param filters
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        priority_filter = self.request.query_params.get('priority')
        if priority_filter:
            qs = qs.filter(priority=priority_filter)

        assigned_to_filter = self.request.query_params.get('assigned_to')
        if assigned_to_filter:
            qs = qs.filter(assigned_to_id=assigned_to_filter)

        return qs


class CurrentUserView(APIView):
    """Get the currently authenticated user."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class RegisterView(APIView):
    """Public registration endpoint (creates member users)."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
