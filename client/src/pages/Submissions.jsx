import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');

  const submissionsPerPage = 20;

  const statusColors = {
    'accepted': 'text-green-400 bg-green-500/20',
    'wrong_answer': 'text-red-400 bg-red-500/20',
    'time_limit_exceeded': 'text-yellow-400 bg-yellow-500/20',
    'memory_limit_exceeded': 'text-orange-400 bg-orange-500/20',
    'runtime_error': 'text-purple-400 bg-purple-500/20',
    'compilation_error': 'text-pink-400 bg-pink-500/20',
    'pending': 'text-gray-400 bg-gray-500/20'
  };

  const statusIcons = {
    'accepted': '✅',
    'wrong_answer': '❌',
    'time_limit_exceeded': '⏰',
    'memory_limit_exceeded': '💾',
    'runtime_error': '🚫',
    'compilation_error': '⚠️',
    'pending': '⏳'
  };

  const languages = ['all', 'javascript', 'python', 'java', 'cpp', 'c', 'csharp'];

  const fetchSubmissions = async (page = 1, filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: submissionsPerPage.toString(),
        sort: sortBy === 'recent' ? 'submittedAt' : sortBy,
        order: 'desc'
      });

      if (filters.status && filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }
      if (filters.language && filters.language !== 'all') {
        queryParams.append('language', filters.language);
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/submissions?${queryParams}`,
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
          setSubmissions(data.data.submissions);
          setFilteredSubmissions(data.data.submissions);
          setTotalPages(data.data.pagination.pages);
          setCurrentPage(data.data.pagination.current);
        } else {
          throw new Error(data.message || 'Failed to fetch submissions');
        }
      } else {
        throw new Error('Failed to fetch submissions from server');
      }
    } catch (error) {
      console.error('Fetch submissions error:', error);
      setError(error.message);

      // Mock submissions data
      const mockSubmissions = [
        {
          _id: '1',
          problemId: {
            _id: 'p1',
            title: 'Two Sum',
            difficulty: 'easy'
          },
          code: 'function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}',
          language: 'javascript',
          status: 'accepted',
          runtime: 72,
          memory: 42.1,
          testCasesPassed: 57,
          totalTestCases: 57,
          submittedAt: new Date(Date.now() - 3600000),
          points: 10
        },
        {
          _id: '2',
          problemId: {
            _id: 'p2',
            title: 'Binary Search',
            difficulty: 'medium'
          },
          code: 'def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1',
          language: 'python',
          status: 'wrong_answer',
          runtime: 89,
          memory: 38.5,
          testCasesPassed: 45,
          totalTestCases: 50,
          submittedAt: new Date(Date.now() - 7200000),
          errorMessage: 'Wrong answer on test case 46'
        },
        {
          _id: '3',
          problemId: {
            _id: 'p3',
            title: 'Merge Sort',
            difficulty: 'hard'
          },
          code: '#include <vector>\n#include <algorithm>\nusing namespace std;\n\nvector<int> mergeSort(vector<int>& arr) {\n    if (arr.size() <= 1) return arr;\n    // Implementation...\n}',
          language: 'cpp',
          status: 'time_limit_exceeded',
          runtime: 5000,
          memory: 156.2,
          testCasesPassed: 12,
          totalTestCases: 25,
          submittedAt: new Date(Date.now() - 14400000),
          errorMessage: 'Time limit exceeded'
        }
      ];

      // Generate more mock submissions
      for (let i = 4; i <= 50; i++) {
        const statuses = ['accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error'];
        const languages = ['javascript', 'python', 'java', 'cpp'];
        const difficulties = ['easy', 'medium', 'hard'];
        
        mockSubmissions.push({
          _id: i.toString(),
          problemId: {
            _id: `p${i}`,
            title: `Problem ${i}`,
            difficulty: difficulties[Math.floor(Math.random() * difficulties.length)]
          },
          code: `// Sample code for problem ${i}\nfunction solution() {\n    // Implementation\n}`,
          language: languages[Math.floor(Math.random() * languages.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          runtime: Math.floor(Math.random() * 1000) + 50,
          memory: Math.floor(Math.random() * 100) + 20,
          testCasesPassed: Math.floor(Math.random() * 50) + 1,
          totalTestCases: 50,
          submittedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          points: Math.floor(Math.random() * 30) + 5
        });
      }

      setSubmissions(mockSubmissions);
      setFilteredSubmissions(mockSubmissions);
      setTotalPages(Math.ceil(mockSubmissions.length / submissionsPerPage));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions(currentPage, {
      status: filterStatus,
      language: filterLanguage
    });
  }, [currentPage, filterStatus, filterLanguage, sortBy]);

  useEffect(() => {
    // Client-side filtering for search
    let filtered = submissions;
    
    if (searchTerm) {
      filtered = filtered.filter(submission =>
        submission.problemId.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredSubmissions(filtered);
  }, [searchTerm, submissions]);

  useEffect(() => {
    if (!loading) {
      gsap.fromTo('.submissions-header',
        { opacity: 0, y: -50 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );

      gsap.fromTo('.submission-item',
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.05, delay: 0.3, ease: 'power2.out' }
      );
    }
  }, [loading, filteredSubmissions]);

  const getSubmissionStats = () => {
    const total = submissions.length;
    const accepted = submissions.filter(s => s.status === 'accepted').length;
    const accuracy = total > 0 ? ((accepted / total) * 100).toFixed(1) : 0;
    
    return { total, accepted, accuracy };
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatLanguage = (language) => {
    const languageMap = {
      'javascript': 'JavaScript',
      'python': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'csharp': 'C#'
    };
    return languageMap[language] || language;
  };

  const SubmissionItem = ({ submission }) => (
    <div
      className="submission-item backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 shadow-xl hover:bg-white/15 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
      onClick={() => setSelectedSubmission(submission)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{statusIcons[submission.status]}</span>
            <div>
              <h3 className="font-semibold text-white truncate">{submission.problemId.title}</h3>
              <div className="flex items-center space-x-2 text-sm">
                <span className={`px-2 py-1 rounded-full ${statusColors[submission.status]}`}>
                  {submission.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  submission.problemId.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                  submission.problemId.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {submission.problemId.difficulty}
                </span>
                <span className="text-gray-400">{formatLanguage(submission.language)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-sm">
          {submission.status === 'accepted' && (
            <div className="text-center">
              <div className="text-white font-medium">{submission.runtime}ms</div>
              <div className="text-gray-400">Runtime</div>
            </div>
          )}
          
          <div className="text-center">
            <div className="text-white font-medium">
              {submission.testCasesPassed}/{submission.totalTestCases}
            </div>
            <div className="text-gray-400">Tests</div>
          </div>
          
          <div className="text-center">
            <div className="text-gray-400 text-xs">
              {formatDateTime(submission.submittedAt)}
            </div>
          </div>
          
          <div className="text-cyan-400">
            →
          </div>
        </div>
      </div>
    </div>
  );

  const stats = getSubmissionStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white text-lg font-medium">Loading Submissions...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="submissions-header mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            My Submissions
          </h1>
          <p className="text-xl text-gray-300">
            Track your coding journey and review your solutions
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
            <p className="text-yellow-300 text-sm">⚠️ {error} (Showing sample data)</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-white mb-2">{stats.total}</div>
            <div className="text-gray-400">Total Submissions</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{stats.accepted}</div>
            <div className="text-gray-400">Accepted Solutions</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">{stats.accuracy}%</div>
            <div className="text-gray-400">Success Rate</div>
          </div>
        </div>

        {/* Filters */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-white font-medium mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="all">All Status</option>
                <option value="accepted">Accepted</option>
                <option value="wrong_answer">Wrong Answer</option>
                <option value="time_limit_exceeded">Time Limit Exceeded</option>
                <option value="runtime_error">Runtime Error</option>
                <option value="compilation_error">Compilation Error</option>
              </select>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Language</label>
              <select
                value={filterLanguage}
                onChange={(e) => {
                  setFilterLanguage(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang === 'all' ? 'All Languages' : formatLanguage(lang)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="recent">Most Recent</option>
                <option value="runtime">Runtime</option>
                <option value="memory">Memory</option>
              </select>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Search</label>
              <input
                type="text"
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4 mb-8">
          {filteredSubmissions.length > 0 ? (
            filteredSubmissions.map(submission => (
              <SubmissionItem key={submission._id} submission={submission} />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-white mb-2">No submissions found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your filters or start solving problems!</p>
              <button
                onClick={() => window.location.href = '/practice'}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all duration-200"
              >
                Start Practicing
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-2">
              {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                const pageNum = Math.max(1, currentPage - 2) + i;
                if (pageNum > totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                      pageNum === currentPage
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Next
            </button>
          </div>
        )}

        {/* Submission Detail Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white">{selectedSubmission.problemId.title}</h2>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`px-3 py-1 rounded-full ${statusColors[selectedSubmission.status]}`}>
                      {statusIcons[selectedSubmission.status]} {selectedSubmission.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-gray-400">{formatLanguage(selectedSubmission.language)}</span>
                    <span className="text-gray-400">{formatDateTime(selectedSubmission.submittedAt)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="w-10 h-10 bg-gray-700/50 hover:bg-gray-600/50 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-800/30 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{selectedSubmission.testCasesPassed}/{selectedSubmission.totalTestCases}</div>
                  <div className="text-sm text-gray-400">Test Cases Passed</div>
                </div>
                {selectedSubmission.runtime && (
                  <div className="bg-gray-800/30 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-cyan-400">{selectedSubmission.runtime}ms</div>
                    <div className="text-sm text-gray-400">Runtime</div>
                  </div>
                )}
                {selectedSubmission.memory && (
                  <div className="bg-gray-800/30 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">{selectedSubmission.memory}MB</div>
                    <div className="text-sm text-gray-400">Memory</div>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Code Solution</h3>
                <div className="bg-gray-900/50 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                    {selectedSubmission.code}
                  </pre>
                </div>
              </div>

              {selectedSubmission.errorMessage && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-4">Error Details</h3>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <p className="text-red-300">{selectedSubmission.errorMessage}</p>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setSelectedSubmission(null);
                    window.location.href = `/problem/${selectedSubmission.problemId._id}`;
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all duration-200"
                >
                  Try Again
                </button>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-6 py-3 bg-gray-700/50 text-gray-300 font-medium rounded-xl hover:bg-gray-600/50 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Submissions;