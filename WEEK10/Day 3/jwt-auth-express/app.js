const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const config = require('./config')
const authRoutes = require('./routes/auth')
const apiRoutes = require('./routes/api')

const app = express()

app.disable('x-powered-by')
// Behind a reverse proxy (for correct client IPs in rate limiting), also add: app.set('trust proxy', 1)

app.use(bodyParser.json({ limit: '10kb' }))
app.use(cookieParser())

app.get('/', (req, res) => {
  res.json({
    name: 'JWT authentication demo',
    public: ['POST /auth/register', 'POST /auth/login', 'POST /auth/refresh', 'POST /auth/logout', 'GET /auth/verify-email'],
    protected: ['GET /auth/check', 'POST /auth/logout-all', 'GET /api/dashboard', 'GET /api/profile', 'PUT /api/profile'],
  })
})

app.use('/auth', authRoutes)
app.use('/api', apiRoutes)

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Error handler: keeps stack traces out of responses.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body is not valid JSON.' })
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large.' })
  }
  console.error(err)
  return res.status(500).json({ error: 'Internal server error.' })
})

// Only start listening when run directly (node app.js), so tests can import the app.
if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`Server running at ${config.baseUrl}`)
  })
}

module.exports = app
