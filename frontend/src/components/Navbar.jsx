import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import API from '../api/axios';
import { clearAuthHeader } from '../api/axios';

function Navbar() {
    const location = useLocation();
    const [user, setUser] = useState(null);

    useEffect(() => {
        API.get('/auth/me/')
            .then((res) => setUser(res.data))
            .catch(() => { });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('auth');
        clearAuthHeader();
        window.location.href = '/login';
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                <span className="icon">📋</span>
                TaskFlow
            </Link>

            <div className="navbar-links">
                <Link to="/" className={isActive('/')}>Dashboard</Link>
                <Link to="/tasks" className={isActive('/tasks')}>Tasks</Link>
                {user && (user.role === 'admin') && (
                    <Link to="/users" className={isActive('/users')}>Users</Link>
                )}
            </div>

            <div className="navbar-user">
                {user && (
                    <div className="user-info">
                        <div className="user-name">{user.first_name || user.username}</div>
                        <div className="user-role">{user.role}</div>
                    </div>
                )}
                <button className="btn-logout" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
