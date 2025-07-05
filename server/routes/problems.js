const express = require('express')
const router = express.Router()
const { Problem } = require('../models/Problem')
const { generateProblem } = require('../openai')

const normalise = (p, difficulty, topic) => {
  const title = p.title || 'Generated Problem'
  
  const mapHintDifficulty = (diff) => {
    const mapping = {
      'easy': 'gentle',
      'moderate': 'medium', 
      'hard': 'strong',
      'gentle': 'gentle',
      'medium': 'medium',
      'strong': 'strong'
    }
    return mapping[diff] || 'gentle'
  }

  const normalized = {
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    description: p.description || 'Problem description',
    difficulty: ['easy','medium','hard'].includes(p.difficulty) ? p.difficulty : difficulty,
    category: p.category || topic,
    tags: Array.isArray(p.tags) ? p.tags : [topic],
    constraints: Array.isArray(p.constraints) ? p.constraints : [],
    examples: Array.isArray(p.examples) ? p.examples : [],
    testCases: Array.isArray(p.testCases) ? p.testCases.map(tc => ({
      input: String(tc.input || ''),
      expectedOutput: String(tc.expectedOutput || tc.output || ''),
      isHidden: !!tc.isHidden,
      weight: tc.weight || 1,
      explanation: tc.explanation || ''
    })) : [],
    solutions: Array.isArray(p.solutions) ? p.solutions.map(sol => ({
      language: sol.language || 'javascript',
      code: sol.code || '',
      timeComplexity: sol.timeComplexity || '',
      spaceComplexity: sol.spaceComplexity || '',
      approach: sol.approach || '',
      isOptimal: sol.isOptimal || false
    })) : [],
    hints: Array.isArray(p.hints) ? p.hints.map((h, i) => ({
      order: h.order || i + 1,
      content: typeof h === 'string' ? h : (h.content || ''),
      difficulty: mapHintDifficulty(h.difficulty || 'gentle')
    })) : [],
    estimatedTime: p.estimatedTime || 30,
    visibility: 'public',
    isActive: true,
    metadata: {
      source: 'ai-generated',
      aiGenerated: {
        prompt: p.customPrompt || '',
        model: 'gemini-1.5-flash',
        temperature: 0.7,
        generatedAt: new Date()
      }
    },
    statistics: {
      totalSubmissions: 0,
      acceptedSubmissions: 0,
      acceptanceRate: 0,
      solvedBy: 0,
      attemptedBy: 0,
      likes: 0,
      dislikes: 0,
      difficulty_votes: { easy: 0, medium: 0, hard: 0 }
    },
    points: {
      easy: 10,
      medium: 20, 
      hard: 30
    }
  }

  if (!normalized.testCases || normalized.testCases.length === 0) {
    normalized.testCases = [{
      input: '0',
      expectedOutput: '0',
      isHidden: false,
      weight: 1
    }]
  }

  return normalized
}

router.post('/generate', async (req, res) => {
  try {
    console.log('Generate request received:', req.body)
    const { difficulty = 'easy', topic = 'array', customPrompt = '' } = req.body
    
    console.log('Calling generateProblem with:', { difficulty, topic, customPrompt })
    const raw = await generateProblem(difficulty, topic, customPrompt)
    console.log('Generated problem:', raw.title)
    
    const problemData = normalise(raw, difficulty, topic)
    const doc = new Problem(problemData)
    const saved = await doc.save()
    console.log('Saved problem:', saved._id)
    
    res.json({ 
      success: true, 
      problem: saved,
      message: 'Problem generated successfully'
    })
  } catch (err) {
    console.error('Generate problem error:', err)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate AI problem. Please try again.',
      error: err.message 
    })
  }
})

router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      difficulty,
      category,
      search,
      sort = 'createdAt',
      order = 'desc'
    } = req.query

    const filter = { isActive: true, visibility: 'public' }
    
    if (difficulty && difficulty !== 'All Levels' && difficulty !== '') {
      filter.difficulty = difficulty.toLowerCase()
    }
    
    if (category && category !== 'All Categories' && category !== '') {
      filter.category = category.toLowerCase()
    }
    
    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { tags: { $regex: search.trim(), $options: 'i' } }
      ]
    }

    console.log('Problems filter:', filter)

    const sortOrder = order === 'desc' ? -1 : 1
    const sortObj = { [sort]: sortOrder }

    const [problems, total] = await Promise.all([
      Problem.find(filter)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Problem.countDocuments(filter)
    ])

    console.log(`Found ${problems.length} problems, total: ${total}`)

    res.json({
      success: true,
      problems,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total,
        hasMore: page * limit < total
      }
    })
  } catch (err) {
    console.error('List problems error:', err)
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching problems',
      error: err.message 
    })
  }
})

router.get('/random', async (req, res) => {
  try {
    const { difficulty, category } = req.query
    const filter = { isActive: true, visibility: 'public' }
    
    if (difficulty && difficulty !== 'All Levels' && difficulty !== '') {
      filter.difficulty = difficulty.toLowerCase()
    }
    
    if (category && category !== 'All Categories' && category !== '') {
      filter.category = category.toLowerCase()
    }

    console.log('Random problem filter:', filter)

    const count = await Problem.countDocuments(filter)
    if (count === 0) {
      return res.status(404).json({
        success: false,
        message: 'No problems found matching criteria'
      })
    }

    const random = Math.floor(Math.random() * count)
    const problem = await Problem.findOne(filter).skip(random).lean()

    console.log('Random problem selected:', problem.title)

    res.json({
      success: true,
      problem
    })
  } catch (err) {
    console.error('Random problem error:', err)
    res.status(500).json({
      success: false,
      message: 'Error fetching random problem',
      error: err.message
    })
  }
})

router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params
    const { page = 1, limit = 12 } = req.query
    
    const filter = { 
      category: category.toLowerCase(), 
      isActive: true, 
      visibility: 'public' 
    }

    const [problems, total] = await Promise.all([
      Problem.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Problem.countDocuments(filter)
    ])

    res.json({
      success: true,
      problems,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (err) {
    console.error('Get problems by category error:', err)
    res.status(500).json({
      success: false,
      message: 'Error fetching problems by category',
      error: err.message
    })
  }
})

router.get('/difficulty/:difficulty', async (req, res) => {
  try {
    const { difficulty } = req.params
    const { page = 1, limit = 12 } = req.query
    
    const filter = { 
      difficulty: difficulty.toLowerCase(), 
      isActive: true, 
      visibility: 'public' 
    }

    const [problems, total] = await Promise.all([
      Problem.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Problem.countDocuments(filter)
    ])

    res.json({
      success: true,
      problems,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (err) {
    console.error('Get problems by difficulty error:', err)
    res.status(500).json({
      success: false,
      message: 'Error fetching problems by difficulty',
      error: err.message
    })
  }
})

router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 12 } = req.query
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      })
    }

    const searchQuery = q.trim()
    const filter = {
      isActive: true,
      visibility: 'public',
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { tags: { $regex: searchQuery, $options: 'i' } }
      ]
    }

    const [problems, total] = await Promise.all([
      Problem.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Problem.countDocuments(filter)
    ])

    res.json({
      success: true,
      problems,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      },
      query: searchQuery
    })
  } catch (err) {
    console.error('Search problems error:', err)
    res.status(500).json({
      success: false,
      message: 'Error searching problems',
      error: err.message
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id).lean()
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      })
    }
    res.json({
      success: true,
      problem
    })
  } catch (err) {
    console.error('Get problem error:', err)
    res.status(500).json({
      success: false,
      message: 'Error fetching problem',
      error: err.message
    })
  }
})

module.exports = router