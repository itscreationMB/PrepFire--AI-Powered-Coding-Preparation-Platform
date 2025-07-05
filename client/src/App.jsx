import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Header from './components/Header';
import Footer from './components/Footer';
import Auth from './components/Auth';
import CodeEditor from './components/CodeEditor';
import Dashboard from './components/Dashboard';
import Profile from './hooks/Profile';
import Home from './pages/Home';
import Practice from './pages/Practice';
import Contest from './pages/Contest';
import Leaderboard from './pages/Leaderboard';
import Learn from './pages/Learn';
import Submissions from './pages/Submissions';
import Analytics from './pages/Analytics';
import SolveProblem from './pages/SolveProblem';
import { initAllAnimations } from './animations';

gsap.registerPlugin(ScrollTrigger);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white text-lg font-medium">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth" />;
};

const AuthOnlyRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <Header />
      <main className="pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
};

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white text-lg font-medium">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">You need admin privileges to access this page</p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all duration-200"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
};

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 flex items-center justify-center">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
        <div className="text-6xl mb-4">404</div>
        <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-gray-400 mb-6">The page you're looking for doesn't exist</p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all duration-200"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/admin/stats`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setStats(data.data);
        }
      } catch (error) {
        console.error('Admin stats error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white text-lg font-medium">Loading Admin Dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-300">
            Manage users, problems, and system analytics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">{stats?.overview?.users || 0}</div>
            <div className="text-gray-400">Total Users</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{stats?.overview?.problems || 0}</div>
            <div className="text-gray-400">Total Problems</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">{stats?.overview?.submissions || 0}</div>
            <div className="text-gray-400">Total Submissions</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">{stats?.overview?.activeUsers || 0}</div>
            <div className="text-gray-400">Active Users</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <button
                onClick={() => alert('User management coming soon!')}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
              >
                Manage Users
              </button>
              <button
                onClick={() => alert('Problem management coming soon!')}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
              >
                Manage Problems
              </button>
              <button
                onClick={() => alert('Contest management coming soon!')}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              >
                Manage Contests
              </button>
              <button
                onClick={() => alert('System settings coming soon!')}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200"
              >
                System Settings
              </button>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">System Status</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                <span className="text-white">Database</span>
                <span className="text-green-400">●  Online</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                <span className="text-white">API Server</span>
                <span className="text-green-400">●  Running</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                <span className="text-white">Code Execution</span>
                <span className="text-green-400">●  Available</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <span className="text-white">AI Services</span>
                <span className="text-yellow-400">●  Limited</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, testConnection } = useAuth();

  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('🔄 Testing API connection...');
        const connectionTest = await testConnection();
        console.log('📡 API connection test result:', connectionTest);
        
        if (!connectionTest) {
          console.warn('⚠️ API connection failed - check if backend is running on port 5001');
        }
        
        const timer = setTimeout(() => {
          setIsLoading(false);
          initAllAnimations();
        }, 1000);

        return () => clearTimeout(timer);
      } catch (error) {
        console.error('❌ App initialization error:', error);
        setIsLoading(false);
      }
    };

    initApp();
  }, [testConnection]);

  useEffect(() => {
    ScrollTrigger.refresh();
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-8 border-cyan-400/20 rounded-full"></div>
            <div className="absolute inset-0 w-32 h-32 border-8 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-4 w-24 h-24 border-4 border-purple-400/30 rounded-full"></div>
            <div className="absolute inset-4 w-24 h-24 border-4 border-purple-400 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            PrepFire
          </h1>
          
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <PublicLayout>
                <Home />
              </PublicLayout>
            }
          />
          
          <Route
            path="/auth"
            element={
              <AuthOnlyRoute>
                <PublicLayout>
                  <Auth />
                </PublicLayout>
              </AuthOnlyRoute>
            }
          />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/practice"
            element={
              <ProtectedRoute>
                <Layout>
                  <Practice />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/solve/:id"
            element={
              <ProtectedRoute>
                <SolveProblem />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/problem/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <CodeEditor />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/contest/:id/problem/:problemId"
            element={
              <ProtectedRoute>
                <Layout>
                  <CodeEditor />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/contests"
            element={
              <ProtectedRoute>
                <Layout>
                  <Contest />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/contest/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <Contest />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Leaderboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/learn"
            element={
              <ProtectedRoute>
                <Layout>
                  <Learn />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/submissions"
            element={
              <ProtectedRoute>
                <Layout>
                  <Submissions />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Layout>
                  <Analytics />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
                    <div className="max-w-7xl mx-auto">
                      <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
                          Settings
                        </h1>
                        <p className="text-xl text-gray-300">
                          Customize your PrepFire experience
                        </p>
                      </div>
                      
                      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
                        <div className="text-center py-20">
                          <div className="text-6xl mb-4">⚙️</div>
                          <h3 className="text-2xl font-bold text-white mb-2">Settings Panel</h3>
                          <p className="text-gray-400">Advanced settings panel coming soon</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </AdminRoute>
            }
          />

          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" />} />
        </Routes>
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;