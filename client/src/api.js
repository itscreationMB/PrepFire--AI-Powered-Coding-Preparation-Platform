import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

console.log('🔧 API Configuration:', {
  baseURL: API_BASE_URL,
  env: process.env.NODE_ENV,
  reactAppApiUrl: process.env.REACT_APP_API_URL
});

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('📤 API Request:', {
      method: config.method.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      hasToken: !!token
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', {
      status: response.status,
      url: response.config.url,
      success: response.data.success
    });
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message
    });
    
    if (error.response?.status === 401) {
      console.log('🔐 Unauthorized - clearing auth and redirecting to login');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

export const problemsAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    console.log('🔍 Getting problems with filters:', filters);
    const response = await api.get(`/problems?${params}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/problems/${id}`);
    return response.data;
  },

  getByCategory: async (category) => {
    const response = await api.get(`/problems/category/${category}`);
    return response.data;
  },

  getByDifficulty: async (difficulty) => {
    const response = await api.get(`/problems/difficulty/${difficulty}`);
    return response.data;
  },

  search: async (query) => {
    const response = await api.get(`/problems/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getRandom: async (difficulty, category) => {
    const params = new URLSearchParams();
    if (difficulty && difficulty !== 'All Levels') params.append('difficulty', difficulty);
    if (category && category !== 'All Categories') params.append('category', category);
    console.log('🎲 Getting random problem with params:', { difficulty, category });
    const response = await api.get(`/problems/random?${params}`);
    return response.data;
  },

  generateAI: async (difficulty, topic, customPrompt = '') => {
    console.log('🤖 Generating AI problem:', { difficulty, topic, customPrompt });
    const response = await api.post('/problems/generate', {
      difficulty,
      topic,
      customPrompt,
    });
    return response.data;
  },

  getHints: async (problemId) => {
    const response = await api.get(`/problems/${problemId}/hints`);
    return response.data;
  },

  getSolution: async (problemId) => {
    const response = await api.get(`/problems/${problemId}/solution`);
    return response.data;
  },

  getEditorial: async (problemId) => {
    const response = await api.get(`/problems/${problemId}/editorial`);
    return response.data;
  },
};

export const submissionsAPI = {
  submit: async (problemId, code, language) => {
    const response = await api.post('/submissions', {
      problemId,
      code,
      language,
    });
    return response.data;
  },

  getByProblem: async (problemId) => {
    const response = await api.get(`/submissions/problem/${problemId}`);
    return response.data;
  },

  getByUser: async (userId, limit = 50) => {
    const response = await api.get(`/submissions/user/${userId}?limit=${limit}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/submissions/${id}`);
    return response.data;
  },

  getRecent: async (limit = 20) => {
    const response = await api.get(`/submissions/recent?limit=${limit}`);
    return response.data;
  },

  runCode: async (code, language, testCases) => {
    const response = await api.post('/submissions/run', {
      code,
      language,
      testCases,
    });
    return response.data;
  },

  getExecutionResult: async (executionId) => {
    const response = await api.get(`/submissions/execution/${executionId}`);
    return response.data;
  },
};

export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  getProgress: async () => {
    const response = await api.get('/user/progress');
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get('/user/statistics');
    return response.data;
  },

  getLeaderboard: async (timeframe = 'all') => {
    const response = await api.get(`/user/leaderboard?timeframe=${timeframe}`);
    return response.data;
  },

  getRecommendations: async () => {
    const response = await api.get('/user/recommendations');
    return response.data;
  },

  updatePreferences: async (preferences) => {
    const response = await api.put('/user/preferences', preferences);
    return response.data;
  },

  getAchievements: async () => {
    const response = await api.get('/user/achievements');
    return response.data;
  },

  getStreak: async () => {
    const response = await api.get('/user/streak');
    return response.data;
  },

  getActivity: async (limit = 50) => {
    const response = await api.get(`/user/activity/${limit}`);
    return response.data;
  },

  getFavorites: async () => {
    const response = await api.get('/user/favorites');
    return response.data;
  },

  addFavorite: async (problemId) => {
    const response = await api.post('/user/favorites', { problemId });
    return response.data;
  },

  removeFavorite: async (problemId) => {
    const response = await api.delete(`/user/favorites/${problemId}`);
    return response.data;
  },
};

export const analyticsAPI = {
  getOverview: async () => {
    const response = await api.get('/analytics/overview');
    return response.data;
  },

  getPerformanceChart: async (timeframe = '30d') => {
    const response = await api.get(`/analytics/performance?timeframe=${timeframe}`);
    return response.data;
  },

  getDifficultyBreakdown: async () => {
    const response = await api.get('/analytics/difficulty-breakdown');
    return response.data;
  },

  getCategoryProgress: async () => {
    const response = await api.get('/analytics/category-progress');
    return response.data;
  },

  getTimeSpent: async (timeframe = '30d') => {
    const response = await api.get(`/analytics/time-spent?timeframe=${timeframe}`);
    return response.data;
  },

  getAccuracyTrend: async (timeframe = '30d') => {
    const response = await api.get(`/analytics/accuracy?timeframe=${timeframe}`);
    return response.data;
  },

  getWeakAreas: async () => {
    const response = await api.get('/analytics/weak-areas');
    return response.data;
  },

  getImprovementSuggestions: async () => {
    const response = await api.get('/analytics/suggestions');
    return response.data;
  },
};

export const contestsAPI = {
  getAll: async () => {
    const response = await api.get('/contests');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/contests/${id}`);
    return response.data;
  },

  join: async (contestId) => {
    const response = await api.post(`/contests/${contestId}/join`);
    return response.data;
  },

  leave: async (contestId) => {
    const response = await api.post(`/contests/${contestId}/leave`);
    return response.data;
  },

  getLeaderboard: async (contestId) => {
    const response = await api.get(`/contests/${contestId}/leaderboard`);
    return response.data;
  },

  getProblems: async (contestId) => {
    const response = await api.get(`/contests/${contestId}/problems`);
    return response.data;
  },

  submitSolution: async (contestId, problemId, code, language) => {
    const response = await api.post(`/contests/${contestId}/submit`, {
      problemId,
      code,
      language,
    });
    return response.data;
  },
};

