import axios from 'axios';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? 'https://shazu-cmt-back.onrender.com/api' : '/api'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cmt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle global response errors and non-JSON responses
api.interceptors.response.use(
  (response) => {
    // If an API call accidentally returned HTML (e.g., SPA index.html fallback due to proxy/URL misconfiguration)
    if (
      typeof response.data === 'string' &&
      (response.data.trim().startsWith('<!doctype') ||
        response.data.trim().startsWith('<!DOCTYPE') ||
        response.data.trim().startsWith('<html'))
    ) {
      console.error('[API Interceptor] Received HTML instead of expected JSON response:', response.config.url);
      const err = new Error('API server returned HTML instead of JSON. Please ensure backend server is running and reachable.');
      err.response = {
        ...response,
        status: 502,
        data: { error: 'API server unreachable or returned HTML response. Check backend connection.' },
      };
      return Promise.reject(err);
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        localStorage.removeItem('cmt_token');
        localStorage.removeItem('cmt_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
