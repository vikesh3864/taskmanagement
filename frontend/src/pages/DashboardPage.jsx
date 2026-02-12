import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

function DashboardPage() {
    const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, done: 0 });
    const [recentTasks, setRecentTasks] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            API.get('/auth/me/'),
            API.get('/tasks/?page=1'),
        ])
            .then(([userRes, tasksRes]) => {
                setUser(userRes.data);
                const tasks = tasksRes.data.results || [];
                setRecentTasks(tasks.slice(0, 5));

                // Calculate stats from all available tasks
                const total = tasksRes.data.count || tasks.length;
                const todo = tasks.filter((t) => t.status === 'todo').length;
                const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
                const done = tasks.filter((t) => t.status === 'done').length;
                setStats({ total, todo, inProgress, done });
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                Loading dashboard...
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        Welcome back, {user?.first_name || user?.username} 👋
                    </h1>
                    <p className="page-subtitle">
                        Here&#39;s an overview of your tasks and activity
                    </p>
                </div>
                <Link to="/tasks" className="btn btn-primary">
                    ➕ New Task
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon purple">📊</div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total Tasks</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon blue">📝</div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.todo}</div>
                        <div className="stat-label">To Do</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orange">⚡</div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.inProgress}</div>
                        <div className="stat-label">In Progress</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green">✅</div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.done}</div>
                        <div className="stat-label">Completed</div>
                    </div>
                </div>
            </div>

            {/* Recent Tasks */}
            <div style={{ marginTop: '1rem' }}>
                <div className="page-header" style={{ marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Recent Tasks</h2>
                    <Link to="/tasks" className="btn btn-secondary btn-sm">
                        View All →
                    </Link>
                </div>

                {recentTasks.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">📭</div>
                        <h3>No tasks yet</h3>
                        <p>Create your first task to get started!</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Status</th>
                                    <th>Priority</th>
                                    <th>Assigned To</th>
                                    <th>Due Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTasks.map((task) => (
                                    <tr key={task.id}>
                                        <td style={{ fontWeight: 500 }}>{task.title}</td>
                                        <td>
                                            <span className={`badge badge-${task.status}`}>
                                                {task.status === 'in_progress'
                                                    ? 'In Progress'
                                                    : task.status === 'todo'
                                                        ? 'To Do'
                                                        : 'Done'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${task.priority}`}>
                                                {task.priority}
                                            </span>
                                        </td>
                                        <td>
                                            {task.assigned_to_detail
                                                ? task.assigned_to_detail.username
                                                : '—'}
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)' }}>
                                            {task.due_date || '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DashboardPage;
