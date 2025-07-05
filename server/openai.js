const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.OPENAI_API_KEY)
const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
const categories = [
  'array','string','linkedlist','tree','graph','dp','greedy','backtracking','sorting','searching',
  'math','bit-manipulation','two-pointers','sliding-window','stack','queue','heap','trie',
  'union-find','design','simulation'
]

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

const callChat = async (messages, temperature, maxTokens) => {
  const prompt = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')
  const model = genAI.getGenerativeModel({ model: modelName })
  let lastErr
  for (let i = 0; i < 3; i++) {
    try {
      const res = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature, maxOutputTokens: maxTokens }
      })
      return res.response.text()
    } catch (e) {
      lastErr = e
      console.error(`Attempt ${i + 1} failed:`, e.message)
      await sleep((i + 1) * 1000)
    }
  }
  throw lastErr
}

const parseJSON = (txt) => {
  try {
    return JSON.parse(txt)
  } catch {
    const m = txt.match(/\{[\s\S]*\}/)
    if (m) return JSON.parse(m[0])
    throw new Error('INVALID_JSON')
  }
}

const fallbackProblem = (difficulty, topic) => {
  const title = 'Sum of Two Numbers'
  return {
    title,
    description: 'Given two integers a and b, return their sum.',
    difficulty,
    category: topic,
    tags: [topic],
    constraints: ['-10^9 <= a,b <= 10^9'],
    examples: [{ input: 'a = 5, b = 7', output: '12', explanation: '5 + 7 = 12' }],
    testCases: [{ input: '1 2', expectedOutput: '3', isHidden: false }],
    hints: [{ order: 1, content: 'Use the plus operator.', difficulty: 'gentle' }],
    solutions: [{
      language: 'javascript',
      code: 'function solve(a,b){return a+b}',
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
      approach: 'Direct addition'
    }],
    estimatedTime: 2,
    slug: title.toLowerCase().replace(/ /g, '-')
  }
}

const normalize = (p, difficulty, topic) => {
  if (!['easy','medium','hard'].includes(p.difficulty)) p.difficulty = difficulty
  if (!categories.includes(p.category)) p.category = topic
  p.slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')
  if (!Array.isArray(p.tags)) p.tags = []
  if (!Array.isArray(p.constraints)) p.constraints = []
  if (!Array.isArray(p.examples)) p.examples = []
  if (!Array.isArray(p.hints)) p.hints = []
  p.hints = p.hints.map((h,i) => {
    if (typeof h === 'string') return { order: i + 1, content: h, difficulty: 'gentle' }
    if (!h.order) h.order = i + 1
    if (!h.difficulty) h.difficulty = 'gentle'
    return h
  })
  if (!Array.isArray(p.testCases)) p.testCases = []
  p.testCases = p.testCases.filter(tc => tc && tc.input != null)
  p.testCases.forEach(tc => {
    if (!tc.expectedOutput) tc.expectedOutput = ''
    if (tc.isHidden === undefined) tc.isHidden = false
  })
  if (!p.testCases.length) p.testCases.push({ input: '0', expectedOutput: '0', isHidden: false })
  p.estimatedTime = p.estimatedTime || 30
  return p
}

const generateProblem = async (difficulty, topic, customPrompt = '') => {
  console.log('Generating problem with:', { difficulty, topic, customPrompt })
  
  const prompt = `Generate a coding problem with the following specifications:

Difficulty: ${difficulty}
Topic: ${topic}
${customPrompt}

Create a well-structured coding interview problem. The problem should be challenging but fair for the given difficulty level.

Return ONLY a valid JSON object with the following structure:
{
  "title": "Problem Title",
  "description": "Detailed problem description with clear requirements",
  "difficulty": "${difficulty}",
  "category": "${topic}",
  "tags": ["${topic}", "other-relevant-tags"],
  "constraints": ["constraint1", "constraint2"],
  "examples": [
    {
      "input": "example input",
      "output": "expected output", 
      "explanation": "why this output"
    }
  ],
  "testCases": [
    {
      "input": "test input",
      "expectedOutput": "expected result",
      "isHidden": false
    }
  ],
  "hints": [
    {
      "order": 1,
      "content": "helpful hint without giving away solution",
      "difficulty": "gentle"
    }
  ],
  "solutions": [
    {
      "language": "javascript",
      "code": "function solve(params) { /* solution code */ }",
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(1)",
      "approach": "Brief explanation of approach"
    }
  ],
  "estimatedTime": 30
}

Ensure the JSON is valid and complete.`

  try {
    const txt = await callChat(
      [
        { role: 'system', content: 'You are an expert competitive programming problem setter. You create high-quality coding interview problems. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      0.7,
      2000
    )
    
    console.log('Raw AI response:', txt.substring(0, 500) + '...')
    
    const parsed = parseJSON(txt)
    console.log('Parsed problem:', parsed.title)
    
    return normalize(parsed, difficulty, topic)
  } catch (error) {
    console.error('Problem generation failed:', error)
    console.log('Using fallback problem')
    return fallbackProblem(difficulty, topic)
  }
}

const generateHint = async (desc, code, difficulty = 'gentle') => {
  const prompt = `Generate a helpful ${difficulty} hint without revealing the full solution. Return JSON { "hint": "...", "difficulty": "${difficulty}", "category": "approach" }`
  const txt = await callChat(
    [
      { role: 'system', content: 'You are a helpful mentor. Respond only with JSON.' },
      { role: 'user', content: `${prompt}\n\nProblem:\n${desc}\n\nCode:\n${code}` }
    ],
    0.6,
    300
  )
  return parseJSON(txt)
}

const generateExplanation = async (problem, solution, language) => {
  const prompt = 'Explain the solution. Return JSON {explanation,approach,timeComplexity,spaceComplexity,keyInsights}'
  const txt = await callChat(
    [
      { role: 'system', content: 'You are an algorithm educator. Respond only with JSON.' },
      { role: 'user', content: `${prompt}\n\nProblem:\n${problem.title}\n${problem.description}\n\nSolution (${language}):\n${solution}` }
    ],
    0.5,
    1200
  )
  return parseJSON(txt)
}

module.exports = { generateProblem, generateHint, generateExplanation }