export const discussionAPI = {
  getAll: async (problemId) => {
    const response = await api.get(`/discussions?problemId=${problemId}`);
    return response.data;
  },

  create: async (problemId, title, content) => {
    const response = await api.post('/discussions', {
      problemId,
      title,
      content,
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/discussions/${id}`);
    return response.data;
  },

  reply: async (discussionId, content) => {
    const response = await api.post(`/discussions/${discussionId}/reply`, {
      content,
    });
    return response.data;
  },

  vote: async (discussionId, voteType) => {
    const response = await api.post(`/discussions/${discussionId}/vote`, {
      voteType,
    });
    return response.data;
  },

  markSolution: async (discussionId) => {
    const response = await api.post(`/discussions/${discussionId}/mark-solution`);
    return response.data;
  },
};

export const adminAPI = {
  getUsers: async (page = 1, limit = 50) => {
    const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  banUser: async (userId, reason) => {
    const response = await api.post(`/admin/users/${userId}/ban`, { reason });
    return response.data;
  },

  unbanUser: async (userId) => {
    const response = await api.post(`/admin/users/${userId}/unban`);
    return response.data;
  },

  createProblem: async (problemData) => {
    const response = await api.post('/admin/problems', problemData);
    return response.data;
  },

  updateProblem: async (problemId, problemData) => {
    const response = await api.put(`/admin/problems/${problemId}`, problemData);
    return response.data;
  },

  deleteProblem: async (problemId) => {
    const response = await api.delete(`/admin/problems/${problemId}`);
    return response.data;
  },

  getSystemStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
};

export default api;