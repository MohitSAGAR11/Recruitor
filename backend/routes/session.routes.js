import express from 'express';
import {
  listSessions, getSession, createSession, saveInterview, deleteSession,
} from '../controllers/session.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(requireAuth); // all session routes require login

router.get('/', listSessions);
router.post('/', createSession);
router.get('/:id', getSession);
router.patch('/:id/interviews', saveInterview);
router.delete('/:id', deleteSession);

export default router;
