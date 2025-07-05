import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const Learn = () => {
  const [learningPaths, setLearningPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('paths');
  const [studyPlan, setStudyPlan] = useState(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [tutorials, setTutorials] = useState([]);
  const [selectedTutorial, setSelectedTutorial] = useState(null);

  const pathsRef = useRef();

  const mockLearningPaths = [
    {
      id: 'arrays-strings',
      title: 'Arrays & Strings',
      icon: '📊',
      difficulty: 'Beginner',
      duration: '2-3 weeks',
      progress: 85,
      description: 'Master the fundamentals of arrays and string manipulation',
      topics: [
        { name: 'Array Basics', completed: true, problems: 12 },
        { name: 'Two Pointers', completed: true, problems: 8 },
        { name: 'Sliding Window', completed: false, problems: 10 },
        { name: 'String Algorithms', completed: false, problems: 15 }
      ],
      totalProblems: 45,
      solvedProblems: 20
    },
    {
      id: 'linked-lists',
      title: 'Linked Lists',
      icon: '🔗',
      difficulty: 'Beginner',
      duration: '1-2 weeks',
      progress: 72,
      description: 'Understand pointers and linked data structures',
      topics: [
        { name: 'Singly Linked Lists', completed: true, problems: 8 },
        { name: 'Doubly Linked Lists', completed: true, problems: 6 },
        { name: 'Circular Lists', completed: false, problems: 4 },
        { name: 'Advanced Operations', completed: false, problems: 7 }
      ],
      totalProblems: 25,
      solvedProblems: 18
    },
    {
      id: 'trees-graphs',
      title: 'Trees & Graphs',
      icon: '🌳',
      difficulty: 'Intermediate',
      duration: '3-4 weeks',
      progress: 45,
      description: 'Explore hierarchical and connected data structures',
      topics: [
        { name: 'Binary Trees', completed: true, problems: 15 },
        { name: 'Binary Search Trees', completed: false, problems: 12 },
        { name: 'Graph Traversal', completed: false, problems: 18 },
        { name: 'Advanced Graph Algorithms', completed: false, problems: 20 }
      ],
      totalProblems: 65,
      solvedProblems: 15
    },
    {
      id: 'dynamic-programming',
      title: 'Dynamic Programming',
      icon: '🧮',
      difficulty: 'Advanced',
      duration: '4-6 weeks',
      progress: 30,
      description: 'Master optimization through memorization and tabulation',
      topics: [
        { name: 'DP Fundamentals', completed: true, problems: 10 },
        { name: '1D DP Problems', completed: false, problems: 15 },
        { name: '2D DP Problems', completed: false, problems: 20 },
        { name: 'Advanced DP Patterns', completed: false, problems: 25 }
      ],
      totalProblems: 70,
      solvedProblems: 10
    },
    {
      id: 'sorting-searching',
      title: 'Sorting & Searching',
      icon: '🔍',
      difficulty: 'Intermediate',
      duration: '2-3 weeks',
      progress: 90,
      description: 'Master efficient sorting and searching algorithms',
      topics: [
        { name: 'Basic Sorting', completed: true, problems: 8 },
        { name: 'Advanced Sorting', completed: true, problems: 12 },
        { name: 'Binary Search', completed: true, problems: 15 },
        { name: 'Search Variations', completed: true, problems: 10 }
      ],
      totalProblems: 45,
      solvedProblems: 41
    },
    {
      id: 'system-design',
      title: 'System Design',
      icon: '🏗️',
      difficulty: 'Advanced',
      duration: '6-8 weeks',
      progress: 15,
      description: 'Learn to design scalable distributed systems',
      topics: [
        { name: 'Design Principles', completed: true, problems: 5 },
        { name: 'Database Design', completed: false, problems: 8 },
        { name: 'Microservices', completed: false, problems: 10 },
        { name: 'Distributed Systems', completed: false, problems: 12 }
      ],
      totalProblems: 35,
      solvedProblems: 5
    }
  ];

  const mockTutorials = [
    {
      id: 'big-o-notation',
      title: 'Big O Notation Explained',
      category: 'Fundamentals',
      duration: '15 min',
      difficulty: 'Beginner',
      description: 'Understand time and space complexity analysis',
      content: `
# Big O Notation

Big O notation is a mathematical notation that describes the limiting behavior of a function when the argument tends towards a particular value or infinity.

## Time Complexity

- **O(1)** - Constant time
- **O(log n)** - Logarithmic time
- **O(n)** - Linear time
- **O(n log n)** - Linearithmic time
- **O(n²)** - Quadratic time

## Examples

### O(1) - Constant Time
\`\`\`javascript
function getFirstElement(arr) {
    return arr[0]; // Always takes the same time
}
\`\`\`

### O(n) - Linear Time
\`\`\`javascript
function findElement(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) return i;
    }
    return -1;
}
\`\`\`
      `,
      tags: ['complexity', 'algorithms', 'analysis']
    },
    {
      id: 'two-pointers-technique',
      title: 'Two Pointers Technique',
      category: 'Algorithms',
      duration: '20 min',
      difficulty: 'Intermediate',
      description: 'Master the two pointers pattern for array problems',
      content: `
# Two Pointers Technique

The two pointers technique is an algorithmic pattern that uses two pointers to iterate through an array or string.

## When to Use
- Problems involving pairs in sorted arrays
- Finding subarrays with specific properties
- Palindrome checking
- Merging sorted arrays

## Example: Two Sum in Sorted Array

\`\`\`javascript
function twoSum(numbers, target) {
    let left = 0;
    let right = numbers.length - 1;
    
    while (left < right) {
        const sum = numbers[left] + numbers[right];
        
        if (sum === target) {
            return [left + 1, right + 1];
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    
    return [];
}
\`\`\`

## Time Complexity: O(n)
## Space Complexity: O(1)
      `,
      tags: ['two-pointers', 'arrays', 'optimization']
    },
    {
      id: 'sliding-window',
      title: 'Sliding Window Pattern',
      category: 'Algorithms',
      duration: '25 min',
      difficulty: 'Intermediate',
      description: 'Learn the sliding window technique for subarray problems',
      content: `
# Sliding Window Pattern

The sliding window pattern is used to perform operations on a specific window size of an array or string.

## Types of Sliding Window
1. **Fixed Size Window**
2. **Variable Size Window**

## Example: Maximum Sum Subarray of Size K

\`\`\`javascript
function maxSumSubarray(arr, k) {
    if (arr.length < k) return null;
    
    // Calculate sum of first window
    let windowSum = 0;
    for (let i = 0; i < k; i++) {
        windowSum += arr[i];
    }
    
    let maxSum = windowSum;
    
    // Slide the window
    for (let i = k; i < arr.length; i++) {
        windowSum = windowSum - arr[i - k] + arr[i];
        maxSum = Math.max(maxSum, windowSum);
    }
    
    return maxSum;
}
\`\`\`

## When to Use
- Finding maximum/minimum in subarrays
- String pattern matching
- Subarray/substring problems
      `,
      tags: ['sliding-window', 'arrays', 'strings']
    }
  ];

  useEffect(() => {
    const fetchLearningData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('authToken');
        
        // In a real implementation, these would be separate API calls
        // For now, using mock data
        setLearningPaths(mockLearningPaths);
        setTutorials(mockTutorials);
        
        // Simulate user progress from API
        const mockProgress = {};
        mockLearningPaths.forEach(path => {
          mockProgress[path.id] = {
            completedTopics: path.topics.filter(t => t.completed).length,
            totalTopics: path.topics.length,
            solvedProblems: path.solvedProblems,
            totalProblems: path.totalProblems
          };
        });
        setUserProgress(mockProgress);
        
      } catch (error) {
        console.error('Learn data fetch error:', error);
        setError('Failed to load learning data');
        setLearningPaths(mockLearningPaths);
        setTutorials(mockTutorials);
      } finally {
        setLoading(false);
      }
    };

    fetchLearningData();
  }, []);

  useEffect(() => {
    if (!loading) {
      gsap.fromTo('.learn-header',
        { opacity: 0, y: -50 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );

      gsap.fromTo('.path-card',
        { opacity: 0, y: 50, rotationX: -15 },
        { opacity: 1, y: 0, rotationX: 0, duration: 0.8, stagger: 0.1, delay: 0.3, ease: 'power3.out' }
      );

      gsap.fromTo('.tutorial-card',
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, delay: 0.5, ease: 'power2.out' }
      );
    }
  }, [loading, activeTab]);

  const generateStudyPlan = async () => {
    try {
      setGeneratingPlan(true);
      
      const token = localStorage.getItem('authToken');
      
      // Mock study plan generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockStudyPlan = {
        title: 'Personalized 12-Week Study Plan',
        duration: '12 weeks',
        difficulty: 'Intermediate',
        focusAreas: ['Dynamic Programming', 'Graph Algorithms', 'System Design'],
        weeks: [
          {
            week: 1,
            theme: 'Array and String Fundamentals',
            topics: ['Two Pointers', 'Sliding Window', 'Prefix Sum'],
            practiceProblems: ['Two Sum', 'Longest Substring', 'Subarray Sum'],
            goals: ['Master two pointers technique', 'Understand sliding window'],
            estimatedHours: 10
          },
          {
            week: 2,
            theme: 'Linked List Mastery',
            topics: ['Reversal', 'Cycle Detection', 'Merging'],
            practiceProblems: ['Reverse Linked List', 'Detect Cycle', 'Merge Two Lists'],
            goals: ['Handle linked list operations', 'Detect patterns'],
            estimatedHours: 8
          },
          {
            week: 3,
            theme: 'Binary Tree Traversals',
            topics: ['DFS', 'BFS', 'Tree Construction'],
            practiceProblems: ['Binary Tree Inorder', 'Level Order', 'Construct Tree'],
            goals: ['Master tree traversals', 'Understand recursion'],
            estimatedHours: 12
          }
        ],
        recommendations: {
          dailyPractice: '1-2 problems per day',
          resources: ['LeetCode', 'Algorithm Design Manual', 'Cracking the Coding Interview'],
          milestones: ['Week 4: Complete Trees section', 'Week 8: Start DP', 'Week 12: Mock interviews']
        }
      };
      
      setStudyPlan(mockStudyPlan);
    } catch (error) {
      console.error('Error generating study plan:', error);
      alert('Failed to generate study plan. Please try again.');
    } finally {
      setGeneratingPlan(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty.toLowerCase()) {
      case 'beginner': return 'from-green-400 to-green-500';
      case 'intermediate': return 'from-yellow-400 to-yellow-500';
      case 'advanced': return 'from-red-400 to-red-500';
      default: return 'from-blue-400 to-blue-500';
    }
  };

  const PathCard = ({ path }) => (
    <div
      className="path-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl cursor-pointer transform hover:scale-105 hover:bg-white/15 transition-all duration-300"
      onClick={() => setSelectedPath(path)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{path.icon}</div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getDifficultyColor(path.difficulty)} text-white`}>
          {path.difficulty}
        </span>
      </div>
      
      <h3 className="text-xl font-bold text-white mb-3">{path.title}</h3>
      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{path.description}</p>
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Progress</span>
          <span className="text-cyan-400 font-medium">{path.progress}%</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${path.progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>⏱️ {path.duration}</span>
        <span>📝 {path.solvedProblems}/{path.totalProblems}</span>
      </div>
    </div>
  );

  const TutorialCard = ({ tutorial }) => (
    <div
      className="tutorial-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 shadow-xl cursor-pointer transform hover:scale-105 hover:bg-white/15 transition-all duration-300"
      onClick={() => setSelectedTutorial(tutorial)}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-lg font-semibold text-white line-clamp-2">{tutorial.title}</h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getDifficultyColor(tutorial.difficulty)} text-white`}>
          {tutorial.difficulty}
        </span>
      </div>
      
      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{tutorial.description}</p>
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-blue-400">{tutorial.category}</span>
        <span className="text-gray-400">⏱️ {tutorial.duration}</span>
      </div>
      
      <div className="flex flex-wrap gap-1 mt-3">
        {tutorial.tags.slice(0, 3).map(tag => (
          <span key={tag} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white text-lg font-medium">Loading Learning Content...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="learn-header text-center mb-12">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Learn & Master
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Structured learning paths and tutorials to master algorithms and data structures
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
            <p className="text-yellow-300 text-sm">⚠️ {error} (Showing sample content)</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-2 inline-flex">
            {[
              { id: 'paths', label: 'Learning Paths', icon: '🛤️' },
              { id: 'tutorials', label: 'Tutorials', icon: '📖' },
              { id: 'study-plan', label: 'Study Plan', icon: '📅' }
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
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Learning Paths Tab */}
        {activeTab === 'paths' && (
          <div ref={pathsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningPaths.map(path => (
              <PathCard key={path.id} path={path} />
            ))}
          </div>
        )}

        {/* Tutorials Tab */}
        {activeTab === 'tutorials' && (
          <div className="space-y-6">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Algorithms & Data Structures Tutorials</h2>
                <span className="text-gray-400 text-sm">{tutorials.length} tutorials</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutorials.map(tutorial => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} />
              ))}
            </div>
          </div>
        )}

        {/* Study Plan Tab */}
        {activeTab === 'study-plan' && (
          <div className="space-y-6">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-3xl font-bold text-white mb-4">AI-Powered Study Plan</h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Get a personalized study plan based on your current level, goals, and available time
              </p>
              
              {!studyPlan ? (
                <button
                  onClick={generateStudyPlan}
                  disabled={generatingPlan}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {generatingPlan ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating Your Plan...</span>
                    </div>
                  ) : (
                    'Generate My Study Plan'
                  )}
                </button>
              ) : (
                <div className="text-left">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{studyPlan.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>⏱️ {studyPlan.duration}</span>
                      <span>📊 {studyPlan.difficulty}</span>
                      <span>🎯 {studyPlan.focusAreas.length} focus areas</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {studyPlan.weeks.slice(0, 3).map(week => (
                      <div key={week.week} className="bg-gray-800/30 rounded-xl p-4">
                        <h4 className="font-semibold text-white mb-2">Week {week.week}: {week.theme}</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-cyan-400">Topics:</span>
                            <p className="text-gray-300">{week.topics.join(', ')}</p>
                          </div>
                          <div>
                            <span className="text-green-400">Goals:</span>
                            <ul className="text-gray-300 list-disc list-inside">
                              {week.goals.map((goal, i) => (
                                <li key={i}>{goal}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="text-purple-400">
                            ⏱️ {week.estimatedHours} hours
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex gap-4">
                    <button
                      onClick={() => setStudyPlan(null)}
                      className="px-6 py-3 bg-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-600/50 transition-all duration-200"
                    >
                      Generate New Plan
                    </button>
                    <button
                      onClick={() => alert('Study plan saved!')}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all duration-200"
                    >
                      Save Plan
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Path Detail Modal */}
        {selectedPath && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <span className="text-4xl">{selectedPath.icon}</span>
                  <div>
                    <h2 className="text-3xl font-bold text-white">{selectedPath.title}</h2>
                    <p className="text-gray-300">{selectedPath.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPath(null)}
                  className="w-10 h-10 bg-gray-700/50 hover:bg-gray-600/50 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-800/30 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-cyan-400">{selectedPath.progress}%</div>
                  <div className="text-sm text-gray-400">Progress</div>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{selectedPath.solvedProblems}/{selectedPath.totalProblems}</div>
                  <div className="text-sm text-gray-400">Problems</div>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{selectedPath.duration}</div>
                  <div className="text-sm text-gray-400">Duration</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Topics</h3>
                {selectedPath.topics.map((topic, index) => (
                  <div key={index} className="bg-gray-800/30 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          topic.completed ? 'bg-green-500' : 'bg-gray-600'
                        }`}>
                          {topic.completed ? '✓' : index + 1}
                        </div>
                        <span className="text-white font-medium">{topic.name}</span>
                      </div>
                      <span className="text-gray-400 text-sm">{topic.problems} problems</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => {
                    setSelectedPath(null);
                    window.location.href = '/practice?category=' + selectedPath.id;
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all duration-200"
                >
                  Start Learning
                </button>
                <button
                  onClick={() => {
                    setSelectedPath(null);
                  }}
                  className="px-6 py-3 bg-gray-700/50 text-gray-300 font-medium rounded-xl hover:bg-gray-600/50 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tutorial Detail Modal */}
        {selectedTutorial && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white">{selectedTutorial.title}</h2>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                    <span>{selectedTutorial.category}</span>
                    <span>⏱️ {selectedTutorial.duration}</span>
                    <span className={`px-2 py-1 rounded-full bg-gradient-to-r ${getDifficultyColor(selectedTutorial.difficulty)} text-white`}>
                      {selectedTutorial.difficulty}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTutorial(null)}
                  className="w-10 h-10 bg-gray-700/50 hover:bg-gray-600/50 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
                >
                  ✕
                </button>
              </div>
              
              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 whitespace-pre-line">
                  {selectedTutorial.content}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-6">
                {selectedTutorial.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => {
                    alert('Tutorial marked as completed!');
                    setSelectedTutorial(null);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                >
                  Mark as Complete
                </button>
                <button
                  onClick={() => setSelectedTutorial(null)}
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

export default Learn;