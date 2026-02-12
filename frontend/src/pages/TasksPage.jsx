import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import TaskCard from '../components/TaskCard';

function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Pagination
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assigned_to: '',
        due_date: '',
    });

    const pageSize = 10;
    const totalPages = Math.ceil(totalCount / pageSize);

    useEffect(() => {
        API.get('/auth/me/').then((res) => setCurrentUser(res.data));
        API.get('/users/').then((res) => {
            const userData = res.data.results || res.data;
            setUsers(Array.isArray(userData) ? userData : []);
        });
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [page, statusFilter, priorityFilter]);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            let url = `/tasks/?page=${page}`;
            if (statusFilter) url += `&status=${statusFilter}`;
            if (priorityFilter) url += `&priority=${priorityFilter}`;

            const res = await API.get(url);
            setTasks(res.data.results || []);
            setTotalCount(res.data.count || 0);
            setNextPage(res.data.next);
            setPrevPage(res.data.previous);
        } catch (err) {
            setError('Failed to load tasks');
        }
        setLoading(false);
    };

    const openCreateModal = () => {
        setEditingTask(null);
        setFormData({
            title: '',
            description: '',
            status: 'todo',
            priority: 'medium',
            assigned_to: '',
            due_date: '',
        });
        setShowModal(true);
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            description: task.description || '',
            status: task.status,
            priority: task.priority,
            assigned_to: task.assigned_to || '',
            due_date: task.due_date || '',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const data = { ...formData };
        if (!data.assigned_to) data.assigned_to = null;
        if (!data.due_date) data.due_date = null;

        try {
            if (editingTask) {
                await API.put(`/tasks/${editingTask.id}/`, data);
                setSuccess('Task updated successfully!');
            } else {
                await API.post('/tasks/', data);
                setSuccess('Task created successfully!');
            }
            setShowModal(false);
            fetchTasks();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            const errData = err.response?.data;
            if (errData) {
                const messages = Object.values(errData).flat().join(', ');
                setError(messages || 'Failed to save task');
            } else {
                setError('Failed to save task');
            }
        }
    };

    const handleDelete = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await API.delete(`/tasks/${taskId}/`);
            setSuccess('Task deleted successfully!');
            fetchTasks();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to delete task');
        }
    };

    const canCreate = currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager');

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Tasks</h1>
                    <p className="page-subtitle">
                        {totalCount} task{totalCount !== 1 ? 's' : ''} total
                    </p>
                </div>
                {canCreate && (
                    <button className="btn btn-primary" onClick={openCreateModal}>
                        ➕ Create Task
                    </button>
                )}
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Filters */}
            <div className="filters-bar">
                <select
                    className="form-control"
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                >
                    <option value="">All Statuses</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                </select>

                <select
                    className="form-control"
                    value={priorityFilter}
                    onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
                >
                    <option value="">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
            </div>

            {/* Task List */}
            {loading ? (
                <div className="loading">
                    <div className="spinner"></div>
                    Loading tasks...
                </div>
            ) : tasks.length === 0 ? (
                <div className="empty-state">
                    <div className="icon">📭</div>
                    <h3>No tasks found</h3>
                    <p>
                        {canCreate
                            ? 'Create your first task to get started!'
                            : 'No tasks have been assigned to you yet.'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="card-grid">
                        {tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onEdit={openEditModal}
                                onDelete={handleDelete}
                                currentUser={currentUser}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => setPage((p) => p - 1)}
                                disabled={!prevPage}
                            >
                                ← Previous
                            </button>
                            <span className="page-info">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => p + 1)}
                                disabled={!nextPage}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingTask ? 'Edit Task' : 'Create New Task'}
                            </h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Title *</label>
                                <input
                                    id="task-title"
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter task title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    id="task-description"
                                    className="form-control"
                                    placeholder="Enter task description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select
                                        id="task-status"
                                        className="form-control"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="todo">To Do</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="done">Done</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Priority</label>
                                    <select
                                        id="task-priority"
                                        className="form-control"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Assign To</label>
                                    <select
                                        id="task-assigned-to"
                                        className="form-control"
                                        value={formData.assigned_to}
                                        onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                                    >
                                        <option value="">Unassigned</option>
                                        {users.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.username} ({u.role})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Due Date</label>
                                    <input
                                        id="task-due-date"
                                        type="date"
                                        className="form-control"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingTask ? 'Update Task' : 'Create Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TasksPage;
