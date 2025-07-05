import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [performanceData, setPerformanceData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [difficultyData, setDifficultyData] = useState([]);
  const [streakData, setStreakData] = useState([]);
  const [accuracyTrend, setAccuracyTrend] = useState([]);
  const [timeSpentData, setTimeSpentData] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const fetchAnalyticsData = async (selectedTimeframe = '30d') => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      
      const mockAnalyticsData = {
        overview: {
          totalProblems: 156,
          solvedProblems: 89,
          accuracy: 92.3,
          averageTime: 18.5,
          streak: { current: 15, longest: 28 },
          rank: 1247,
          points: 2150,
          level: 12
        },
        performanceChart: [
          { date: '2024-01-01', problems: 5, accuracy: 80, time: 25 },
          { date: '2024-01-08', problems: 8, accuracy: 85, time: 22 },
          { date: '2024-01-15', problems: 12, accuracy: 88, time: 20 },
          { date: '2024-01-22', problems: 15, accuracy: 90, time: 18 },
          { date: '2024-01-29', problems: 18, accuracy: 92, time: 16 }
        ],
        categoryBreakdown: [
          { name: 'Arrays', solved: 25, total: 30, accuracy: 83 },
          { name: 'Strings', solved: 18, total: 22, accuracy: 82 },
          { name: 'Trees', solved: 15, total: 25, accuracy: 60 },
          { name: 'Graphs', solved: 8, total: 20, accuracy: 40 },
          { name: 'DP', solved: 12, total: 30, accuracy: 40 },
          { name: 'Sorting', solved: 11, total: 15, accuracy: 73 }
        ],
        difficultyBreakdown: [
          { name: 'Easy', value: 45, color: '#10B981' },
          { name: 'Medium', value: 32, color: '#F59E0B' },
          { name: 'Hard', value: 12, color: '#EF4444' }
        ],
        streakData: [
          { date: '2024-01-01', streak: 5 },
          { date: '2024-01-02', streak: 6 },
          { date: '2024-01-03', streak: 7 },
          { date: '2024-01-04', streak: 8 },
          { date: '2024-01-05', streak: 9 },
          { date: '2024-01-06', streak: 10 },
          { date: '2024-01-07', streak: 11 }
        ],
        accuracyTrend: [
          { week: 'Week 1', accuracy: 78 },
          { week: 'Week 2', accuracy: 82 },
          { week: 'Week 3', accuracy: 85 },
          { week: 'Week 4', accuracy: 88 },
          { week: 'Week 5', accuracy: 92 }
        ],
        timeSpent: [
          { day: 'Mon', hours: 2.5 },
          { day: 'Tue', hours: 1.8 },
          { day: 'Wed', hours: 3.2 },
          { day: 'Thu', hours: 2.1 },
          { day: 'Fri', hours: 2.8 },
          { day: 'Sat', hours: 4.5 },
          { day: 'Sun', hours: 3.1 }
        ],
        weeklyProgress: [
          { week: 'W1', problems: 8, points: 120 },
          { week: 'W2', problems: 12, points: 180 },
          { week: 'W3', problems: 10, points: 150 },
          { week: 'W4', problems: 15, points: 225 }
        ],
        recommendations: [
          {
            type: 'weakness',
            title: 'Focus on Graph Algorithms',
            description: 'Your accuracy in graph problems is 40%. Practice BFS/DFS.',
            priority: 'high',
            estimatedTime: '2 weeks'
          },
          {
            type: 'strength',
            title: 'Master Dynamic Programming',
            description: 'Build on your array skills to tackle DP problems.',
            priority: 'medium',
            estimatedTime: '3 weeks'
          },
          {
            type: 'time',
            title: 'Improve Problem Solving Speed',
            description: 'Average time is 18.5min. Aim for sub-15min solutions.',
            priority: 'low',
            estimatedTime: '1 week'
          }
        ],
        weakAreas: [
          { topic: 'Graph Traversal', accuracy: 40, improvement: '+15%' },
          { topic: 'Dynamic Programming', accuracy: 45, improvement: '+20%' },
          { topic: 'Tree Algorithms', accuracy: 60, improvement: '+10%' }
        ],
        achievements: [
          { name: 'Speed Demon', description: 'Solved 5 problems in under 10 minutes each', date: '2024-01-20' },
          { name: 'Consistency King', description: 'Maintained 14-day streak', date: '2024-01-25' },
          { name: 'Category Master', description: 'Achieved 90%+ accuracy in Arrays', date: '2024-01-28' }
        ]
      };

      setAnalyticsData(mockAnalyticsData.overview);
      setPerformanceData(mockAnalyticsData.performanceChart);
      setCategoryData(mockAnalyticsData.categoryBreakdown);
      setDifficultyData(mockAnalyticsData.difficultyBreakdown);
      setStreakData(mockAnalyticsData.streakData);
      setAccuracyTrend(mockAnalyticsData.accuracyTrend);
      setTimeSpentData(mockAnalyticsData.timeSpent);
      setWeeklyProgress(mockAnalyticsData.weeklyProgress);
      setRecommendations(mockAnalyticsData.recommendations);

    } catch (error) {
      console.error('Analytics fetch error:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData(timeframe);
  }, [timeframe]);

  useEffect(() => {
    if (!loading) {
      gsap.fromTo('.analytics-header',
        { opacity: 0, y: -50 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );

      gsap.fromTo('.analytics-card',
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.1, delay: 0.3, ease: 'power3.out' }
      );

      gsap.fromTo('.chart-container',
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.2, delay: 0.5, ease: 'power2.out' }
      );
    }
  }, [loading, activeTab]);

  const StatCard = ({ title, value, icon, color, trend, subtitle }) => (
    <div className={`analytics-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl hover:bg-white/15 transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} text-2xl`}>
          {icon}
        </div>
        {trend && (
          <div className={`text-sm font-medium ${trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
            {trend}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{title}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );

  const ChartCard = ({ title, children, className = "" }) => (
    <div className={`chart-container backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl ${className}`}>
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white text-lg font-medium">Loading Analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="analytics-header mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Performance Analytics
          </h1>
          <p className="text-xl text-gray-300">
            Deep insights into your coding journey and performance patterns
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
            <p className="text-yellow-300 text-sm">⚠️ {error} (Showing sample data)</p>
          </div>
        )}

        <div className="mb-8">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'performance', label: 'Performance', icon: '📈' },
                { id: 'categories', label: 'Categories', icon: '🎯' },
                { id: 'insights', label: 'Insights', icon: '💡' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-4 py-2 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 3 Months</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
        </div>

        {activeTab === 'overview' && analyticsData && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Problems Solved"
                value={analyticsData.solvedProblems}
                icon="🎯"
                color="bg-green-500/20"
                trend="+12 this week"
              />
              <StatCard
                title="Accuracy Rate"
                value={`${analyticsData.accuracy}%`}
                icon="⚡"
                color="bg-cyan-500/20"
                trend="+2.3%"
              />
              <StatCard
                title="Current Streak"
                value={`${analyticsData.streak.current} days`}
                icon="🔥"
                color="bg-orange-500/20"
                trend="Personal best!"
              />
              <StatCard
                title="Global Rank"
                value={`#${analyticsData.rank}`}
                icon="🏆"
                color="bg-purple-500/20"
                trend="+23 positions"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Weekly Progress">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="week" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }} 
                    />
                    <Area type="monotone" dataKey="problems" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="points" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Time Spent (Hours)">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeSpentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }} 
                    />
                    <Bar dataKey="hours" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Performance Trend">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }} 
                    />
                    <Line type="monotone" dataKey="problems" stroke="#06B6D4" strokeWidth={3} />
                    <Line type="monotone" dataKey="accuracy" stroke="#10B981" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Accuracy Improvement">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={accuracyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="week" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }} 
                    />
                    <Area type="monotone" dataKey="accuracy" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <ChartCard title="Difficulty Distribution">
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={difficultyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={150}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {difficultyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-6 mt-4">
                {difficultyData.map((entry, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-white text-sm">{entry.name}: {entry.value}</span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-8">
            <ChartCard title="Category Performance">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={categoryData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }} 
                  />
                  <Bar dataKey="solved" fill="#06B6D4" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="accuracy" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryData.map((category, index) => (
                <div key={index} className="analytics-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl">
                  <h4 className="text-lg font-semibold text-white mb-3">{category.name}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">{category.solved}/{category.total}</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(category.solved / category.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Accuracy</span>
                      <span className={`font-medium ${category.accuracy >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {category.accuracy}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="AI Recommendations">
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className={`p-4 rounded-xl border ${
                      rec.priority === 'high' ? 'bg-red-500/10 border-red-500/30' :
                      rec.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                      'bg-blue-500/10 border-blue-500/30'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-white">{rec.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${
                          rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {rec.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{rec.description}</p>
                      <div className="text-xs text-gray-400">Est. time: {rec.estimatedTime}</div>
                    </div>
                  ))}
                </div>
              </ChartCard>

              <ChartCard title="Improvement Areas">
                <div className="space-y-4">
                  {[
                    { topic: 'Graph Algorithms', current: 40, target: 70, color: 'red' },
                    { topic: 'Dynamic Programming', current: 55, target: 75, color: 'yellow' },
                    { topic: 'Tree Algorithms', current: 65, target: 80, color: 'blue' }
                  ].map((area, index) => (
                    <div key={index} className="p-4 bg-gray-800/30 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">{area.topic}</span>
                        <span className="text-gray-400 text-sm">{area.current}% → {area.target}%</span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            area.color === 'red' ? 'bg-red-400' :
                            area.color === 'yellow' ? 'bg-yellow-400' : 'bg-blue-400'
                          }`}
                          style={{ width: `${area.current}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {area.target - area.current}% improvement needed
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </div>

            <ChartCard title="Recent Achievements">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: '⚡', title: 'Speed Demon', desc: 'Solved 5 problems under 10min each', date: 'Jan 20' },
                  { icon: '🔥', title: 'Streak Master', desc: 'Maintained 14-day solving streak', date: 'Jan 25' },
                  { icon: '🎯', title: 'Category Expert', desc: 'Achieved 90%+ in Arrays', date: 'Jan 28' }
                ].map((achievement, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
                    <div className="text-2xl mb-2">{achievement.icon}</div>
                    <h4 className="font-semibold text-white mb-1">{achievement.title}</h4>
                    <p className="text-gray-300 text-sm mb-2">{achievement.desc}</p>
                    <div className="text-xs text-yellow-400">{achievement.date}</div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;