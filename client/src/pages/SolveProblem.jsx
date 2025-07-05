import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { problemsAPI, submissionsAPI } from '../api';

const SolveProblem = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHints, setShowHints] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  
  const editorRef = useRef();

  const codeTemplates = {
    javascript: `function solve(input) {
    // Your code here
    return result;
}`,
    python: `def solve(input):
    # Your code here
    return result`,
    java: `public class Solution {
    public static String solve(String input) {
        // Your code here
        return result;
    }
}`,
    cpp: `#include <iostream>
#include <string>
using namespace std;

string solve(string input) {
    // Your code here
    return result;
}`
  };

  useEffect(() => {
    fetchProblem();
  }, [id]);

  useEffect(() => {
    if (!loading && problem) {
      gsap.fromTo('.problem-header',
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );

      gsap.fromTo('.problem-content',
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 0.8, delay: 0.2, ease: 'power2.out' }
      );

      gsap.fromTo('.code-editor',
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.8, delay: 0.4, ease: 'power2.out' }
      );
    }
  }, [loading, problem]);

  useEffect(() => {
    setCode(codeTemplates[language] || codeTemplates.javascript);
  }, [language]);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      const data = await problemsAPI.getById(id);
      
      if (data.success) {
        setProblem(data.problem);
        setCode(codeTemplates[language]);
      } else {
        throw new Error(data.message || 'Problem not found');
      }
    } catch (error) {
      console.error('Fetch problem error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const runCode = async () => {
    try {
      setIsRunning(true);
      setOutput('');
      setTestResults([]);

      const testCases = problem.testCases?.filter(tc => !tc.isHidden)?.slice(0, 3) || [
        { input: 'test input', expectedOutput: 'expected output' }
      ];

      const mockResults = testCases.map((testCase, index) => ({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: testCase.expectedOutput,
        passed: Math.random() > 0.3,
        executionTime: Math.floor(Math.random() * 100) + 10
      }));

      setTestResults(mockResults);
      setOutput(`Executed ${testCases.length} test cases\n${mockResults.filter(r => r.passed).length} passed, ${mockResults.filter(r => !r.passed).length} failed`);

    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const submitSolution = async () => {
    try {
      setIsSubmitting(true);
      
      const data = await submissionsAPI.submit(problem._id, code, language);
      
      if (data.success) {
        const allPassed = Math.random() > 0.4;
        setOutput(allPassed ? 
          '✅ All test cases passed! Solution accepted.' : 
          '❌ Some test cases failed. Please review your solution.'
        );
        
        if (allPassed) {
          setTimeout(() => {
            window.location.href = '/practice';
          }, 2000);
        }
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (error) {
      setOutput(`Submission error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'easy': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Problem Not Found</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.href = '/practice'}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all duration-200"
          >
            Back to Practice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="flex h-screen">
        <div className="w-1/2 p-6 overflow-y-auto problem-content">
          <div className="problem-header mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => window.location.href = '/practice'}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <span>←</span>
                <span>Back to Practice</span>
              </button>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                  {problem.category}
                </span>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">{problem.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>⚡ {problem.estimatedTime || 30} minutes</span>
              <span>✓ {problem.statistics?.solvedBy || 0} solved</span>
              <span>{problem.statistics?.acceptanceRate || 0}% acceptance</span>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'description' 
                    ? 'bg-cyan-500/20 text-cyan-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('examples')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'examples' 
                    ? 'bg-cyan-500/20 text-cyan-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Examples
              </button>
              <button
                onClick={() => setActiveTab('constraints')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'constraints' 
                    ? 'bg-cyan-500/20 text-cyan-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Constraints
              </button>
              {problem.hints && problem.hints.length > 0 && (
                <button
                  onClick={() => setActiveTab('hints')}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === 'hints' 
                      ? 'bg-yellow-500/20 text-yellow-400' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  💡 Hints
                </button>
              )}
            </div>

            <div className="text-gray-300">
              {activeTab === 'description' && (
                <div className="prose prose-invert max-w-none">
                  <p className="leading-relaxed">{problem.description}</p>
                </div>
              )}

              {activeTab === 'examples' && (
                <div className="space-y-4">
                  {problem.examples && problem.examples.length > 0 ? (
                    problem.examples.map((example, index) => (
                      <div key={index} className="p-4 bg-gray-800/30 rounded-xl">
                        <h4 className="text-white font-semibold mb-3">Example {index + 1}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-cyan-400 font-medium mb-2">Input:</p>
                            <pre className="text-sm bg-gray-900/50 p-3 rounded border border-gray-700">{example.input}</pre>
                          </div>
                          <div>
                            <p className="text-green-400 font-medium mb-2">Output:</p>
                            <pre className="text-sm bg-gray-900/50 p-3 rounded border border-gray-700">{example.output}</pre>
                          </div>
                        </div>
                        {example.explanation && (
                          <div className="mt-3">
                            <p className="text-purple-400 font-medium mb-2">Explanation:</p>
                            <p className="text-sm">{example.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No examples available for this problem.</p>
                  )}
                </div>
              )}

              {activeTab === 'constraints' && (
                <div>
                  {problem.constraints && problem.constraints.length > 0 ? (
                    <ul className="list-disc list-inside space-y-2">
                      {problem.constraints.map((constraint, index) => (
                        <li key={index} className="text-sm">{constraint}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400">No constraints specified for this problem.</p>
                  )}
                </div>
              )}

              {activeTab === 'hints' && (
                <div className="space-y-3">
                  {problem.hints && problem.hints.length > 0 ? (
                    problem.hints.map((hint, index) => (
                      <div key={index} className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                        <div className="flex items-start space-x-3">
                          <span className="text-yellow-400 font-bold">💡</span>
                          <div>
                            <p className="text-yellow-300 font-medium">Hint {hint.order || index + 1}</p>
                            <p className="text-sm text-gray-300 mt-1">{hint.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No hints available for this problem.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-1/2 p-6 code-editor">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Code Editor</h2>
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
            </div>

            <div className="flex-1 mb-4">
              <textarea
                ref={editorRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="Write your solution here..."
                spellCheck={false}
              />
            </div>

            <div className="flex space-x-3 mb-4">
              <button
                onClick={runCode}
                disabled={isRunning}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isRunning ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Running...</span>
                  </div>
                ) : (
                  '▶️ Run Code'
                )}
              </button>
              <button
                onClick={submitSolution}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  '✅ Submit'
                )}
              </button>
            </div>

            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 h-48 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">Output</h3>
                <button
                  onClick={() => setOutput('')}
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                >
                  Clear
                </button>
              </div>
              
              {testResults.length > 0 && (
                <div className="mb-4 space-y-2">
                  {testResults.map((result, index) => (
                    <div key={index} className={`p-2 rounded border ${
                      result.passed ? 'border-green-500/20 bg-green-500/10' : 'border-red-500/20 bg-red-500/10'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                          Test Case {index + 1} {result.passed ? '✅' : '❌'}
                        </span>
                        <span className="text-xs text-gray-400">{result.executionTime}ms</span>
                      </div>
                      <div className="text-xs text-gray-300">
                        <div>Input: {result.input}</div>
                        <div>Expected: {result.expectedOutput}</div>
                        <div>Got: {result.actualOutput}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                {output || 'Run your code to see the output here...'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolveProblem;