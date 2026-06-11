import { callAI } from '../services/openrouter.service.js';
import { extractText } from '../services/parser.service.js';
import { PARSE_JD_PROMPT } from '../services/prompts.js';

export async function parseJD(req, res) {
  let jdText = req.body?.text || '';

  // If a file was uploaded, extract text from it
  if (req.file) {
    jdText = await extractText(req.file.buffer, req.file.mimetype);
  }

  if (!jdText || jdText.trim().length < 10) {
    return res.status(400).json({
      success: false,
      error: 'Job description text is required. Provide text in the body or upload a file.',
      code: 'MISSING_JD_TEXT',
    });
  }

  const parsedJD = await callAI(PARSE_JD_PROMPT, jdText);

  if (!parsedJD || typeof parsedJD !== 'object') {
    return res.status(502).json({
      success: false,
      error: 'AI failed to parse job description. Please try again.',
      code: 'AI_PARSE_FAILED',
    });
  }

  res.json({ success: true, data: parsedJD });
}
