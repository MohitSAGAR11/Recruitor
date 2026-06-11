import express from 'express';
import { generateInterviewQuestions } from '../controllers/interview.controller.js';

const router = express.Router();

// POST /api/interview/questions
router.post('/questions', generateInterviewQuestions);

export default router;
