import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { userAPI, problemsAPI, submissionsAPI } from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [user, setUser] = useState({
    name: 'Coders',
    streak: { current: 15, longest: 25 }
  });
  
  const statsRef = useRef();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [progressData, recommendationsData, activityData] = await Promise.all([
        userAPI.getProgress().catch(() => ({ success: false })),
        userAPI.getRecommendations().catch(() => ({ success: false })),
        userAPI.getActivity(10).catch(() => ({ success: false }))
      ]);

      if (progressData.success) {
        setStats(progressData.data?.statistics || progressData.statistics);
        setWeeklyProgress(progressData.data?.progress?.weeklyProgress || []);
        setAchievements(progressData.data?.achievements || []);
        if (progressData.data?.user) {
          setUser(prev => ({ ...prev, ...progressData.data.user }));
        }
      }

      if (recommendationsData.success) {
        setRecommendations(recommendationsData.data?.recommendations?.problems || recommendationsData.recommendations || []);
      }

      if (activityData.success) {
        setRecentActivity(activityData.data?.activity || activityData.activity || []);
      }

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!loading && stats) {
      gsap.fromTo('.stat-card',
        { opacity: 0, y: 50, rotationX: -15 },
        { opacity: 1, y: 0, rotationX: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
      );

      gsap.fromTo('.activity-item',
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, delay: 0.5, ease: 'power2.out' }
      );

      const tl = gsap.timeline({ repeat: -1 });
      tl.to('.pulse-ring', { scale: 1.2, opacity: 0.7, duration: 1.5 })
        .to('.pulse-ring', { scale: 1.4, opacity: 0, duration: 1.5 }, 0.5);
    }
  }, [loading, stats]);

  const StatCard = ({ title, value, icon, color, trend, onClick }) => (
    <div 
      className={`stat-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} relative`}>
          <div className="pulse-ring absolute inset-0 rounded-xl"></div>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{value}</p>
          {trend && <p className="text-sm text-gray-400">{trend}</p>}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
  );

  const ProgressChart = () => {
    const chartData = weeklyProgress.slice(-7);
    
    return (
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Weekly Progress</h2>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
        
        <div className="space-y-4">
          {chartData.length > 0 ? chartData.map((week, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="text-sm text-gray-300 w-16">
                Week {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-300">Problems Solved</span>
                  <span className="text-sm text-cyan-400">{week.problemsSolved || 0}</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((week.problemsSolved || 0) * 10, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )) : (
            Array.from({length: 7}, (_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="text-sm text-gray-300 w-16">
                  Week {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-300">Problems Solved</span>
                    <span className="text-sm text-cyan-400">{Math.floor(Math.random() * 8)}</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.random() * 60 + 20}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const RecommendationCard = ({ problem }) => (
    <div 
      className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 shadow-xl hover:bg-white/15 transition-all duration-300 cursor-pointer transform hover:scale-105"
      onClick={() => window.location.href = `/solve/${problem._id || problem.id}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-white truncate">{problem.title}</h4>
        <span className={`px-2 py-1 rounded-full text-xs ${
          problem.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
          problem.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {problem.difficulty}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm">{problem.category}</span>
        <span className="text-cyan-400 text-sm">⚡ {problem.estimatedTime || 30} min</span>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const getStatusIcon = (status) => {
      switch(status) {
        case 'accepted': return '✅';
        case 'wrong_answer': return '❌';
        case 'time_limit_exceeded': return '⏰';
        case 'runtime_error': return '🚫';
        default: return '⏳';
      }
    };

    const getStatusColor = (status) => {
      switch(status) {
        case 'accepted': return 'text-green-400';
        case 'wrong_answer': return 'text-red-400';
        case 'time_limit_exceeded': return 'text-yellow-400';
        case 'runtime_error': return 'text-orange-400';
        default: return 'text-gray-400';
      }
    };

    return (
      <div className="activity-item p-4 bg-gray-800/30 rounded-xl border border-white/10 hover:bg-gray-800/50 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-white">{activity.problemId?.title || activity.problem?.title || 'Problem'}</h4>
          <span className={`px-2 py-1 rounded-full text-xs ${
            (activity.problemId?.difficulty || activity.problem?.difficulty) === 'easy' ? 'bg-green-500/20 text-green-400' :
            (activity.problemId?.difficulty || activity.problem?.difficulty) === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {activity.problemId?.difficulty || activity.problem?.difficulty}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon(activity.status)}</span>
            <span className={`text-sm ${getStatusColor(activity.status)}`}>
              {activity.status?.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            {new Date(activity.submittedAt || activity.createdAt).toLocaleDateString()}
          </span>
        </div>
        {activity.runtime && (
          <div className="mt-2 text-xs text-gray-400">
            Runtime: {activity.runtime}ms | Memory: {activity.memory || 0}MB
          </div>
        )}
      </div>
    );
  };

  const generateAIProblem = async () => {
    try {
      const data = await problemsAPI.generateAI('medium', 'array', 'Generate a problem suitable for interview preparation');
      
      if (data.success) {
        window.location.href = `/solve/${data.problem._id}`;
      } else {
        throw new Error(data.message || 'Failed to generate problem');
      }
    } catch (error) {
      console.error('Error generating AI problem:', error);
      alert('Failed to generate AI problem. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white text-lg font-medium">Loading Dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-300">Track your coding progress and achievements</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Problems Solved"
            value={stats?.solvedProblems || stats?.problemsSolved || 127}
            icon="🎯"
            color="bg-green-500/20"
            trend={`+${stats?.weeklyProgress || 12} this week`}
            onClick={() => window.location.href = '/practice'}
          />
          <StatCard
            title="Current Streak"
            value={`${user?.streak?.current || stats?.currentStreak || 15} days`}
            icon="🔥"
            color="bg-orange-500/20"
            trend={user?.streak?.current === user?.streak?.longest ? "Personal best!" : `Best: ${user?.streak?.longest || stats?.longestStreak || 25}`}
          />
          <StatCard
            title="Accuracy Rate"
            value={`${stats?.accuracy || stats?.accuracyRate || 94}%`}
            icon="⚡"
            color="bg-cyan-500/20"
            trend={stats?.accuracy >= 80 ? "Excellent!" : "Keep improving"}
          />
          <StatCard
            title="Global Rank"
            value={`#${stats?.rank || stats?.globalRank || '1,247'}`}
            icon="🏆"
            color="bg-purple-500/20"
            trend="Among all users"
            onClick={() => window.location.href = '/leaderboard'}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <ProgressChart />
          </div>
          
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">AI Recommendations</h2>
            <div className="space-y-4">
              {recommendations.length > 0 ? (
                recommendations.slice(0, 3).map((problem, index) => (
                  <RecommendationCard key={index} problem={problem} />
                ))
              ) : (
                [
                  { title: 'Two Pointer Technique', difficulty: 'medium', category: 'array', estimatedTime: 25, _id: 'rec1' },
                  { title: 'Binary Search Variants', difficulty: 'hard', category: 'searching', estimatedTime: 35, _id: 'rec2' },
                  { title: 'Dynamic Programming Basics', difficulty: 'medium', category: 'dp', estimatedTime: 40, _id: 'rec3' }
                ].map((problem, index) => (
                  <RecommendationCard key={index} problem={problem} />
                ))
              )}
            </div>
            <button
              onClick={generateAIProblem}
              className="w-full mt-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-sm"
            >
              🤖 Generate AI Problem
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
              <button 
                onClick={() => window.location.href = '/submissions'}
                className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors duration-200"
              >
                View All →
              </button>
            </div>
            
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 5).map((activity, index) => (
                  <ActivityItem key={index} activity={activity} />
                ))
              ) : (
                [
                  { problemId: { title: 'Two Sum', difficulty: 'easy' }, status: 'accepted', submittedAt: new Date(), runtime: 120 },
                  { problemId: { title: 'Binary Search', difficulty: 'medium' }, status: 'accepted', submittedAt: new Date(Date.now() - 3600000), runtime: 89 },
                  { problemId: { title: 'Merge Sort', difficulty: 'hard' }, status: 'wrong_answer', submittedAt: new Date(Date.now() - 7200000), runtime: 245 }
                ].map((activity, index) => (
                  <ActivityItem key={index} activity={activity} />
                ))
              )}
            </div>
            
            {recentActivity.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-gray-400 mb-4">No recent activity</p>
                <button
                  onClick={() => window.location.href = '/practice'}
                  className="inline-block px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-200"
                >
                  Start Practicing
                </button>
              </div>
            )}
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Achievements</h2>
            
            <div className="space-y-4">
              {achievements.length > 0 ? (
                achievements.slice(-3).map((achievement, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{achievement.icon || '🏆'}</span>
                      <div>
                        <h4 className="font-semibold text-white">{achievement.name}</h4>
                        <p className="text-sm text-gray-400">{achievement.description}</p>
                        <p className="text-xs text-yellow-400">
                          {new Date(achievement.unlockedAt || achievement.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                [
                  { name: 'First Steps', description: 'Solved your first problem', icon: '🎯', unlockedAt: new Date() },
                  { name: 'Speed Demon', description: 'Solved 5 problems in one day', icon: '⚡', unlockedAt: new Date() },
                  { name: 'Streak Master', description: '7-day solving streak', icon: '🔥', unlockedAt: new Date() }
                ].map((achievement, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <h4 className="font-semibold text-white">{achievement.name}</h4>
                        <p className="text-sm text-gray-400">{achievement.description}</p>
                        <p className="text-xs text-yellow-400">
                          {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-400/20">
              <h3 className="text-lg font-semibold text-white mb-2">Next Milestone</h3>
              <p className="text-gray-300 text-sm mb-3">
                Solve {Math.max(1, 150 - (stats?.solvedProblems || stats?.problemsSolved || 127))} more problems to reach "Problem Solver Pro" achievement
              </p>
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(((stats?.solvedProblems || stats?.problemsSolved || 127) / 150) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/practice'}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
              >
                Practice Problems
              </button>
              <button
                onClick={generateAIProblem}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all duration-200"
              >
                Generate AI Problem
              </button>
              <button
                onClick={() => window.location.href = '/leaderboard'}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-xl hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-200"
              >
                View Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;