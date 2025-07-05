import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { problemsAPI } from '../api';

const Practice = () => {
  const [problems, setProblems] = useState([]);
  const [filterDifficulty, setFilterDifficulty] = useState('All Levels');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiPrompt, setAiPrompt] = useState({
    difficulty: 'medium',
    topic: 'array',
    customPrompt: ''
  });
  const [generating, setGenerating] = useState(false);
  const [sortBy, setSortBy] = useState('Most Recent');
  
  const gridRef = useRef();
  const problemsPerPage = 12;

  const categories = [
    'All Categories', 'array', 'string', 'linkedlist', 'tree', 'graph', 'dp', 'greedy',
    'backtracking', 'sorting', 'searching', 'math', 'bit-manipulation',
    'two-pointers', 'sliding-window', 'stack', 'queue', 'heap', 'trie'
  ];

  const fetchProblems = async (page = 1, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = {
        page: page.toString(),
        limit: problemsPerPage.toString(),
        sort: sortBy === 'Most Recent' ? 'createdAt' : sortBy === 'Difficulty' ? 'difficulty' : 'title',
        order: sortBy === 'Most Recent' ? 'desc' : 'asc'
      };

      if (filters.difficulty && filters.difficulty !== 'All Levels') {
        queryParams.difficulty = filters.difficulty;
      }
      if (filters.category && filters.category !== 'All Categories') {
        queryParams.category = filters.category;
      }
      if (filters.search) {
        queryParams.search = filters.search;
      }

      console.log('Fetching problems with params:', queryParams);
      const data = await problemsAPI.getAll(queryParams);
      
      if (data.success) {
        setProblems(data.problems);
        setTotalPages(data.pagination.pages);
        setCurrentPage(data.pagination.current);
      } else {
        throw new Error(data.message || 'Failed to fetch problems');
      }
    } catch (error) {
      console.error('Fetch problems error:', error);
      setError(error.message);
      
      const mockProblems = [
        {
          _id: '1',
          title: 'Two Sum',
          difficulty: 'easy',
          category: 'array',
          tags: ['array', 'hash-table'],
          solved: true,
          attempted: true,
          statistics: { acceptanceRate: 85, solvedBy: 2543 },
          estimatedTime: 15
        },
        {
          _id: '2',
          title: 'Add Two Numbers',
          difficulty: 'medium',
          category: 'linkedlist',
          tags: ['linked-list', 'math'],
          solved: false,
          attempted: true,
          statistics: { acceptanceRate: 67, solvedBy: 1892 },
          estimatedTime: 25
        },
        {
          _id: '3',
          title: 'Longest Substring Without Repeating Characters',
          difficulty: 'medium',
          category: 'string',
          tags: ['string', 'sliding-window'],
          solved: true,
          attempted: true,
          statistics: { acceptanceRate: 73, solvedBy: 1654 },
          estimatedTime: 30
        },
        {
          _id: '4',
          title: 'Median of Two Sorted Arrays',
          difficulty: 'hard',
          category: 'array',
          tags: ['array', 'binary-search'],
          solved: false,
          attempted: false,
          statistics: { acceptanceRate: 45, solvedBy: 892 },
          estimatedTime: 45
        },
        {
          _id: '5',
          title: 'Valid Parentheses',
          difficulty: 'easy',
          category: 'stack',
          tags: ['stack', 'string'],
          solved: true,
          attempted: true,
          statistics: { acceptanceRate: 91, solvedBy: 3421 },
          estimatedTime: 10
        },
        {
          _id: '6',
          title: 'Merge k Sorted Lists',
          difficulty: 'hard',
          category: 'linkedlist',
          tags: ['linked-list', 'heap'],
          solved: false,
          attempted: false,
          statistics: { acceptanceRate: 38, solvedBy: 567 },
          estimatedTime: 50
        }
      ];
      setProblems(mockProblems);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems(currentPage, {
      difficulty: filterDifficulty,
      category: filterCategory,
      search: searchTerm
    });
  }, [currentPage, filterDifficulty, filterCategory, searchTerm, sortBy]);

  useEffect(() => {
    if (!loading) {
      gsap.fromTo('.practice-header',
        { opacity: 0, y: -50 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );

      gsap.fromTo('.filter-controls',
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 0.6, delay: 0.2, ease: 'power2.out' }
      );

      gsap.fromTo('.problem-card',
        { opacity: 0, y: 100, rotationX: -20 },
        { opacity: 1, y: 0, rotationX: 0, duration: 0.8, stagger: 0.1, delay: 0.4, ease: 'power3.out' }
      );

      gsap.to('.floating-icon', {
        y: -10,
        rotation: 360,
        duration: 3,
        repeat: -1,
        ease: 'power2.inOut'
      });
    }
  }, [loading, problems]);

  const handleProblemClick = (problem) => {
    window.location.href = `/solve/${problem._id}`;
  };

  const generateAIProblem = async () => {
    try {
      setGenerating(true);
      
      const data = await problemsAPI.generateAI(
        aiPrompt.difficulty,
        aiPrompt.topic,
        aiPrompt.customPrompt
      );

      if (data.success) {
        setShowAIGenerator(false);
        window.location.href = `/solve/${data.problem._id}`;
      } else {
        throw new Error(data.message || 'Failed to generate problem');
      }
    } catch (error) {
      console.error('Error generating AI problem:', error);
      alert('Failed to generate AI problem. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const getRandomProblem = async () => {
    try {
      const difficulty = filterDifficulty !== 'All Levels' ? filterDifficulty : undefined;
      const category = filterCategory !== 'All Categories' ? filterCategory : undefined;
      
      const data = await problemsAPI.getRandom(difficulty, category);
      
      if (data.success) {
        window.location.href = `/solve/${data.problem._id}`;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error fetching random problem:', error);
      if (problems.length > 0) {
        const randomIndex = Math.floor(Math.random() * problems.length);
        window.location.href = `/solve/${problems[randomIndex]._id}`;
      } else {
        alert('No problems available for random selection');
      }
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'easy': return 'from-green-400 to-green-500';
      case 'medium': return 'from-yellow-400 to-yellow-500';
      case 'hard': return 'from-red-400 to-red-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const ProblemCard = ({ problem }) => (
    <div
      className="problem-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl cursor-pointer transform hover:scale-105 hover:bg-white/15 transition-all duration-300"
      onClick={() => handleProblemClick(problem)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${getDifficultyColor(problem.difficulty)}`}></div>
          <span className="text-sm text-gray-400 capitalize">{problem.category}</span>
        </div>
        <div className="flex items-center space-x-2">
          {problem.solved && <div className="text-green-400 text-xl">✅</div>}
          {problem.attempted && !problem.solved && <div className="text-yellow-400 text-xl">⏳</div>}
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">{problem.title}</h3>
      
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          problem.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
          problem.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {problem.difficulty}
        </span>
        
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>⚡ {problem.estimatedTime || 30}m</span>
          <span>✓ {problem.statistics?.solvedBy || 0}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {problem.tags?.slice(0, 2).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
              {tag}
            </span>
          ))}
          {problem.tags?.length > 2 && (
            <span className="text-xs text-gray-400">+{problem.tags.length - 2}</span>
          )}
        </div>
        
        <span className="text-xs text-gray-400">
          {problem.statistics?.acceptanceRate || 0}% acceptance
        </span>
      </div>
    </div>
  );

  const Pagination = () => (
    <div className="flex items-center justify-center space-x-4 mt-8">
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
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white text-lg font-medium">Loading Problems...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="practice-header text-center mb-12">
          <div className="floating-icon text-6xl mb-4">💻</div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Practice Problems
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Master coding interviews with our curated collection of problems and AI-generated challenges
          </p>
        </div>

        <div className="filter-controls backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 mb-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div>
              <label className="block text-white font-medium mb-2">Difficulty</label>
              <select
                value={filterDifficulty}
                onChange={(e) => {
                  setFilterDifficulty(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="All Levels">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'All Categories' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
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
                <option value="Most Recent">Most Recent</option>
                <option value="Difficulty">Difficulty</option>
                <option value="Alphabetical">Alphabetical</option>
              </select>
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">Search</label>
              <input
                type="text"
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-6 justify-center">
            <button
              onClick={getRandomProblem}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105"
            >
              🎲 Random Problem
            </button>
            <button
              onClick={() => setShowAIGenerator(true)}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105"
            >
              🤖 Generate AI Problem
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
            <p className="text-yellow-300 text-sm">⚠️ {error} (Showing sample problems)</p>
          </div>
        )}

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {problems.map((problem) => (
            <ProblemCard key={problem._id} problem={problem} />
          ))}
        </div>

        {problems.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No problems found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your filters or search terms</p>
            <button
              onClick={() => {
                setFilterDifficulty('All Levels');
                setFilterCategory('All Categories');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all duration-200"
            >
              Clear Filters
            </button>
          </div>
        )}

        {totalPages > 1 && <Pagination />}
      </div>

      {showAIGenerator && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">🤖 Generate AI Problem</h2>
              <button
                onClick={() => setShowAIGenerator(false)}
                className="w-8 h-8 bg-gray-700/50 hover:bg-gray-600/50 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Difficulty</label>
                <select
                  value={aiPrompt.difficulty}
                  onChange={(e) => setAiPrompt(prev => ({...prev, difficulty: e.target.value}))}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Topic</label>
                <select
                  value={aiPrompt.topic}
                  onChange={(e) => setAiPrompt(prev => ({...prev, topic: e.target.value}))}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Custom Requirements (Optional)</label>
                <textarea
                  value={aiPrompt.customPrompt}
                  onChange={(e) => setAiPrompt(prev => ({...prev, customPrompt: e.target.value}))}
                  placeholder="e.g., Focus on optimization, include multiple solutions, suitable for beginners..."
                  className="w-full px-4 py-2 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none h-20"
                />
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowAIGenerator(false)}
                className="flex-1 py-3 bg-gray-700/50 text-gray-300 font-medium rounded-xl hover:bg-gray-600/50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={generateAIProblem}
                disabled={generating}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {generating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  'Generate Problem'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Practice;