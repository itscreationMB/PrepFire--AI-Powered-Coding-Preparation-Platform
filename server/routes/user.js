const express = require('express')
const router = express.Router()
const { Problem, Submission } = require('../models/Problem')

router.get('/profile', async (req, res) => {
  try {
    const userId = req.user?.id || '507f1f77bcf86cd799439011'
    
    const user = {
      _id: userId,
      name: req.user?.name || 'Coders',
      email: req.user?.email || 'john@example.com',
      streak: {
        current: 15,
        longest: 25
      }
    }

    res.json({
      success: true,
      user
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    })
  }
})

router.get('/progress', async (req, res) => {
  try {
    const userId = req.user?.id || '507f1f77bcf86cd799439011'

    const [totalProblems, submissions] = await Promise.all([
      Problem.countDocuments({ isActive: true, visibility: 'public' }),
      Submission.find({ userId }).populate('problemId').lean()
    ])

    const solvedProblems = new Set()
    const acceptedSubmissions = submissions.filter(sub => {
      if (sub.status === 'accepted') {
        solvedProblems.add(sub.problemId?._id?.toString())
        return true
      }
      return false
    })

    const totalSubmissions = submissions.length
    const accuracy = totalSubmissions > 0 ? Math.round((acceptedSubmissions.length / totalSubmissions) * 100) : 0

    const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (i * 7))
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)

      const weekProblems = submissions.filter(sub => {
        const submissionDate = new Date(sub.submittedAt)
        return submissionDate >= weekStart && submissionDate < weekEnd && sub.status === 'accepted'
      })

      return {
        week: i + 1,
        problemsSolved: new Set(weekProblems.map(s => s.problemId?._id?.toString())).size
      }
    }).reverse()

    const recentSubmissions = submissions
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 10)

    const achievements = [
      {
        name: 'First Steps',
        description: 'Solved your first problem',
        icon: '🎯',
        unlockedAt: acceptedSubmissions[0]?.submittedAt || new Date()
      },
      {
        name: 'Problem Solver',
        description: 'Solved 10 problems',
        icon: '💪',
        unlockedAt: new Date()
      }
    ].filter((_, index) => index < Math.floor(solvedProblems.size / 5) + 1)

    const statistics = {
      solvedProblems: solvedProblems.size,
      totalProblems,
      accuracy,
      totalSubmissions,
      acceptedSubmissions: acceptedSubmissions.length,
      currentStreak: 15,
      longestStreak: 25,
      rank: Math.max(1, 2000 - solvedProblems.size * 10),
      weeklyProgress: weeklyProgress.reduce((sum, week) => sum + week.problemsSolved, 0)
    }

    res.json({
      success: true,
      data: {
        statistics,
        progress: { weeklyProgress },
        recentSubmissions,
        achievements,
        user: {
          name: req.user?.name || 'Coders',
          streak: { current: 15, longest: 25 }
        }
      }
    })
  } catch (error) {
    console.error('Get progress error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching progress',
      error: error.message
    })
  }
})

router.get('/recommendations', async (req, res) => {
  try {
    const userId = req.user?.id || '507f1f77bcf86cd799439011'

    const userSubmissions = await Submission.find({ userId }).populate('problemId').lean()
    const solvedProblemIds = userSubmissions
      .filter(sub => sub.status === 'accepted')
      .map(sub => sub.problemId?._id)

    const difficultCategories = ['dp', 'graph', 'tree', 'backtracking']
    const userWeaknesses = userSubmissions
      .filter(sub => sub.status !== 'accepted' && sub.problemId?.category)
      .reduce((acc, sub) => {
        const category = sub.problemId.category
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {})

    const recommendedCategories = Object.keys(userWeaknesses).length > 0 
      ? Object.keys(userWeaknesses).slice(0, 3)
      : difficultCategories.slice(0, 3)

    const recommendations = await Problem.find({
      _id: { $nin: solvedProblemIds },
      category: { $in: recommendedCategories },
      difficulty: { $in: ['easy', 'medium'] },
      isActive: true,
      visibility: 'public'
    }).limit(6).lean()

    res.json({
      success: true,
      data: {
        recommendations: {
          problems: recommendations
        }
      }
    })
  } catch (error) {
    console.error('Get recommendations error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching recommendations',
      error: error.message
    })
  }
})

router.get('/activity/:limit?', async (req, res) => {
  try {
    const userId = req.user?.id || '507f1f77bcf86cd799439011'
    const limit = parseInt(req.params.limit) || 10

    const activities = await Submission.find({ userId })
      .populate('problemId')
      .sort({ submittedAt: -1 })
      .limit(limit)
      .lean()

    res.json({
      success: true,
      data: {
        activity: activities
      }
    })
  } catch (error) {
    console.error('Get activity error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching activity',
      error: error.message
    })
  }
})

router.get('/statistics', async (req, res) => {
  try {
    const userId = req.user?.id || '507f1f77bcf86cd799439011'

    const submissions = await Submission.find({ userId }).populate('problemId').lean()
    const solvedProblems = new Set(
      submissions
        .filter(sub => sub.status === 'accepted')
        .map(sub => sub.problemId?._id?.toString())
    )

    const totalProblems = await Problem.countDocuments({ isActive: true, visibility: 'public' })
    const accuracy = submissions.length > 0 ? Math.round((submissions.filter(s => s.status === 'accepted').length / submissions.length) * 100) : 0

    const statistics = {
      problemsSolved: solvedProblems.size,
      totalProblems,
      accuracy,
      totalSubmissions: submissions.length,
      rank: Math.max(1, 2000 - solvedProblems.size * 10)
    }

    res.json({
      success: true,
      statistics
    })
  } catch (error) {
    console.error('Get statistics error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    })
  }
})

router.get('/achievements', async (req, res) => {
  try {
    const userId = req.user?.id || '507f1f77bcf86cd799439011'

    const submissions = await Submission.find({ userId, status: 'accepted' }).lean()
    const solvedCount = new Set(submissions.map(s => s.problemId?.toString())).size

    const achievements = []

    if (solvedCount >= 1) {
      achievements.push({
        name: 'First Steps',
        description: 'Solved your first problem',
        icon: '🎯',
        unlockedAt: submissions[0]?.submittedAt || new Date()
      })
    }

    if (solvedCount >= 5) {
      achievements.push({
        name: 'Getting Started',
        description: 'Solved 5 problems',
        icon: '🌱',
        unlockedAt: new Date()
      })
    }

    if (solvedCount >= 10) {
      achievements.push({
        name: 'Problem Solver',
        description: 'Solved 10 problems',
        icon: '💪',
        unlockedAt: new Date()
      })
    }

    if (solvedCount >= 25) {
      achievements.push({
        name: 'Dedicated Learner',
        description: 'Solved 25 problems',
        icon: '🏆',
        unlockedAt: new Date()
      })
    }

    res.json({
      success: true,
      achievements
    })
  } catch (error) {
    console.error('Get achievements error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching achievements',
      error: error.message
    })
  }
})

module.exports = router