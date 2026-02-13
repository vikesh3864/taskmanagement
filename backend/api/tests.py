# from django.test import TestCase
# from django.urls import reverse
# from rest_framework.test import APIClient
# from rest_framework import status
# from .models import User, Task


# class UserModelTest(TestCase):
#     def test_create_user_with_role(self):
#         user = User.objects.create_user(
#             username='testuser', password='testpass123', role='member'
#         )
#         self.assertEqual(user.role, 'member')
#         self.assertEqual(str(user), 'testuser (Member)')


# class TaskModelTest(TestCase):
#     def setUp(self):
#         self.user = User.objects.create_user(
#             username='testuser', password='testpass123', role='manager'
#         )

#     def test_create_task(self):
#         task = Task.objects.create(
#             title='Test Task',
#             description='Test description',
#             created_by=self.user,
#         )
#         self.assertEqual(str(task), 'Test Task')
#         self.assertEqual(task.status, 'todo')
#         self.assertEqual(task.priority, 'medium')


# class UserAPITest(TestCase):
#     def setUp(self):
#         self.client = APIClient()
#         self.admin = User.objects.create_user(
#             username='admin', password='admin123', role='admin'
#         )
#         self.manager = User.objects.create_user(
#             username='manager', password='manager123', role='manager'
#         )
#         self.member = User.objects.create_user(
#             username='member', password='member123', role='member'
#         )

#     def test_admin_can_list_users(self):
#         self.client.force_authenticate(user=self.admin)
#         response = self.client.get('/api/users/')
#         self.assertEqual(response.status_code, status.HTTP_200_OK)

#     def test_admin_can_create_user(self):
#         self.client.force_authenticate(user=self.admin)
#         data = {
#             'username': 'newuser',
#             'password': 'newpass123',
#             'email': 'new@test.com',
#             'role': 'member',
#         }
#         response = self.client.post('/api/users/', data)
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)

#     def test_member_cannot_create_user(self):
#         self.client.force_authenticate(user=self.member)
#         data = {
#             'username': 'newuser',
#             'password': 'newpass123',
#             'role': 'member',
#         }
#         response = self.client.post('/api/users/', data)
#         self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

#     def test_current_user_endpoint(self):
#         self.client.force_authenticate(user=self.admin)
#         response = self.client.get('/api/auth/me/')
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertEqual(response.data['username'], 'admin')


# class TaskAPITest(TestCase):
#     def setUp(self):
#         self.client = APIClient()
#         self.admin = User.objects.create_user(
#             username='admin', password='admin123', role='admin'
#         )
#         self.manager = User.objects.create_user(
#             username='manager', password='manager123', role='manager'
#         )
#         self.member = User.objects.create_user(
#             username='member', password='member123', role='member'
#         )
#         self.task = Task.objects.create(
#             title='Test Task',
#             description='A test task',
#             created_by=self.manager,
#             assigned_to=self.member,
#         )

#     def test_admin_can_list_all_tasks(self):
#         self.client.force_authenticate(user=self.admin)
#         response = self.client.get('/api/tasks/')
#         self.assertEqual(response.status_code, status.HTTP_200_OK)

#     def test_manager_can_create_task(self):
#         self.client.force_authenticate(user=self.manager)
#         data = {
#             'title': 'New Task',
#             'description': 'A new task',
#             'assigned_to': self.member.id,
#         }
#         response = self.client.post('/api/tasks/', data)
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)

#     def test_member_cannot_create_task(self):
#         self.client.force_authenticate(user=self.member)
#         data = {'title': 'Member Task', 'description': 'Should fail'}
#         response = self.client.post('/api/tasks/', data)
#         self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

#     def test_member_can_update_assigned_task(self):
#         self.client.force_authenticate(user=self.member)
#         response = self.client.patch(
#             f'/api/tasks/{self.task.id}/',
#             {'status': 'in_progress'},
#         )
#         self.assertEqual(response.status_code, status.HTTP_200_OK)

#     def test_member_cannot_delete_task(self):
#         self.client.force_authenticate(user=self.member)
#         response = self.client.delete(f'/api/tasks/{self.task.id}/')
#         self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

#     def test_pagination(self):
#         self.client.force_authenticate(user=self.admin)
#         # Create 15 tasks to test pagination
#         for i in range(15):
#             Task.objects.create(
#                 title=f'Task {i}',
#                 created_by=self.admin,
#             )
#         response = self.client.get('/api/tasks/')
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertIn('results', response.data)
#         self.assertIn('count', response.data)
#         self.assertEqual(len(response.data['results']), 10)  # page size
