import axios from 'axios';

const API = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Set Basic Auth header from stored credentials
export function setAuthHeader(username, password) {
    const encoded = btoa(`${username}:${password}`);
    API.defaults.headers.common['Authorization'] = `Basic ${encoded}`;
}

// Remove auth header
export function clearAuthHeader() {
    delete API.defaults.headers.common['Authorization'];
}

// Restore auth on page load
const savedAuth = localStorage.getItem('auth');
if (savedAuth) {
    const { username, password } = JSON.parse(savedAuth);
    setAuthHeader(username, password);
}

export default API;
