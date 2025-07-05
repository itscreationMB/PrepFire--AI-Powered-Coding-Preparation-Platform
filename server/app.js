require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const path = require('path')
const { healthCheck, getStats } = require('./database')
const authRoutes = require('./routes/auth')
const apiRoutes = require('./routes/api')
const problemsRoutes = require('./routes/problems')
const userRoutes = require('./routes/user')
const submissionsRoutes = require('./routes/submissions')
const {
  auth,
  adminAuth,
  generalLimiter,
  authLimiter,
  submissionLimiter,
  apiLimiter,
  sanitizeInput,
  errorHandler,
  notFound
} = require('./middleware')

const app = express()

app.set('trust proxy', 1)
app.disable('etag')

if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false
  }))
} else {
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }))
}

app.use(compression())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(sanitizeInput)

app.use('/api', generalLimiter)

app.get('/health', async (_req, res) => {
  try {
    const health = await healthCheck()
    const stats = await getStats()
    res.status(health.status === 'healthy' ? 200 : 503).json({
      success: health.status === 'healthy',
      status: health.status,
      timestamp: health.timestamp,
      database: health.connection,
      stats,
      version: process.env.npm_package_version || '1.0.0',
      uptime: Math.floor(process.uptime()),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV
    })
  } catch {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    })
  }
})

app.get('/api/status', (_req, res) => {
  res.json({
    success: true,
    message: 'PrepFire API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/problems', problemsRoutes)
app.use('/api/user', userRoutes)
app.use('/api/submissions', submissionsRoutes)
app.use('/api', apiLimiter, auth, apiRoutes)

app.use('/api/admin/*', adminAuth)

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'))
  })
}

app.use(notFound)
app.use(errorHandler)

module.exports = app