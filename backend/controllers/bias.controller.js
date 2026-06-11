import { callAI } from '../services/openrouter.service.js';
import { BIAS_CHECK_PROMPT } from '../services/prompts.js';

/**
 * POST /api/bias/check
 * Body: { shortlist: [{ name, score, parsed }], allCandidates?: [...] }
 */
export async function checkBias(req, res) {
  const { shortlist, allCandidates } = req.body;

  if (!shortlist || !Array.isArray(shortlist) || shortlist.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Request body must include a non-empty shortlist array.',
      code: 'MISSING_SHORTLIST',
    });
  }

  const payload = JSON.stringify({
    shortlist: shortlist.map((c) => ({
      name: c.name || c.parsed?.name,
      currentRole: c.parsed?.currentRole,
      location: c.parsed?.location,
      education: c.parsed?.education,
      careerTrajectory: c.parsed?.careerTrajectory,
      nonTraditionalBackground: c.parsed?.nonTraditionalBackground,
      nonTraditionalReason: c.parsed?.nonTraditionalReason,
      overallScore: c.scores?.overallScore,
    })),
    fullRankedList: (allCandidates || []).map((c) => ({
      name: c.name || c.parsed?.name,
      rank: c.rank,
      score: c.scores?.overallScore,
      nonTraditionalBackground: c.parsed?.nonTraditionalBackground,
    })),
  });

  const biasReport = await callAI(BIAS_CHECK_PROMPT, payload);

  if (!biasReport || typeof biasReport !== 'object') {
    return res.status(502).json({
      success: false,
      error: 'AI bias check failed. Please try again.',
      code: 'AI_BIAS_FAILED',
    });
  }

  res.json({ success: true, data: biasReport });
}
