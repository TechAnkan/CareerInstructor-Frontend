import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create an Axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true, // This is crucial for sending/receiving the HTTP-only refresh token cookie
});

// Request interceptor to attach access token
api.interceptors.request.use(
  (config) => {
    // In Next.js (client side), we can store the short-lived access token in memory or localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If error is 401 (Unauthorized) and we haven't already retried this exact request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to get a new access token using the HTTP-only refresh token
        const res = await axios.post(
          `${API_BASE_URL}/api/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        const { accessToken } = res.data;
        // Save new token
        localStorage.setItem('accessToken', accessToken);
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails (e.g., refresh token expired), clear local storage and redirect to login
        localStorage.removeItem('accessToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
