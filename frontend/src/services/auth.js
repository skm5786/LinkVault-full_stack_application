import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function registerUser(username, email, password) {
  const response = await api.post('/auth/register', {
    username,
    email,
    password
  });
  return response.data.data;
}

export async function loginUser(username, password) {
  const response = await api.post('/auth/login', {
    username,
    password
  });
  return response.data.data;
}

export async function getCurrentUser() {
  const response = await api.get('/auth/me');
  return response.data.data;
}

export async function logoutUser() {
  await api.post('/auth/logout');
  localStorage.removeItem('token');
}