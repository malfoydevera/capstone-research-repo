import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// Research endpoints
export const researchAPI = {
  submitResearch: (formData) => api.post('/research/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyResearch: () => api.get('/research/my/papers'),
  getAllResearch: (status) => api.get('/research/all/papers', { params: { status } }),
  getResearchById: (id) => api.get(`/research/${id}`),
  approveResearch: (id, comments) => api.post(`/research/${id}/approve`, { comments }),
  rejectResearch: (id, reason) => api.post(`/research/${id}/reject`, { reason }),
  requestRevision: (id, notes) => api.post(`/research/${id}/revision`, { notes }),
  getPublishedResearch: (params) => api.get('/research/published', { params }),
  getCategories: () => api.get('/research/categories'),
};

export default api;