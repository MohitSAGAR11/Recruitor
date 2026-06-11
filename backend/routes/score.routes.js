import express from 'express';
import { startScoringBatch, getScoringProgress } from '../controllers/score.controller.js';

const router = express.Router();

// POST /api/score/batch — starts async scoring, returns jobId immediately
router.post('/batch', startScoringBatch);

// GET /api/score/progress/:jobId — SSE stream for real-time progress
router.get('/progress/:jobId', getScoringProgress);

export default router;
