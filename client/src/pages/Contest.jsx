import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';

const Contest = () => {
  const [contests, setContests] = useState([]);
  const [activeContest, setActiveContest] = useState(null);
  const [contestProblems, setContestProblems] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [userSubmissions, setUserSubmissions] = useState({});
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [registeredContests, setRegisteredContests] = useState(new Set());

  const contestTypes = {
    'weekly': { icon: '📅', color: 'from-blue-500 to-cyan-500' },
    'monthly': { icon: '🏆', color: 'from-purple-500 to-pink-500' },
    'special': { icon: '⭐', color: 'from-yellow-500 to-orange-500' },
    'practice': { icon: '💻', color: 'from-green-500 to-emerald-500' }
  };

  const mockContests = [
    {
      _id: '1',
      name: 'Weekly Challenge #47',
      type: 'weekly',
      status: 'upcoming',
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      duration: 120, // minutes
      participants: 1247,
      maxParticipants: 5000,
      problems: ['Two Sum Variants', 'Binary Tree Paths', 'Dynamic Programming Challenge'],
      difficulty: 'medium',
      description: 'Weekly algorithmic challenge featuring array manipulation, tree traversal, and DP problems.',
      prizes: ['🥇 Premium Subscription (3 months)', '🥈 Premium Subscription (1 month)', '🥉 Certificate'],
      registered: false
    },
    {
      _id: '2',
      name: 'Data Structures Mastery',
      type: 'special',
      status: 'live',
      startTime: new Date(Date.now() - 30 * 60 * 1000), // Started 30 min ago
      endTime: new Date(Date.now() + 90 * 60 * 1000), // Ends in 90 min
      duration: 120,
      participants: 892,
      maxParticipants: 2000,
      problems: ['Stack Operations', 'Queue Implementation', 'Tree Balancing'],
      difficulty: 'hard',
      description: 'Advanced data structures contest focusing on implementation and optimization.',
      prizes: ['🥇 $500 Cash Prize', '🥈 $200 Cash Prize', '🥉 $100 Cash Prize'],
      registered: true
    },
    {
      _id: '3',
      name: 'Beginner Friendly Contest',
      type: 'practice',
      status: 'upcoming',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endTime: new Date(Date.now() + 26 * 60 * 60 * 1000),
      duration: 120,
      participants: 2156,
      maxParticipants: 10000,
      problems: ['Array Basics', 'String Manipulation', 'Simple Math'],
      difficulty: 'easy',
      description: 'Perfect for beginners to get started with competitive programming.',
      prizes: ['🥇 Beginner Badge', '🥈 Progress Badge', '🥉 Participant Badge'],
      registered: false
    },
    {
      _id: '4',
      name: 'Monthly Championship',
      type: 'monthly',
      status: 'ended',
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 180 * 60 * 1000),
      duration: 180,
      participants: 3428,
      maxParticipants: 10000,
      problems: ['Graph Algorithms', 'Advanced DP', 'Number Theory', 'Geometry'],
      difficulty: 'hard',
      description: 'Monthly championship with challenging algorithmic problems.',
      prizes: ['🥇 $1000 + Trophy', '🥈 $500 + Medal', '🥉 $250 + Certificate'],
      registered: true,
      userRank: 156,
      userScore: 1247
    }
  ];

  const mockLeaderboard = [
    { rank: 1, user: 'AlgoMaster', score: 2850, problemsSolved: 4, penalty: 15, country: 'US' },
    { rank: 2, user: 'CodeNinja', score: 2720, problemsSolved: 4, penalty: 25, country: 'IN' },
    { rank: 3, user: 'PyThonPro', score: 2680, problemsSolved: 3, penalty: 12, country: 'CN' },
    { rank: 4, user: 'JavaGuru', score: 2540, problemsSolved: 3, penalty: 18, country: 'DE' },
    { rank: 5, user: 'CppExpert', score: 2460, problemsSolved: 3, penalty: 22, country: 'RU' }
  ];

  useEffect(() => {
    fetchContests();
  }, []);

  useEffect(() => {
    if (contests.length > 0) {
      gsap.fromTo('.contest-header',
        { opacity: 0, y: -50 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );

      gsap.fromTo('.contest-card',
        { opacity: 0, y: 50, rotationX: -15 },
        { opacity: 1, y: 0, rotationX: 0, duration: 0.8, stagger: 0.1, delay: 0.3, ease: 'power3.out' }
      );
    }
  }, [contests]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeContest && activeContest.status === 'live') {
        const now = new Date();
        const endTime = new Date(activeContest.endTime);
        const remaining = Math.max(0, endTime - now);
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeContest]);

  const fetchContests = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      
      // In a real implementation, this would fetch from the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setContests(mockContests);
      
      // Set registered contests
      const registered = new Set(mockContests.filter(c => c.registered).map(c => c._id));
      setRegisteredContests(registered);
      
    } catch (error) {
      console.error('Fetch contests error:', error);
      setError('Failed to load contests');
      setContests(mockContests);
    } finally {
      setLoading(false);
    }
  };

  const registerForContest = async (contestId) => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Mock registration
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRegisteredContests(prev => new Set([...prev, contestId]));
      setContests(prev => prev.map(contest => 
        contest._id === contestId 
          ? { ...contest, registered: true, participants: contest.participants + 1 }
          : contest
      ));
      
      alert('Successfully registered for the contest!');
    } catch (error) {
      console.error('Register contest error:', error);
      alert('Failed to register for contest. Please try again.');
    }
  };

  const joinContest = async (contest) => {
    try {
      setActiveContest(contest);
      
      // Mock contest problems
      const mockProblems = [
        {
          id: 'A',
          title: 'Two Sum Variants',
          difficulty: 'easy',
          points: 500,
          solved: false,
          attempts: 0,
          description: 'Find two numbers in array that sum to target'
        },
        {
          id: 'B',
          title: 'Binary Tree Paths',
          difficulty: 'medium',
          points: 1000,
          solved: true,
          attempts: 2,
          description: 'Find all root-to-leaf paths in binary tree'
        },
        {
          id: 'C',
          title: 'Dynamic Programming Challenge',
          difficulty: 'hard',
          points: 1500,
          solved: false,
          attempts: 1,
          description: 'Solve complex DP optimization problem'
        }
      ];
      
      setContestProblems(mockProblems);
      setLeaderboard(mockLeaderboard);
      
      const now = new Date();
      const endTime = new Date(contest.endTime);
      setTimeRemaining(Math.max(0, endTime - now));
      
    } catch (error) {
      console.error('Join contest error:', error);
      alert('Failed to join contest. Please try again.');
    }
  };

  const formatTime = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getContestsByStatus = (status) => {
    return contests.filter(contest => contest.status === status);
  };

  const ContestCard = ({ contest }) => {
    const isRegistered = registeredContests.has(contest._id);
    const contestType = contestTypes[contest.type] || contestTypes['practice'];
    
    return (
      <div className="contest-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${contestType.color} flex items-center justify-center text-2xl`}>
              {contestType.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{contest.name}</h3>
              <p className="text-gray-400 text-sm capitalize">{contest.type} Contest</p>
            </div>
          </div>
          
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            contest.status === 'live' ? 'bg-green-500/20 text-green-400' :
            contest.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {contest.status.toUpperCase()}
          </span>
        </div>

        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{contest.description}</p>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Duration:</span>
            <span className="text-white">{contest.duration} minutes</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Participants:</span>
            <span className="text-white">{contest.participants.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Difficulty:</span>
            <span className={`font-medium ${
              contest.difficulty === 'easy' ? 'text-green-400' :
              contest.difficulty === 'medium' ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {contest.difficulty.toUpperCase()}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Start Time:</span>
            <span className="text-white">{formatDateTime(contest.startTime)}</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-400 text-sm mb-2">Problems ({contest.problems.length}):</p>
          <div className="flex flex-wrap gap-1">
            {contest.problems.slice(0, 2).map((problem, index) => (
              <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                {problem}
              </span>
            ))}
            {contest.problems.length > 2 && (
              <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
                +{contest.problems.length - 2} more
              </span>
            )}
          </div>
        </div>

        {contest.prizes && contest.prizes.length > 0 && (
          <div className="mb-4">
            <p className="text-gray-400 text-sm mb-2">Prizes:</p>
            <div className="space-y-1">
              {contest.prizes.slice(0, 2).map((prize, index) => (
                <p key={index} className="text-xs text-gray-300">{prize}</p>
              ))}
            </div>
          </div>
        )}

        {contest.status === 'ended' && contest.userRank && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <p className="text-blue-400 font-medium text-sm">Your Result</p>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-300">Rank: #{contest.userRank}</span>
              <span className="text-gray-300">Score: {contest.userScore}</span>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          {contest.status === 'upcoming' && (
            <>
              {!isRegistered ? (
                <button
                  onClick={() => registerForContest(contest._id)}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                >
                  Register
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 py-3 bg-green-500/20 text-green-400 font-semibold rounded-xl cursor-not-allowed"
                >
                  ✓ Registered
                </button>
              )}
            </>
          )}
          
          {contest.status === 'live' && isRegistered && (
            <button
              onClick={() => joinContest(contest)}
              className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200"
            >
              Join Contest
            </button>
          )}
          
          {contest.status === 'ended' && (
            <button
              onClick={() => {
                // View results
                alert('Results page would open here');
              }}
              className="flex-1 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
            >
              View Results
            </button>
          )}

          <button
            onClick={() => {
              // View details
              alert('Contest details would open here');
            }}
            className="px-6 py-3 bg-gray-700/50 text-gray-300 font-medium rounded-xl hover:bg-gray-600/50 transition-all duration-200"
          >
            Details
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white text-lg font-medium">Loading Contests...</span>
          </div>
        </div>
      </div>
    );
  }

  // Contest Environment View
  if (activeContest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Contest Header */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveContest(null)}
                  className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-all duration-200"
                >
                  ← Exit Contest
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white">{activeContest.name}</h1>
                  <p className="text-gray-400">Contest in progress</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-orange-400">{formatTime(timeRemaining)}</div>
                <div className="text-sm text-gray-400">Time Remaining</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Problems List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">Problems</h2>
              {contestProblems.map((problem) => (
                <div
                  key={problem.id}
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl hover:bg-white/15 transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedProblem(problem)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-cyan-400">{problem.id}</span>
                      <h3 className="text-lg font-semibold text-white">{problem.title}</h3>
                      {problem.solved && (
                        <span className="text-green-400 text-xl">✅</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400 font-bold">{problem.points}</div>
                      <div className="text-xs text-gray-400">points</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-3">{problem.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      problem.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                      problem.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {problem.difficulty.toUpperCase()}
                    </span>
                    
                    <div className="text-sm text-gray-400">
                      {problem.attempts > 0 && `${problem.attempts} attempt${problem.attempts !== 1 ? 's' : ''}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Leaderboard */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4">Leaderboard</h2>
              <div className="space-y-3">
                {leaderboard.slice(0, 10).map((entry) => (
                  <div key={entry.rank} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        entry.rank === 1 ? 'bg-yellow-500 text-white' :
                        entry.rank === 2 ? 'bg-gray-400 text-white' :
                        entry.rank === 3 ? 'bg-orange-500 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {entry.rank}
                      </span>
                      <div>
                        <div className="text-white font-medium">{entry.user}</div>
                        <div className="text-xs text-gray-400">{entry.country}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-cyan-400 font-bold">{entry.score}</div>
                      <div className="text-xs text-gray-400">{entry.problemsSolved} solved</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="text-blue-400 font-medium">Your Standing</div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-300">Rank: #--</span>
                  <span className="text-gray-300">Score: 0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Problem Solve Modal */}
        {selectedProblem && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Problem {selectedProblem.id}: {selectedProblem.title}
                </h2>
                <button
                  onClick={() => setSelectedProblem(null)}
                  className="w-10 h-10 bg-gray-700/50 hover:bg-gray-600/50 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-gray-300 mb-6">{selectedProblem.description}</p>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setSelectedProblem(null);
                    window.location.href = `/contest/${activeContest._id}/problem/${selectedProblem.id}`;
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all duration-200"
                >
                  Solve Problem
                </button>
                <button
                  onClick={() => setSelectedProblem(null)}
                  className="px-6 py-3 bg-gray-700/50 text-gray-300 font-medium rounded-xl hover:bg-gray-600/50 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main Contest List View
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="contest-header text-center mb-12">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Coding Contests
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Compete with programmers worldwide in exciting coding challenges
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
            <p className="text-yellow-300 text-sm">⚠️ {error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-2 inline-flex">
            {[
              { id: 'upcoming', label: 'Upcoming', count: getContestsByStatus('upcoming').length },
              { id: 'live', label: 'Live', count: getContestsByStatus('live').length },
              { id: 'ended', label: 'Past', count: getContestsByStatus('ended').length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contest Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getContestsByStatus(activeTab).map(contest => (
            <ContestCard key={contest._id} contest={contest} />
          ))}
        </div>

        {getContestsByStatus(activeTab).length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              No {activeTab} contests
            </h3>
            <p className="text-gray-400">
              {activeTab === 'upcoming' && 'Check back later for new contests!'}
              {activeTab === 'live' && 'No contests are currently running.'}
              {activeTab === 'ended' && 'No past contests to display.'}
            </p>
          </div>
        )}

        {/* Create Contest (Admin Only) */}
        <div className="mt-12 text-center">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">Want to Host a Contest?</h2>
            <p className="text-gray-300 mb-6">
              Create custom contests for your organization or community
            </p>
            <button
              onClick={() => alert('Contest creation feature coming soon!')}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
            >
              Create Contest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contest;