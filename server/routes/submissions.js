const express = require('express')
const router = express.Router()
const { Problem, Submission } = require('../models/Problem')

router.post('/', async (req, res) => {
  try {
    const { problemId, code, language } = req.body
    const userId = req.user?.id || '507f1f77bcf86cd799439011'

    if (!problemId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Problem ID, code, and language are required'
      })
    }

    const problem = await Problem.findById(problemId)
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      })
    }

    const submission = new Submission({
      userId,
      problemId,
      code,
      language,
      status: 'pending',
      submittedAt: new Date()
    })

    setTimeout(async () => {
      try {
        const passed = Math.random() > 0.3
        const testCasesPassed = passed ? (problem.testCases?.length || 3) : Math.floor(Math.random() * (problem.testCases?.length || 3))
        
        submission.status = passed ? 'accepted' : 'wrong_answer'
        submission.testCasesPassed = testCasesPassed
        submission.totalTestCases = problem.testCases?.length || 3
        submission.runtime = Math.floor(Math.random() * 500) + 50
        submission.memory = Math.floor(Math.random() * 50) + 10
        submission.judgedAt = new Date()
        submission.points = passed ? problem.getPointsForDifficulty() : 0

        await submission.save()

        if (passed) {
          problem.updateStatistics(submission)
          await problem.save()
        }
      } catch (error) {
        console.error('Error updating submission:', error)
      }
    }, 2000)

    const savedSubmission = await submission.save()

    res.json({
      success: true,
      submission: savedSubmission,
      message: 'Solution submitted successfully'
    })
  } catch (error) {
    console.error('Submit solution error:', error)
    res.status(500).json({
      success: false,
      message: 'Error submitting solution',
      error: error.message
    })
  }
})

router.post('/run', async (req, res) => {
  try {
    const { code, language, testCases } = req.body

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Code and language are required'
      })
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

    const results = (testCases || []).map((testCase, index) => ({
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput: Math.random() > 0.7 ? 'wrong output' : testCase.expectedOutput,
      passed: Math.random() > 0.3,
      executionTime: Math.floor(Math.random() * 100) + 10,
      memory: Math.floor(Math.random() * 20) + 5
    }))

    res.json({
      success: true,
      data: {
        results,
        executionTime: Math.floor(Math.random() * 500) + 100,
        memory: Math.floor(Math.random() * 50) + 10
      }
    })
  } catch (error) {
    console.error('Run code error:', error)
    res.status(500).json({
      success: false,
      message: 'Error running code',
      error: error.message
    })
  }
})

router.get('/problem/:problemId', async (req, res) => {
  try {
    const { problemId } = req.params
    const userId = req.user?.id || '507f1f77bcf86cd799439011'

    const submissions = await Submission.find({ 
      problemId, 
      userId 
    })
    .sort({ submittedAt: -1 })
    .lean()

    res.json({
      success: true,
      submissions
    })
  } catch (error) {
    console.error('Get submissions by problem error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions',
      error: error.message
    })
  }
})

router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { limit = 50 } = req.query

    const submissions = await Submission.find({ userId })
      .populate('problemId')
      .sort({ submittedAt: -1 })
      .limit(parseInt(limit))
      .lean()

    res.json({
      success: true,
      submissions
    })
  } catch (error) {
    console.error('Get submissions by user error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching user submissions',
      error: error.message
    })
  }
})

router.get('/recent', async (req, res) => {
  try {
    const { limit = 20 } = req.query

    const submissions = await Submission.find({})
      .populate('problemId')
      .populate('userId', 'name email')
      .sort({ submittedAt: -1 })
      .limit(parseInt(limit))
      .lean()

    res.json({
      success: true,
      submissions
    })
  } catch (error) {
    console.error('Get recent submissions error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching recent submissions',
      error: error.message
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('problemId')
      .populate('userId', 'name email')
      .lean()

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      })
    }

    res.json({
      success: true,
      submission
    })
  } catch (error) {
    console.error('Get submission error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching submission',
      error: error.message
    })
  }
})

module.exports = router