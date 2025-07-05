import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI, userAPI, problemsAPI, submissionsAPI } from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const initAuth = () => {
      try {
        const savedToken = localStorage.getItem('authToken');
        const savedUser = localStorage.getItem('user');
        
        console.log('🔍 Checking saved auth:', { 
          hasToken: !!savedToken, 
          hasUser: !!savedUser 
        });
        
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          console.log('✅ Auth restored from localStorage');
        } else {
          console.log('❌ No saved auth found');
        }
      } catch (error) {
        console.error('❌ Error restoring auth:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔄 Attempting login for:', email);
      
      const response = await authAPI.login(email, password);
      console.log('📡 Login response:', response);

      if (response.success) {
        const { user: userData, token: authToken } = response.data;
        
        setToken(authToken);
        setUser(userData);
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('✅ Login successful:', userData.name);
        return { success: true, user: userData };
      } else {
        console.log('❌ Login failed:', response.message);
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Network error';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log('🔄 Attempting registration for:', email);
      
      const response = await authAPI.register(name, email, password);
      console.log('📡 Register response:', response);

      if (response.success) {
        const { user: userData, token: authToken } = response.data;
        
        setToken(authToken);
        setUser(userData);
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('✅ Registration successful:', userData.name);
        return { success: true, user: userData };
      } else {
        console.log('❌ Registration failed:', response.message);
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Network error';
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      console.log('🔄 Logging out...');
      
      // Try to call logout endpoint (optional, for server-side cleanup)
      try {
        await authAPI.logout();
      } catch (error) {
        console.warn('⚠️ Logout API call failed (continuing with local logout):', error);
      }
      
      // Clear local state and storage
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      console.log('✅ Logout successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return { success: true };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      console.log('🔄 Updating profile...');
      
      const response = await authAPI.updateProfile(profileData);
      console.log('📡 Update profile response:', response);

      if (response.success) {
        const updatedUser = { ...user, ...response.data.user };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        console.log('✅ Profile updated successfully');
        return { success: true, user: updatedUser };
      } else {
        console.log('❌ Profile update failed:', response.message);
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('❌ Update profile error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Network error';
      return { success: false, error: errorMessage };
    }
  };

  const fetchUserProgress = async () => {
    try {
      console.log('🔄 Fetching user progress...');
      
      const response = await userAPI.getProgress();
      console.log('📡 User progress response:', response);

      if (response.success) {
        console.log('✅ User progress fetched successfully');
        return { success: true, data: response.data };
      } else {
        console.log('❌ Fetch progress failed:', response.message);
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('❌ Fetch progress error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Network error';
      return { success: false, error: errorMessage };
    }
  };

  const submitSolution = async (problemId, code, language) => {
    try {
      console.log('🔄 Submitting solution...');
      
      const response = await submissionsAPI.submit(problemId, code, language);
      console.log('📡 Submit solution response:', response);

      if (response.success) {
        console.log('✅ Solution submitted successfully');
        return { success: true, data: response.data };
      } else {
        console.log('❌ Submit solution failed:', response.message);
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('❌ Submit solution error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Network error';
      return { success: false, error: errorMessage };
    }
  };

  const fetchProblems = async (difficulty = null, category = null) => {
    try {
      console.log('🔄 Fetching problems...', { difficulty, category });
      
      const filters = {};
      if (difficulty) filters.difficulty = difficulty;
      if (category) filters.category = category;
      
      const response = await problemsAPI.getAll(filters);
      console.log('📡 Fetch problems response:', response);

      if (response.success) {
        console.log('✅ Problems fetched successfully');
        return { success: true, data: response.data };
      } else {
        console.log('❌ Fetch problems failed:', response.message);
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('❌ Fetch problems error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Network error';
      return { success: false, error: errorMessage };
    }
  };

  const generateAIProblem = async (difficulty, topic, customPrompt) => {
    try {
      console.log('🔄 Generating AI problem...', { difficulty, topic });
      
      const response = await problemsAPI.generateAI(difficulty, topic, customPrompt);
      console.log('📡 Generate AI problem response:', response);

      if (response.success) {
        console.log('✅ AI problem generated successfully');
        return { success: true, data: response.data };
      } else {
        console.log('❌ Generate AI problem failed:', response.message);
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('❌ Generate AI problem error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Network error';
      return { success: false, error: errorMessage };
    }
  };

  const getRecommendations = async () => {
    try {
      console.log('🔄 Fetching recommendations...');
      
      const response = await userAPI.getRecommendations();
      console.log('📡 Recommendations response:', response);

      if (response.success) {
        console.log('✅ Recommendations fetched successfully');
        return { success: true, data: response.data };
      } else {
        console.log('❌ Fetch recommendations failed:', response.message);
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('❌ Fetch recommendations error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Network error';
      return { success: false, error: errorMessage };
    }
  };

  // Test connection function
  const testConnection = async () => {
    try {
      console.log('🔄 Testing API connection...');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/status`);
      const data = await response.json();
      console.log('📡 API connection test:', data);
      return data.success;
    } catch (error) {
      console.error('❌ API connection test failed:', error);
      return false;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    fetchUserProgress,
    submitSolution,
    fetchProblems,
    generateAIProblem,
    getRecommendations,
    testConnection,
    isAuthenticated: !!token && !!user,
  };

  // Log auth state changes for debugging
  useEffect(() => {
    console.log('🔄 Auth state changed:', {
      isAuthenticated: !!token && !!user,
      hasUser: !!user,
      hasToken: !!token,
      userName: user?.name,
      loading
    });
  }, [user, token, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default useAuth;