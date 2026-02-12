import React, { useState, useEffect } from 'react';
import API from '../api/axios';

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        role: 'member',
    });

    useEffect(() => {
        API.get('/auth/me/').then((res) => setCurrentUser(res.data));
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await API.get('/users/');
            const userData = res.data.results || res.data;
            setUsers(Array.isArray(userData) ? userData : []);
        } catch (err) {
            setError('Failed to load users');
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await API.post('/users/', formData);
            setSuccess('User created successfully!');
            setShowModal(false);
            setFormData({
                username: '',
                email: '',
                first_name: '',
                last_name: '',
                password: '',
                role: 'member',
            });
            fetchUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            const errData = err.response?.data;
            if (errData) {
                const messages = Object.values(errData).flat().join(', ');
                setError(messages || 'Failed to create user');
            } else {
                setError('Failed to create user');
            }
        }
    };

    const handleDelete = async (userId) => {
        if (userId === currentUser?.id) {
            setError('You cannot delete your own account');
            return;
        }
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await API.delete(`/users/${userId}/`);
            setSuccess('User deleted successfully!');
            fetchUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to delete user');
        }
    };

    const isAdmin = currentUser?.role === 'admin';

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Users</h1>
                    <p className="page-subtitle">Manage team members and their roles</p>
                </div>
                {isAdmin && (
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        ➕ Add User
                    </button>
                )}
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {loading ? (
                <div className="loading">
                    <div className="spinner"></div>
                    Loading users...
                </div>
            ) : users.length === 0 ? (
                <div className="empty-state">
                    <div className="icon">👥</div>
                    <h3>No users found</h3>
                    <p>Add your first team member!</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Full Name</th>
                                <th>Role</th>
                                {isAdmin && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td style={{ color: 'var(--text-muted)' }}>#{user.id}</td>
                                    <td style={{ fontWeight: 500 }}>{user.username}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>
                                        {user.email || '—'}
                                    </td>
                                    <td>
                                        {user.first_name || user.last_name
                                            ? `${user.first_name} ${user.last_name}`.trim()
                                            : '—'}
                                    </td>
                                    <td>
                                        <span className={`badge badge-${user.role}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(user.id)}
                                                disabled={user.id === currentUser?.id}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create User Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Add New User</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">First Name</label>
                                    <input
                                        id="user-first-name"
                                        type="text"
                                        className="form-control"
                                        placeholder="John"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Last Name</label>
                                    <input
                                        id="user-last-name"
                                        type="text"
                                        className="form-control"
                                        placeholder="Doe"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Username *</label>
                                <input
                                    id="user-username"
                                    type="text"
                                    className="form-control"
                                    placeholder="johndoe"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    id="user-email"
                                    type="email"
                                    className="form-control"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Password *</label>
                                    <input
                                        id="user-password"
                                        type="password"
                                        className="form-control"
                                        placeholder="Min 6 characters"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Role</label>
                                    <select
                                        id="user-role"
                                        className="form-control"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="manager">Manager</option>
                                        <option value="member">Member</option>
                                    </select>
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
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UsersPage;
