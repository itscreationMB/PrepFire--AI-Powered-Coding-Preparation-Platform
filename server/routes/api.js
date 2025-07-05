const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const { Problem, Submission } = require('../models/Problem');
const { validatePagination } = require('../utils/validation');

const router = express.Router();

router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'PrepFire API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

router.get('/problems', async (req, res) => {
  try {
    const {
      difficulty,
      category,
      tags,
      search,
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const filter = { isActive: true };

    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;
    if (tags) filter.tags = { $in: tags.split(',') };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    const problems = await Problem.find(filter)
      .select('-testCases -solutions -editorial')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Problem.countDocuments(filter);

    let problemsWithStatus = problems;
    
    if (req.user) {
      problemsWithStatus = problems.map(problem => ({
        ...problem,
        solved: req.user.solvedProblems.includes(problem._id),
        attempted: req.user.attemptedProblems.includes(problem._id),
        bookmarked: problem.bookmarkedBy.includes(req.user._id)
      }));
    }

    res.json({
      success: true,
      data: {
        problems: problemsWithStatus,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch problems'
    });
  }
});

router.get('/problems/random', async (req, res) => {
  try {
    const { difficulty, category } = req.query;
    
    const filter = { isActive: true };
    if (difficulty && difficulty !== 'all') filter.difficulty = difficulty;
    if (category && category !== 'all') filter.category = category;

    const count = await Problem.countDocuments(filter);
    if (count === 0) {
      return res.status(404).json({
        success: false,
        message: 'No problems found with the specified criteria'
      });
    }

    const random = Math.floor(Math.random() * count);
    const problem = await Problem.findOne(filter)
      .skip(random)
      .select('-testCases -solutions -editorial');

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'No problems found'
      });
    }

    res.json({
      success: true,
      data: { problem }
    });
  } catch (error) {
    console.error('Get random problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch random problem'
    });
  }
});

