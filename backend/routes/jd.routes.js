import express from 'express';
import { parseJD } from '../controllers/jd.controller.js';
import { handleUploadSingle } from '../middleware/upload.middleware.js';

const router = express.Router();

// POST /api/jd/parse
// Accepts { text: string } body OR multipart file upload (field: "jdFile")
router.post('/parse', async (req, res, next) => {
  try {
    await handleUploadSingle(req, res);
    await parseJD(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;
