import pLimit from 'p-limit';
import { callAI } from '../services/openrouter.service.js';
import { extractText } from '../services/parser.service.js';
import { PARSE_CV_PROMPT } from '../services/prompts.js';

const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT_AI_CALLS || '5', 10);
const INTER_BATCH_DELAY_MS = 200;

export async function parseCVBatch(req, res) {
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No CV files uploaded. Use the "cvFiles" field with PDF or DOCX files.',
      code: 'NO_FILES',
    });
  }

  const limit = pLimit(MAX_CONCURRENT);
  let batchCount = 0;

  const results = await Promise.all(
    files.map((file, index) =>
      limit(async () => {
        // Stagger batches to avoid rate limiting
        if (index > 0 && index % MAX_CONCURRENT === 0) {
          await new Promise((r) => setTimeout(r, INTER_BATCH_DELAY_MS));
          batchCount++;
        }

        try {
          const rawText = await extractText(file.buffer, file.mimetype);
          // 'fast' tier → llama-3.1-8b (separate rate-limit bucket from scoring)
          const parsed = await callAI(PARSE_CV_PROMPT, rawText, { tier: 'fast' });

          return {
            filename: file.originalname,
            parsed: typeof parsed === 'object' ? parsed : null,
            rawText,
            status: typeof parsed === 'object' ? 'success' : 'failed',
          };
        } catch (err) {
          console.error(`[parseCVBatch] Failed on ${file.originalname}:`, err.message);
          return {
            filename: file.originalname,
            parsed: null,
            rawText: '',
            status: 'failed',
            error: err.message,
          };
        }
      })
    )
  );

  const succeeded = results.filter((r) => r.status === 'success').length;
  const failed = results.filter((r) => r.status === 'failed').length;

  res.json({
    success: true,
    data: results,
    summary: { total: files.length, succeeded, failed },
  });
}
