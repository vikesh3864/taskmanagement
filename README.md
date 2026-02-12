# Task Management System

A full-stack Task Management System built with **Django REST Framework** (backend) and **React.js** (frontend).

## Features

- ✅ RESTful API with Django REST Framework
- ✅ Create and list users
- ✅ Create, update, and delete tasks
- ✅ Task assignment to different users
- ✅ Role-based access control (Admin, Manager, Member)
- ✅ Pagination for task listing (10 per page)
- ✅ Basic Authentication for securing the API
- ✅ Modern dark-themed UI with glassmorphism design

## Roles & Permissions

| Role | Users | Tasks |
|------|-------|-------|
| **Admin** | Full CRUD | Full CRUD on all tasks |
| **Manager** | View all | CRUD on own tasks, assign to members |
| **Member** | View own | View assigned tasks, update status |

## Tech Stack

- **Backend:** Python, Django 5.x, Django REST Framework
- **Frontend:** React 18, Vite, Axios, React Router
- **Database:** SQLite
- **Auth:** HTTP Basic Authentication

## Project Structure

```
taskmanagement/
├── backend/                  # Django REST Framework API
│   ├── api/
│   │   ├── models.py         # User & Task models
│   │   ├── serializers.py    # DRF serializers
│   │   ├── views.py          # ViewSets & API views
│   │   ├── permissions.py    # RBAC permission classes
│   │   ├── urls.py           # API routes
│   │   ├── admin.py          # Django admin config
│   │   └── tests.py          # Unit tests
│   ├── taskmanager/
│   │   ├── settings.py       # Django settings
│   │   └── urls.py           # Root URL config
│   ├── manage.py
│   └── requirements.txt
├── frontend/                 # React.js SPA
│   ├── src/
│   │   ├── api/axios.js      # Axios with auth
│   │   ├── components/       # Navbar, TaskCard
│   │   ├── pages/            # Login, Dashboard, Tasks, Users
│   │   ├── App.jsx           # Root component with routing
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Design system
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Setup & Run

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (admin role)
python manage.py createsuperuser

# Run server
python manage.py runserver 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

### Access

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000/api/
- **Django Admin:** http://localhost:8000/admin/

### Default Credentials

- **Username:** admin
- **Password:** admin123

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/` | List all users |
| POST | `/api/users/` | Create a user (Admin only) |
| GET | `/api/users/{id}/` | Get user details |
| DELETE | `/api/users/{id}/` | Delete user (Admin only) |
| GET | `/api/tasks/` | List tasks (paginated) |
| POST | `/api/tasks/` | Create a task |
| GET | `/api/tasks/{id}/` | Get task details |
| PUT | `/api/tasks/{id}/` | Update a task |
| DELETE | `/api/tasks/{id}/` | Delete a task |
| GET | `/api/auth/me/` | Get current user |
| POST | `/api/auth/register/` | Register new user |











