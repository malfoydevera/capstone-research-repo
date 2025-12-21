import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client for direct storage uploads
// Vite requires variables to be prefixed with VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize with a check to prevent crashing the whole app if variables are missing
let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.error("Supabase environment variables are missing! Check your frontend/.env file.");
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // --- NEW: FORCE NO CACHE HEADERS ---
    'Cache-Control': 'no-cache, no-store, must-revalidate', 
    'Pragma': 'no-cache',
    'Expires': '0'
  },
});

// Interceptor to attach JWT token AND timestamp to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // --- NEW: CACHE BUSTER ---
    // Add a random timestamp query param to every GET request
    // This tricks the browser into thinking every request is unique.
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

export const researchAPI = {
  /**
   * STEP 1: Upload the file directly to Supabase Storage.
   */
  uploadFile: async (file, userId) => {
    // Safety check: ensure supabase client exists before calling it
    if (!supabase) throw new Error("Supabase client is not initialized. Check your .env file.");

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { data, error } = await supabase.storage
      .from('research-papers')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('research-papers')
      .getPublicUrl(filePath);

    return { 
      publicUrl, 
      filePath, 
      fileName: file.name, 
      fileSize: file.size 
    };
  },

  /**
   * STEP 2: Save metadata via your Express backend.
   */
  submitResearch: (researchData) => api.post('/research/submit', researchData),

  // NEW: Update existing research (Resubmit)
  updateResearch: (id, data) => api.put(`/research/${id}/resubmit`, data),

  getMyResearch: () => api.get('/research/my/papers'),
  getAllResearch: (status) => api.get('/research/all/papers', { params: { status } }),
  getResearchById: (id) => api.get(`/research/${id}`),
  getCategories: () => api.get('/research/categories'),

  approveResearch: (id, comments) => api.post(`/research/${id}/approve`, { comments }),
  rejectResearch: (id, reason) => api.post(`/research/${id}/reject`, { reason }),
  requestRevision: (id, notes) => api.post(`/research/${id}/revision`, { notes }),
  
  getPublishedResearch: (params) => api.get('/research/published', { params }),
};

export default api;