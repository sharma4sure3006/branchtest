import axios from 'axios';

// Create axios instance with base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function to handle API errors
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.detail || error.response.data?.error || 'Server error',
      status: error.response.status,
      data: error.response.data
    };
  } else if (error.request) {
    // Network error
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
      data: null
    };
  } else {
    // Other error
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0,
      data: null
    };
  }
};

// Auth API
export const authAPI = {
  bootstrap: async (userData) => {
    try {
      const response = await apiClient.post('/api/auth/bootstrap', userData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  login: async (credentials) => {
    try {
      const response = await apiClient.post('/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getMe: async () => {
    try {
      const response = await apiClient.get('/api/auth/me');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Users API
export const usersAPI = {
  create: async (userData) => {
    try {
      const response = await apiClient.post('/api/users/', userData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  list: async () => {
    try {
      const response = await apiClient.get('/api/users/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  get: async (userId) => {
    try {
      const response = await apiClient.get(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Drifts API
export const driftsAPI = {
  create: async (driftData) => {
    try {
      const response = await apiClient.post('/api/drifts/', driftData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  list: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/drifts/', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  get: async (driftId) => {
    try {
      const response = await apiClient.get(`/api/drifts/${driftId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  update: async (driftId, driftData) => {
    try {
      const response = await apiClient.patch(`/api/drifts/${driftId}`, driftData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Comments API
export const commentsAPI = {
  add: async (driftId, commentData) => {
    try {
      const response = await apiClient.post(`/api/comments/${driftId}`, commentData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  list: async (driftId, params = {}) => {
    try {
      const response = await apiClient.get(`/api/comments/${driftId}`, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  delete: async (commentId) => {
    try {
      await apiClient.delete(`/api/comments/comment/${commentId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Notifications API
export const notificationsAPI = {
  list: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/notifications/', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  markRead: async (notificationId) => {
    try {
      const response = await apiClient.post(`/api/notifications/read/${notificationId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  markAllRead: async () => {
    try {
      const response = await apiClient.post('/api/notifications/read-all');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await apiClient.get('/api/notifications/unread-count');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Health check
export const healthAPI = {
  check: async () => {
    try {
      const response = await apiClient.get('/api/health');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

export default apiClient;