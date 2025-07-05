import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);
  const [userRank, setUserRank] = useState(null);

  const fetchLeaderboard = async (selectedTimeframe = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/user/leaderboard?timeframe=${selectedTimeframe}&limit=100`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLeaderboardData(data.data.leaderboard);
          
          // Find current user's rank
          const userEmail = localStorage.getItem('userEmail');
          if (userEmail) {
            const userIndex = data.data.leaderboard.findIndex(user => user.email === userEmail);
            if (userIndex !== -1) {
              setCurrentUser(data.data.leaderboard[userIndex]);
              setUserRank(userIndex + 1);
            }
          }
        } else {
          throw new Error(data.message || 'Failed to fetch leaderboard');
        }
      } else {
        throw new Error('Failed to fetch leaderboard from server');
      }
    } catch (error) {
      console.error('Fetch leaderboard error:', error);
      setError(error.message);
      
      // Mock data for development
      const mockLeaderboard = [
        {
          _id: '1',
          name: 'Alex Chen',
          email: 'alex@example.com',
          statistics: {
            points: 2850,
            solvedProblems: 142,
            accuracy: 96,
            rank: 1
          },
          streak: { current: 28, longest: 45 },
          createdAt: new Date('2024-01-15')
        },
        {
          _id: '2',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          statistics: {
            points: 2720,
            solvedProblems: 136,
            accuracy: 94,
            rank: 2
          },
          streak: { current: 15, longest: 32 },
          createdAt: new Date('2024-02-10')
        },
        {
          _id: '3',
          name: 'Michael Rodriguez',
          email: 'michael@example.com',
          statistics: {
            points: 2680,
            solvedProblems: 134,
            accuracy: 92,
            rank: 3
          },
          streak: { current: 22, longest: 28 },
          createdAt: new Date('2024-01-22')
        },
        {
          _id: '4',
          name: 'Emily Davis',
          email: 'emily@example.com',
          statistics: {
            points: 2540,
            solvedProblems: 127,
            accuracy: 91,
            rank: 4
          },
          streak: { current: 12, longest: 25 },
          createdAt: new Date('2024-03-05')
        },
        {
          _id: '5',
          name: 'David Kim',
          email: 'david@example.com',
          statistics: {
            points: 2460,
            solvedProblems: 123,
            accuracy: 89,
            rank: 5
          },
          streak: { current: 8, longest: 20 },
          createdAt: new Date('2024-02-28')
        }
      ];
      
      // Add more mock users
      for (let i = 6; i <= 50; i++) {
        mockLeaderboard.push({
          _id: i.toString(),
          name: `User ${i}`,
          email: `user${i}@example.com`,
          statistics: {
            points: Math.max(100, 2400 - (i * 50) + Math.random() * 100),
            solvedProblems: Math.max(10, 120 - i + Math.random() * 10),
            accuracy: Math.max(60, 88 - (i * 0.5) + Math.random() * 5),
            rank: i
          },
          streak: { 
            current: Math.floor(Math.random() * 15), 
            longest: Math.floor(Math.random() * 30) 
          },
          createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
        });
      }
      
      setLeaderboardData(mockLeaderboard);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(timeframe);
  }, [timeframe]);

  useEffect(() => {
    if (!loading) {
      gsap.fromTo('.leaderboard-header',
        { opacity: 0, y: -50 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );

      gsap.fromTo('.leaderboard-item',
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.05, delay: 0.3, ease: 'power2.out' }
      );

      gsap.fromTo('.stats-card',
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, delay: 0.5, ease: 'back.out(1.7)' }
      );
    }
  }, [loading, leaderboardData]);

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  const getRankColor = (rank) => {
    switch(rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-orange-400 to-orange-600';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatJoinDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  const LeaderboardItem = ({ user, rank, isCurrentUser = false }) => (
    <div className={`leaderboard-item backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 shadow-xl hover:bg-white/15 transition-all duration-300 transform hover:scale-[1.02] ${
      isCurrentUser ? 'ring-2 ring-cyan-400 bg-cyan-500/10' : ''
    }`}>
      <div className="flex items-center space-x-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r ${getRankColor(rank)} flex items-center justify-center text-white font-bold`}>
          {rank <= 3 ? getRankIcon(rank) : rank}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-white truncate">
              {user.name}
              {isCurrentUser && <span className="text-cyan-400 text-sm ml-2">(You)</span>}
            </h3>
            {user.streak?.current > 0 && (
              <div className="flex items-center space-x-1 text-orange-400">
                <span>🔥</span>
                <span className="text-sm">{user.streak.current}</span>
              </div>
            )}
          </div>
          <p className="text-gray-400 text-sm truncate">{user.email}</p>
          <p className="text-gray-500 text-xs">Joined {formatJoinDate(user.createdAt)}</p>
        </div>
        
        <div className="text-right space-y-1">
          <div className="text-xl font-bold text-white">
            {Math.floor(user.statistics?.points || 0)}
          </div>
          <div className="text-xs text-gray-400">points</div>
        </div>
        
        <div className="text-right space-y-1">
          <div className="text-lg font-semibold text-cyan-400">
            {user.statistics?.solvedProblems || 0}
          </div>
          <div className="text-xs text-gray-400">solved</div>
        </div>
        
        <div className="text-right space-y-1">
          <div className="text-lg font-semibold text-green-400">
            {Math.floor(user.statistics?.accuracy || 0)}%
          </div>
          <div className="text-xs text-gray-400">accuracy</div>
        </div>
      </div>
    </div>
  );

  const TopThree = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {leaderboardData.slice(0, 3).map((user, index) => {
        const rank = index + 1;
        return (
          <div
            key={user._id}
            className={`stats-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl text-center transform hover:scale-105 transition-all duration-300 ${
              rank === 1 ? 'md:order-2 ring-2 ring-yellow-400 bg-yellow-500/10' :
              rank === 2 ? 'md:order-1' : 'md:order-3'
            }`}
          >
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r ${getRankColor(rank)} flex items-center justify-center text-3xl`}>
              {getRankIcon(rank)}
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">{user.name}</h3>
            <p className="text-gray-400 text-sm mb-4">{user.email}</p>
            
            <div className="space-y-3">
              <div className="bg-gray-800/30 rounded-xl p-3">
                <div className="text-2xl font-bold text-white">{Math.floor(user.statistics?.points || 0)}</div>
                <div className="text-xs text-gray-400">Total Points</div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800/30 rounded-xl p-3">
                  <div className="text-lg font-semibold text-cyan-400">{user.statistics?.solvedProblems || 0}</div>
                  <div className="text-xs text-gray-400">Solved</div>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-3">
                  <div className="text-lg font-semibold text-green-400">{Math.floor(user.statistics?.accuracy || 0)}%</div>
                  <div className="text-xs text-gray-400">Accuracy</div>
                </div>
              </div>
              
              {user.streak?.current > 0 && (
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-3 border border-orange-500/30">
                  <div className="flex items-center justify-center space-x-2">
                    <span>🔥</span>
                    <span className="text-lg font-semibold text-orange-400">{user.streak.current} days</span>
                  </div>
                  <div className="text-xs text-gray-400">Current Streak</div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white text-lg font-medium">Loading Leaderboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="leaderboard-header text-center mb-12">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Leaderboard
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            See how you rank against other coders and track your progress
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
              <span className="text-white font-medium">Timeframe:</span>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-4 py-2 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="week">This Week</option>
              </select>
            </div>
            
            {userRank && (
              <div className="text-right">
                <div className="text-cyan-400 font-semibold">Your Rank: #{userRank}</div>
                <div className="text-gray-400 text-sm">{currentUser?.statistics?.points || 0} points</div>
              </div>
            )}
          </div>
        </div>

        {leaderboardData.length >= 3 && <TopThree />}

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Full Rankings</h2>
            <div className="text-gray-400 text-sm">
              {leaderboardData.length} users
            </div>
          </div>
          
          <div className="space-y-3">
            {leaderboardData.map((user, index) => (
              <LeaderboardItem
                key={user._id}
                user={user}
                rank={index + 1}
                isCurrentUser={currentUser?._id === user._id}
              />
            ))}
          </div>

          {leaderboardData.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-white mb-2">No Data Available</h3>
              <p className="text-gray-400 mb-6">Start solving problems to appear on the leaderboard!</p>
              <button
                onClick={() => window.location.href = '/practice'}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all duration-200"
              >
                Start Practicing
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stats-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="text-lg font-semibold text-white mb-2">Highest Accuracy</h3>
            <div className="text-2xl font-bold text-green-400">
              {leaderboardData.length > 0 ? Math.max(...leaderboardData.map(u => u.statistics?.accuracy || 0)).toFixed(1) : 0}%
            </div>
            <p className="text-gray-400 text-sm mt-1">
              by {leaderboardData.find(u => u.statistics?.accuracy === Math.max(...leaderboardData.map(u => u.statistics?.accuracy || 0)))?.name || 'N/A'}
            </p>
          </div>

          <div className="stats-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl text-center">
            <div className="text-3xl mb-2">🔥</div>
            <h3 className="text-lg font-semibold text-white mb-2">Longest Streak</h3>
            <div className="text-2xl font-bold text-orange-400">
              {leaderboardData.length > 0 ? Math.max(...leaderboardData.map(u => u.streak?.longest || 0)) : 0} days
            </div>
            <p className="text-gray-400 text-sm mt-1">
              by {leaderboardData.find(u => u.streak?.longest === Math.max(...leaderboardData.map(u => u.streak?.longest || 0)))?.name || 'N/A'}
            </p>
          </div>

          <div className="stats-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl text-center">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="text-lg font-semibold text-white mb-2">Most Problems</h3>
            <div className="text-2xl font-bold text-cyan-400">
              {leaderboardData.length > 0 ? Math.max(...leaderboardData.map(u => u.statistics?.solvedProblems || 0)) : 0}
            </div>
            <p className="text-gray-400 text-sm mt-1">
              by {leaderboardData.find(u => u.statistics?.solvedProblems === Math.max(...leaderboardData.map(u => u.statistics?.solvedProblems || 0)))?.name || 'N/A'}
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">Climb the Ranks!</h2>
            <p className="text-gray-300 mb-6">
              Solve more problems, maintain your streak, and improve your accuracy to climb higher on the leaderboard.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/practice'}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
              >
                Practice Now
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all duration-200"
              >
                View Progress
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;