router.post('/problems/generate', async (req, res) => {
  try {
    const { difficulty, topic, customPrompt } = req.body;

    if (!difficulty || !topic) {
      return res.status(400).json({
        success: false,
        message: 'Difficulty and topic are required'
      });
    }

    try {
      const openaiService = require('../services/openai');
      const generatedProblem = await openaiService.generateProblem(difficulty, topic, customPrompt);
      
      if (generatedProblem) {
        res.json({
          success: true,
          data: { problem: generatedProblem },
          message: 'Problem generated successfully'
        });
      } else {
        throw new Error('Failed to generate problem');
      }
    } catch (openaiError) {
      console.error('OpenAI generation error:', openaiError);
      
      const mockProblem = {
        _id: 'generated_' + Date.now(),
        title: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} ${topic.charAt(0).toUpperCase() + topic.slice(1)} Problem`,
        slug: `generated-${topic}-${difficulty}-${Date.now()}`,
        description: `This is a ${difficulty} level problem focusing on ${topic}. ${customPrompt ? customPrompt : 'Solve this algorithmic challenge efficiently.'}`,
        difficulty,
        category: topic,
        tags: [topic, difficulty, 'generated'],
        examples: [
          {
            input: 'Example input',
            output: 'Example output',
            explanation: 'This demonstrates the expected behavior.'
          }
        ],
        testCases: [
          {
            input: 'test input',
            expectedOutput: 'expected output',
            isHidden: false
          }
        ],
        hints: [
          {
            order: 1,
            content: `Consider using ${topic} data structures or algorithms.`,
            difficulty: 'gentle'
          }
        ],
        estimatedTime: difficulty === 'easy' ? 20 : difficulty === 'medium' ? 35 : 50,
        isActive: true,
        createdAt: new Date(),
        statistics: {
          solvedBy: 0,
          attemptedBy: 0,
          likes: 0,
          dislikes: 0,
          acceptanceRate: 0
        }
      };

      res.json({
        success: true,
        data: { problem: mockProblem },
        message: 'Generated mock problem (OpenAI service unavailable)'
      });
    }

  } catch (error) {
    console.error('Generate problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate problem'
    });
  }
});

router.get('/problems/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    let problem;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      problem = await Problem.findById(id);
    } else {
      problem = await Problem.findOne({ slug: id });
    }

    if (!problem || !problem.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    let userSubmissions = [];
    let problemData = problem.toObject();

    if (req.user) {
      userSubmissions = await Submission.find({
        userId: req.user._id,
        problemId: problem._id
      }).sort({ submittedAt: -1 }).limit(10);

      problemData = {
        ...problemData,
        solved: req.user.solvedProblems.includes(problem._id),
        attempted: req.user.attemptedProblems.includes(problem._id),
        bookmarked: problem.bookmarkedBy.includes(req.user._id),
        liked: problem.likedBy.includes(req.user._id),
        disliked: problem.dislikedBy.includes(req.user._id),
        userSubmissions,
        testCases: problem.testCases.filter(tc => !tc.isHidden)
      };
    }

    res.json({
      success: true,
      data: { problem: problemData }
    });

  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch problem'
    });
  }
});

router.get('/problems/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const problems = await Problem.find({ 
      category, 
      isActive: true 
    })
      .select('title slug difficulty category tags statistics estimatedTime')
      .sort({ 'statistics.solvedBy': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Problem.countDocuments({ category, isActive: true });

    res.json({
      success: true,
      data: {
        problems,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get problems by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch problems'
    });
  }
});

router.get('/problems/difficulty/:difficulty', async (req, res) => {
  try {
    const { difficulty } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const problems = await Problem.find({ 
      difficulty, 
      isActive: true 
    })
      .select('title slug difficulty category tags statistics estimatedTime')
      .sort({ 'statistics.acceptanceRate': 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Problem.countDocuments({ difficulty, isActive: true });

    res.json({
      success: true,
      data: {
        problems,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get problems by difficulty error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch problems'
    });
  }
});

router.get('/problems/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchQuery = {
      isActive: true,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ]
    };

    const problems = await Problem.find(searchQuery)
      .select('title slug difficulty category tags statistics estimatedTime')
      .sort({ 'statistics.solvedBy': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Problem.countDocuments(searchQuery);

    res.json({
      success: true,
      data: {
        problems,
        query: q,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Search problems error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search problems'
    });
  }
});

router.post('/problems/:id/bookmark', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    const isBookmarked = problem.toggleBookmark(req.user._id);
    await problem.save();

    if (isBookmarked) {
      req.user.favoriteProblems.push(problem._id);
    } else {
      req.user.favoriteProblems.pull(problem._id);
    }
    await req.user.save();

    res.json({
      success: true,
      data: { bookmarked: isBookmarked }
    });

  } catch (error) {
    console.error('Bookmark problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bookmark problem'
    });
  }
});

router.post('/problems/:id/like', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    problem.addLike(req.user._id);
    await problem.save();

    res.json({
      success: true,
      data: {
        likes: problem.statistics.likes,
        dislikes: problem.statistics.dislikes
      }
    });

  } catch (error) {
    console.error('Like problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like problem'
    });
  }
});

router.post('/submissions', async (req, res) => {
  try {
    const { problemId, code, language } = req.body;

    if (!problemId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Problem ID, code, and language are required'
      });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    const submission = new Submission({
      userId: req.user._id,
      problemId,
      code,
      language,
      totalTestCases: problem.testCases.length
    });

    await submission.save();

    setTimeout(async () => {
      try {
        const isAccepted = Math.random() > 0.3;
        
        submission.status = isAccepted ? 'accepted' : 'wrong_answer';
        submission.testCasesPassed = isAccepted ? problem.testCases.length : Math.floor(Math.random() * problem.testCases.length);
        submission.runtime = Math.floor(Math.random() * 1000) + 50;
        submission.memory = Math.floor(Math.random() * 50) + 10;
        submission.judgedAt = new Date();
        
        if (isAccepted) {
          submission.points = problem.getPointsForDifficulty();
          
          if (!req.user.solvedProblems.includes(problemId)) {
            req.user.solvedProblems.push(problemId);
            req.user.statistics.solvedProblems += 1;
            req.user.statistics[`${problem.difficulty}Problems`] += 1;
            req.user.addPoints(submission.points);
            req.user.updateStreak();
          }
        }

        if (!req.user.attemptedProblems.includes(problemId)) {
          req.user.attemptedProblems.push(problemId);
          req.user.statistics.attemptedProblems += 1;
        }

        req.user.statistics.totalSubmissions += 1;
        if (isAccepted) {
          req.user.statistics.acceptedSubmissions += 1;
        }

        await submission.save();
        await req.user.save();

        problem.updateStatistics(submission);
        await problem.save();
        
      } catch (error) {
        console.error('Error updating submission:', error);
      }
    }, 2000);

    res.json({
      success: true,
      data: {
        submission: {
          id: submission._id,
          status: submission.status,
          submittedAt: submission.submittedAt
        }
      },
      message: 'Solution submitted successfully'
    });

  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit solution'
    });
  }
});

router.get('/submissions', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, problemId } = req.query;

    const filter = { userId: req.user._id };
    if (status) filter.status = status;
    if (problemId) filter.problemId = problemId;

    const submissions = await Submission.find(filter)
      .populate('problemId', 'title difficulty category')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Submission.countDocuments(filter);

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions'
    });
  }
});

router.get('/submissions/:id', async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('problemId', 'title difficulty category');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    if (submission.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { submission }
    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission'
    });
  }
});

router.get('/user/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('solvedProblems', 'title difficulty category')
      .populate('favoriteProblems', 'title difficulty category');

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
});

router.get('/user/progress', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const recentSubmissions = await Submission.find({ userId: req.user._id })
      .populate('problemId', 'title difficulty category')
      .sort({ submittedAt: -1 })
      .limit(10);

    const categoryStats = await Problem.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 },
          easy: { $sum: { $cond: [{ $eq: ['$difficulty', 'easy'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$difficulty', 'medium'] }, 1, 0] } },
          hard: { $sum: { $cond: [{ $eq: ['$difficulty', 'hard'] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        statistics: user.statistics,
        streak: user.streak,
        progress: user.progress,
        achievements: user.achievements,
        recentSubmissions,
        categoryStats
      }
    });

  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user progress'
    });
  }
});

router.get('/user/statistics', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      data: { 
        statistics: user.statistics,
        streak: user.streak
      }
    });
  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
});

router.get('/user/leaderboard', async (req, res) => {
  try {
    const { timeframe = 'all', limit = 50 } = req.query;
    
    const users = await User.find({ isActive: true })
      .select('name email statistics streak createdAt')
      .sort({ 'statistics.points': -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { 
        leaderboard: users,
        timeframe
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
});

router.get('/user/recommendations', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const recommendations = user.getRecommendations();
    
    const suggestedProblems = await Problem.find({
      category: { $in: recommendations.categories },
      difficulty: recommendations.difficulty,
      isActive: true,
      _id: { $nin: user.solvedProblems }
    })
      .select('title slug difficulty category tags statistics estimatedTime')
      .limit(10);

    res.json({
      success: true,
      data: { 
        recommendations: {
          ...recommendations,
          problems: suggestedProblems
        }
      }
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations'
    });
  }
});

router.put('/user/preferences', async (req, res) => {
  try {
    const { preferences } = req.body;
    
    const user = await User.findById(req.user._id);
    user.preferences = { ...user.preferences, ...preferences };
    await user.save();

    res.json({
      success: true,
      data: { 
        preferences: user.preferences 
      },
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
});

module.exports = router;