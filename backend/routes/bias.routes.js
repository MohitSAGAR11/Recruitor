import express from 'express';
import { checkBias } from '../controllers/bias.controller.js';

const router = express.Router();

// POST /api/bias/check
router.post('/check', checkBias);

export default router;
