import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'
import { initDatabase } from './db/database'
import analyzeRouter  from './routes/analyze'
import reviewsRouter  from './routes/reviews'
import keywordsRouter from './routes/keywords'

const app  = express()
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001


app.use(
  helmet({
    contentSecurityPolicy:    false,
    crossOriginEmbedderPolicy: false,
  })
)

app.use(
  cors({
    origin:         ['http://localhost:5173', 'http://localhost:4173'],
    methods:        ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials:    true,
  })
)


app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))


app.use((req, _res, next) => {
  const ts = new Date().toISOString().slice(11, 23)
  console.log(`[${ts}] ${req.method.padEnd(6)} ${req.path}`)
  next()
})

app.use('/api/analyze',  analyzeRouter)
app.use('/api/reviews',  reviewsRouter)
app.use('/api/keywords', keywordsRouter)


app.get('/api/health', (_req, res) => {
  res.json({
    success:   true,
    message:   'SentiRate API is running',
    timestamp: new Date().toISOString(),
    version:   '1.0.0',
  })
})

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../frontend/dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}


app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('[UNHANDLED ERROR]', err.stack ?? err.message)
    res.status(500).json({
      success: false,
      message: err.message || 'Internal server error',
    })
  }
)


async function boot(): Promise<void> {
  try {
    await initDatabase()

    app.listen(PORT, () => {
      console.log(`\n🚀  SentiRate API  →  http://localhost:${PORT}`)
      console.log(`    Health check   →  http://localhost:${PORT}/api/health`)
      console.log(`    Environment    →  ${process.env.NODE_ENV ?? 'development'}\n`)
    })
  } catch (err) {
    console.error('[BOOT FAILURE]', err)
    process.exit(1)
  }
}

boot()

export default app