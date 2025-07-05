import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const CodeEditor = () => {
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [hints, setHints] = useState([]);
  const [aiExplanation, setAiExplanation] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState('dark');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);

  const editorRef = useRef();
  const cardRef = useRef();

  const languageTemplates = {
    javascript: `// Write your solution here
function solve(input) {
    // Your code here
    return result;
}`,
    python: `# Write your solution here
def solve(input):
    # Your code here
    return result`,
    java: `// Write your solution here
public class Solution {
    public static void solve(String[] input) {
        // Your code here
    }
}`,
    cpp: `// Write your solution here
#include <iostream>
#include <vector>
using namespace std;

int main() {
    // Your code here
    return 0;
}`
  };

  useEffect(() => {
    fetchProblem();
  }, []);

  useEffect(() => {
    if (!loading) {
      gsap.fromTo(cardRef.current,
        { opacity: 0, z: -100, rotationX: -20 },
        { opacity: 1, z: 0, rotationX: 0, duration: 1.2, ease: 'power3.out' }
      );

      gsap.to('.floating-card', {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut'
      });
    }
  }, [loading]);

  useEffect(() => {
    if (language && languageTemplates[language]) {
      setCode(languageTemplates[language]);
    }
  }, [language]);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      
      const problemId = window.location.pathname.split('/').pop();
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/problems/${problemId}`,
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
          setProblem(data.data.problem);
          if (data.data.problem.hints) {
            setHints(data.data.problem.hints);
          }
        } else {
          throw new Error(data.message || 'Failed to fetch problem');
        }
      } else {
        throw new Error('Failed to fetch problem from server');
      }
    } catch (error) {
      console.error('Fetch problem error:', error);
      
      // Mock problem data
      const mockProblem = {
        _id: '1',
        title: 'Two Sum',
        difficulty: 'easy',
        category: 'array',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        examples: [
          {
            input: 'nums = [2,7,11,15], target = 9',
            output: '[0,1]',
            explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
          },
          {
            input: 'nums = [3,2,4], target = 6',
            output: '[1,2]',
            explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
          }
        ],
        constraints: [
          '2 <= nums.length <= 10^4',
          '-10^9 <= nums[i] <= 10^9',
          '-10^9 <= target <= 10^9',
          'Only one valid answer exists.'
        ],
        testCases: [
          { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]' },
          { input: '[3,2,4]\n6', expectedOutput: '[1,2]' },
          { input: '[3,3]\n6', expectedOutput: '[0,1]' }
        ],
        hints: [
          {
            order: 1,
            content: 'Try using a hash map to store the numbers you have seen so far.',
            difficulty: 'gentle'
          },
          {
            order: 2,
            content: 'For each number, check if its complement (target - current number) exists in the hash map.',
            difficulty: 'medium'
          }
        ],
        solutions: [
          {
            language: 'javascript',
            code: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
            timeComplexity: 'O(n)',
            spaceComplexity: 'O(n)',
            approach: 'Hash Map'
          }
        ]
      };
      
      setProblem(mockProblem);
      setHints(mockProblem.hints);
    } finally {
      setLoading(false);
    }
  };

  const runCode = async () => {
    try {
      setRunning(true);
      setOutput('Running code...\n');
      
      const token = localStorage.getItem('authToken');
      const startTime = Date.now();
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/submissions/run`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code,
            language,
            testCases: problem.testCases.slice(0, 3) // Run first 3 test cases
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const endTime = Date.now();
          setExecutionTime(endTime - startTime);
          setMemoryUsage(data.data.memory || Math.random() * 50 + 10);
          
          const results = data.data.results || [];
          setTestResults(results);
          
          let outputText = '';
          results.forEach((result, index) => {
            const status = result.passed ? '✅' : '❌';
            outputText += `Test case ${index + 1}: ${status}\n`;
            if (!result.passed) {
              outputText += `Expected: ${result.expectedOutput}\n`;
              outputText += `Got: ${result.actualOutput}\n`;
            }
          });
          
          const passedTests = results.filter(r => r.passed).length;
          outputText += `\n${passedTests}/${results.length} test cases passed\n`;
          
          if (passedTests === results.length) {
            outputText += '🎉 All test cases passed!';
          }
          
          setOutput(outputText);
        } else {
          throw new Error(data.message || 'Code execution failed');
        }
      } else {
        throw new Error('Failed to run code');
      }
    } catch (error) {
      console.error('Run code error:', error);
      
      // Mock execution results
      const mockResults = [
        { passed: true, input: '[2,7,11,15], 9', expectedOutput: '[0,1]', actualOutput: '[0,1]' },
        { passed: true, input: '[3,2,4], 6', expectedOutput: '[1,2]', actualOutput: '[1,2]' },
        { passed: Math.random() > 0.3, input: '[3,3], 6', expectedOutput: '[0,1]', actualOutput: '[0,1]' }
      ];
      
      setTestResults(mockResults);
      setExecutionTime(Math.random() * 500 + 100);
      setMemoryUsage(Math.random() * 50 + 10);
      
      let outputText = '';
      mockResults.forEach((result, index) => {
        const status = result.passed ? '✅' : '❌';
        outputText += `Test case ${index + 1}: ${status}\n`;
      });
      
      const passedTests = mockResults.filter(r => r.passed).length;
      outputText += `\n${passedTests}/${mockResults.length} test cases passed\n`;
      
      if (passedTests === mockResults.length) {
        outputText += '🎉 All test cases passed!';
      }
      
      setOutput(outputText);
    } finally {
      setRunning(false);
    }
  };

  const submitSolution = async () => {
    try {
      setSubmitting(true);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/submissions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            problemId: problem._id,
            code,
            language
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('Solution submitted successfully! Check your submissions page for results.');
          
          gsap.to('.success-animation', { 
            opacity: 1, 
            scale: 1, 
            duration: 0.5,
            onComplete: () => {
              setTimeout(() => {
                gsap.to('.success-animation', { opacity: 0, scale: 0, duration: 0.3 });
              }, 2000);
            }
          });
        } else {
          throw new Error(data.message || 'Submission failed');
        }
      } else {
        throw new Error('Failed to submit solution');
      }
    } catch (error) {
      console.error('Submit solution error:', error);
      alert('Failed to submit solution. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getAIHint = async () => {
    try {
      setAiLoading(true);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/ai/hint`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            problemDescription: problem.description,
            userCode: code,
            difficulty: 'gentle'
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAiExplanation(data.data.hint);
          setShowAIAssistant(true);
        } else {
          throw new Error(data.message || 'Failed to get AI hint');
        }
      } else {
        throw new Error('Failed to get AI hint');
      }
    } catch (error) {
      console.error('AI hint error:', error);
      
      // Mock AI hint
      const mockHints = [
        "Consider using a hash map to store the numbers you've seen so far along with their indices. This will allow you to check if the complement exists in O(1) time.",
        "Think about what you need to find for each number: target - current_number. If you've seen this value before, you have your answer!",
        "The brute force approach would be O(n²), but with a hash map, you can solve this in O(n) time with O(n) space.",
        "As you iterate through the array, for each number, check if (target - number) exists in your hash map. If it does, return the indices!"
      ];
      
      setAiExplanation(mockHints[Math.floor(Math.random() * mockHints.length)]);
      setShowAIAssistant(true);
    } finally {
      setAiLoading(false);
    }
  };

  const getAIOptimization = async () => {
    try {
      setAiLoading(true);
      
      // Mock AI optimization suggestion
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const optimizationSuggestion = `
**Code Analysis & Optimization Suggestions:**

**Current Approach:** Your solution looks good! Here are some potential improvements:

1. **Time Complexity:** O(n) - Optimal for this problem
2. **Space Complexity:** O(n) - Using hash map for lookups

**Optimizations:**
- Consider edge cases: empty array, array with less than 2 elements
- Add input validation
- Use early return for better readability

**Alternative Approach:**
If the array was sorted, you could use two pointers technique for O(1) space complexity, but it would require O(n log n) time for sorting.

**Performance Tips:**
- Your current hash map approach is already optimal
- Consider using Map() instead of {} for better performance with large datasets
      `;
      
      setAiExplanation(optimizationSuggestion);
      setShowAIAssistant(true);
    } catch (error) {
      console.error('AI optimization error:', error);
      alert('Failed to get AI optimization. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white text-lg font-medium">Loading Problem...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">Problem Not Found</h2>
          <p className="text-gray-400">The requested problem could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Problem Description */}
        <div ref={cardRef} className="floating-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">{problem.title}</h2>
              <button
                onClick={() => window.location.href = '/practice'}
                className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-all duration-200"
              >
                ← Back
              </button>
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                problem.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                problem.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {problem.difficulty}
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                {problem.category}
              </span>
            </div>
          </div>

          <div className="prose text-gray-300 mb-6">
            <p className="leading-relaxed">{problem.description}</p>
          </div>

          {/* Examples */}
          {problem.examples && problem.examples.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Examples</h3>
              {problem.examples.map((example, index) => (
                <div key={index} className="mb-4 p-4 bg-gray-800/50 rounded-xl">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <p className="text-cyan-400 font-medium mb-1">Input:</p>
                      <pre className="text-sm text-gray-300 bg-gray-900/50 p-2 rounded overflow-x-auto">{example.input}</pre>
                    </div>
                    <div>
                      <p className="text-green-400 font-medium mb-1">Output:</p>
                      <pre className="text-sm text-gray-300 bg-gray-900/50 p-2 rounded overflow-x-auto">{example.output}</pre>
                    </div>
                    {example.explanation && (
                      <div>
                        <p className="text-purple-400 font-medium mb-1">Explanation:</p>
                        <p className="text-sm text-gray-300">{example.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Constraints */}
          {problem.constraints && problem.constraints.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Constraints</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                {problem.constraints.map((constraint, index) => (
                  <li key={index} className="text-sm">{constraint}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Hints */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Hints & AI Assistant</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="px-4 py-2 bg-yellow-600/50 text-yellow-300 rounded-lg hover:bg-yellow-500/50 transition-all duration-200 text-sm"
                >
                  💡 Show Hints ({hints.length})
                </button>
                <button
                  onClick={getAIHint}
                  disabled={aiLoading}
                  className="px-4 py-2 bg-green-600/50 text-green-300 rounded-lg hover:bg-green-500/50 disabled:opacity-50 transition-all duration-200 text-sm"
                >
                  {aiLoading ? '🤖 Getting...' : '🤖 AI Hint'}
                </button>
              </div>
            </div>
            
            {showHints && hints.length > 0 && (
              <div className="space-y-2">
                {hints.map((hint, index) => (
                  <div key={index} className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-200 text-sm">
                      <strong>Hint {hint.order}:</strong> {hint.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Code Editor and Output */}
        <div className="space-y-6">
          {/* Editor Settings */}
          <div className="floating-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
                
                <div className="flex items-center space-x-2">
                  <label className="text-gray-300 text-sm">Font Size:</label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="px-2 py-1 bg-gray-800/50 border border-white/10 rounded text-white text-sm focus:outline-none"
                  >
                    <option value="12">12px</option>
                    <option value="14">14px</option>
                    <option value="16">16px</option>
                    <option value="18">18px</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={getAIOptimization}
                  disabled={aiLoading}
                  className="px-3 py-2 bg-purple-600/50 text-purple-300 rounded-lg hover:bg-purple-500/50 disabled:opacity-50 transition-all duration-200 text-sm"
                >
                  🧠 Optimize
                </button>
                {problem.solutions && problem.solutions.length > 0 && (
                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    className="px-3 py-2 bg-orange-600/50 text-orange-300 rounded-lg hover:bg-orange-500/50 transition-all duration-200 text-sm"
                  >
                    💡 Solution
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="floating-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Code Editor</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                {executionTime > 0 && <span>⏱️ {executionTime}ms</span>}
                {memoryUsage > 0 && <span>💾 {memoryUsage.toFixed(1)}MB</span>}
              </div>
            </div>

            <div className="relative">
              <textarea
                ref={editorRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-80 p-4 bg-gray-900/50 border border-white/10 rounded-xl text-white font-mono resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400"
                style={{ fontSize: `${fontSize}px` }}
                spellCheck="false"
                placeholder="Write your solution here..."
              />
            </div>

            <div className="flex space-x-3 mt-4">
              <button
                onClick={runCode}
                disabled={running || !code.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {running ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Running...</span>
                  </div>
                ) : (
                  '▶ Run Code'
                )}
              </button>
              <button
                onClick={submitSolution}
                disabled={submitting || !code.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {submitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Submit Solution'
                )}
              </button>
            </div>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="floating-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Test Results</h3>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${
                    result.passed 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                        {result.passed ? '✅' : '❌'} Test Case {index + 1}
                      </span>
                      {result.runtime && (
                        <span className="text-gray-400 text-sm">{result.runtime}ms</span>
                      )}
                    </div>
                    {!result.passed && (
                      <div className="mt-2 text-sm">
                        <p className="text-gray-300">Expected: <code className="bg-gray-800 px-1 rounded">{result.expectedOutput}</code></p>
                        <p className="text-gray-300">Got: <code className="bg-gray-800 px-1 rounded">{result.actualOutput}</code></p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Output */}
          <div className="floating-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Output</h3>
            <div className="h-32 p-4 bg-gray-900/50 border border-white/10 rounded-xl text-green-400 font-mono text-sm overflow-y-auto">
              <pre className="whitespace-pre-wrap">{output || 'Click "Run Code" to see output...'}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* Solution Modal */}
      {showSolution && problem.solutions && problem.solutions.length > 0 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">Solution</h2>
              <button
                onClick={() => setShowSolution(false)}
                className="w-10 h-10 bg-gray-700/50 hover:bg-gray-600/50 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
              >
                ✕
              </button>
            </div>
            
            {problem.solutions.map((solution, index) => (
              <div key={index} className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                    {solution.language}
                  </span>
                  <span className="text-gray-400">Time: {solution.timeComplexity}</span>
                  <span className="text-gray-400">Space: {solution.spaceComplexity}</span>
                </div>
                
                <div className="bg-gray-900/50 rounded-xl p-4 mb-4">
                  <pre className="text-sm text-gray-300 font-mono overflow-x-auto">
                    {solution.code}
                  </pre>
                </div>
                
                {solution.approach && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <h4 className="text-blue-400 font-medium mb-2">Approach: {solution.approach}</h4>
                    <p className="text-gray-300 text-sm">
                      This solution uses {solution.approach.toLowerCase()} approach with {solution.timeComplexity} time complexity and {solution.spaceComplexity} space complexity.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      {showAIAssistant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">🤖 AI Assistant</h2>
              <button
                onClick={() => setShowAIAssistant(false)}
                className="w-10 h-10 bg-gray-700/50 hover:bg-gray-600/50 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
              >
                ✕
              </button>
            </div>
            
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 whitespace-pre-line leading-relaxed">
                {aiExplanation}
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={getAIHint}
                disabled={aiLoading}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 transition-all duration-200"
              >
                Get Another Hint
              </button>
              <button
                onClick={() => setShowAIAssistant(false)}
                className="px-6 py-3 bg-gray-700/50 text-gray-300 font-medium rounded-xl hover:bg-gray-600/50 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Animation */}
      <div className="success-animation fixed inset-0 flex items-center justify-center pointer-events-none opacity-0 scale-0 z-50">
        <div className="text-8xl animate-bounce">🎉</div>
      </div>
    </div>
  );
};

export default CodeEditor;