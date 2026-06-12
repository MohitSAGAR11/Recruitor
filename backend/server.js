import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config, logProviderStatus } from './config/env.js';
import jdRoutes from './routes/jd.routes.js';
import cvRoutes from './routes/cv.routes.js';
import scoreRoutes from './routes/score.routes.js';
import biasRoutes from './routes/bias.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import authRoutes from './routes/auth.routes.js';
import sessionRoutes from './routes/session.routes.js';
import { pingDb } from './db/pool.js';
import { errorMiddleware } from './middleware/error.middleware.js';

const app = express();
const PORT = config.port;

// In-memory SSE job store shared across score controller
export const sseJobStore = new Map();

// Security & logging
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(morgan('dev'));

// CORS — allow frontend origin explicitly
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/jd', jdRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/score', scoreRoutes);
app.use('/api/bias', biasRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'RecruitAI backend is running' });
});

// Global error handler (must be last)
app.use(errorMiddleware);

app.listen(PORT, async () => {
  console.log(`🚀 RecruitAI backend running on port ${PORT}`);
  logProviderStatus();
  console.log(`   CORS origin: ${config.corsOrigin}`);
  const ok = await pingDb();
  console.log(`   DB ping: ${ok ? '✅ reachable' : '⚠️  unreachable'}`);
});

export default app;
