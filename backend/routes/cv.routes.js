import express from 'express';
import { parseCVBatch } from '../controllers/cv.controller.js';
import { handleUploadBatch } from '../middleware/upload.middleware.js';

const router = express.Router();

// POST /api/cv/parse-batch
// Multipart upload: field "cvFiles", up to 50 .pdf / .docx files
router.post('/parse-batch', async (req, res, next) => {
  try {
    await handleUploadBatch(req, res);
    await parseCVBatch(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;
