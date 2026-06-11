import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import jdRoutes from './routes/jd.routes.js';
import cvRoutes from './routes/cv.routes.js';
import scoreRoutes from './routes/score.routes.js';
import biasRoutes from './routes/bias.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// In-memory SSE job store shared across score controller
export const sseJobStore = new Map();

// Security & logging
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(morgan('dev'));

// CORS — allow frontend origin explicitly
app.use(cors({
  origin: 'http://localhost:5173',
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

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'RecruitAI backend is running' });
});

// Global error handler (must be last)
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`🚀 RecruitAI backend running on port ${PORT}`);
  console.log(`   Model: ${process.env.MODEL}`);
  console.log(`   CORS origin: http://localhost:5173`);
});

export default app;
