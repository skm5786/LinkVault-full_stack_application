import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Upload text content with all options
export const uploadText = async (textContent, options = {}) => {
  const formData = new FormData();
  formData.append('content_type', 'text');
  formData.append('text_content', textContent);
  
  if (options.expiry_minutes) {
    formData.append('expiry_minutes', options.expiry_minutes);
  }
  if (options.password) {
    formData.append('password', options.password);
  }
  if (options.is_one_time) {
    formData.append('is_one_time', 'true');
  }
  if (options.max_views) {
    formData.append('max_views', options.max_views);
  }

  const response = await api.post('/upload', formData);
  return response.data;
};

// Upload file with all options
export const uploadFile = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('content_type', 'file');
  formData.append('file', file);
  
  if (options.expiry_minutes) {
    formData.append('expiry_minutes', options.expiry_minutes);
  }
  if (options.password) {
    formData.append('password', options.password);
  }
  if (options.is_one_time) {
    formData.append('is_one_time', 'true');
  }
  if (options.max_views) {
    formData.append('max_views', options.max_views);
  }

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Get content by link ID (with password support)
export const getContent = async (linkId, password = null) => {
  const response = await api.post(`/content/${linkId}`, {
    password: password || undefined
  });
  return response.data;
};

// Get download URL with password
export const getDownloadUrl = (linkId, password = null) => {
  const url = `${API_BASE_URL}/download/${linkId}`;
  return password ? `${url}?password=${encodeURIComponent(password)}` : url;
};

// Get user's content (requires auth)
export const getUserContent = async () => {
  const response = await api.get('/user/content');
  return response.data.data;
};

// Get user statistics (requires auth)
export const getUserStats = async () => {
  const response = await api.get('/user/stats');
  return response.data.data;
};

// Delete content (requires auth)
export const deleteContent = async (linkId) => {
  const response = await api.delete(`/content/${linkId}`);
  return response.data;
};

export default api;