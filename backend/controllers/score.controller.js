import { v4 as uuidv4 } from 'uuid';
import pLimit from 'p-limit';
import { callAI } from '../services/openrouter.service.js';
import { SCORE_CANDIDATE_PROMPT } from '../services/prompts.js';
import { sseJobStore } from '../server.js';

// Higher concurrency = more parallel AI calls = faster batch completion
const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT_AI_CALLS || '8', 10);

/**
 * Builds a minimal scoring payload — only fields the AI actually needs.
 * Avoids sending email, phone, raw highlights, etc. which bloat token count
 * and slow down inference without adding scoring signal.
 */
function buildScoringPayload(jd, candidateParsed) {
  return JSON.stringify({
    jd: {
      title: jd.title,
      mustHave: jd.mustHave,
      niceToHave: (jd.niceToHave || []).slice(0, 6),
      hardSkills: (jd.hardSkills || []).slice(0, 10),
      softSkills: (jd.softSkills || []).slice(0, 5),
      experienceLevel: jd.experienceLevel,
      minYearsExperience: jd.minYearsExperience,
      domainKnowledge: (jd.domainKnowledge || []).slice(0, 5),
    },
    candidate: {
      name: candidateParsed?.name,
      currentRole: candidateParsed?.currentRole,
      totalYearsExperience: candidateParsed?.totalYearsExperience,
      skills: (candidateParsed?.skills || []).slice(0, 15),
      education: (candidateParsed?.education || []).slice(0, 2).map((e) => ({
        degree: e.degree,
        institution: e.institution,
      })),
      // Only role + company per job, no full highlights (saves ~40% tokens)
      workHistory: (candidateParsed?.workHistory || []).slice(0, 4).map((w) => ({
        role: w.role,
        company: w.company,
        years: w.years,
      })),
      careerTrajectory: candidateParsed?.careerTrajectory,
      nonTraditionalBackground: candidateParsed?.nonTraditionalBackground,
    },
  });
}

/**
 * POST /api/score/batch
 * Starts async scoring, returns jobId immediately.
 * Body: { jd: parsedJD, candidates: [{ filename, parsed }] }
 */
export async function startScoringBatch(req, res) {
  const { jd, candidates } = req.body;

  if (!jd || !candidates || !Array.isArray(candidates) || candidates.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Request body must include jd and a non-empty candidates array.',
      code: 'INVALID_PAYLOAD',
    });
  }

  const jobId = uuidv4();

  // Initialize job state in shared store
  sseJobStore.set(jobId, {
    status: 'running',
    total: candidates.length,
    current: 0,
    progress: 0,
    latestName: '',
    results: [],
    error: null,
    clients: [], // SSE client response objects
  });

  // Start async processing — do NOT await
  processScoringJob(jobId, jd, candidates).catch((err) => {
    const job = sseJobStore.get(jobId);
    if (job) {
      job.status = 'error';
      job.error = err.message;
      broadcastSSE(jobId, { type: 'error', message: err.message });
    }
  });

  res.json({ success: true, jobId });
}

/**
 * GET /api/score/progress/:jobId
 * SSE stream for real-time scoring progress.
 * Explicit headers per spec — not relying on global CORS middleware.
 */
export async function getScoringProgress(req, res) {
  const { jobId } = req.params;
  const job = sseJobStore.get(jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      error: `Job ${jobId} not found.`,
      code: 'JOB_NOT_FOUND',
    });
  }

  // Explicit SSE headers (CORS + streaming)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.flushHeaders();

  // Send current state immediately so client doesn't wait
  const snapshot = {
    type: 'progress',
    progress: job.progress,
    current: job.current,
    total: job.total,
    latestName: job.latestName,
  };
  res.write(`data: ${JSON.stringify(snapshot)}\n\n`);

  // If job already done, send done event and close
  if (job.status === 'done') {
    res.write(`data: ${JSON.stringify({ type: 'done', candidates: job.results })}\n\n`);
    return res.end();
  }
  if (job.status === 'error') {
    res.write(`data: ${JSON.stringify({ type: 'error', message: job.error })}\n\n`);
    return res.end();
  }

  // Register this client
  job.clients.push(res);

  // Clean up when client disconnects
  req.on('close', () => {
    const currentJob = sseJobStore.get(jobId);
    if (currentJob) {
      currentJob.clients = currentJob.clients.filter((c) => c !== res);
    }
  });
}

/**
 * Broadcast an SSE event to all connected clients for a job.
 */
function broadcastSSE(jobId, data) {
  const job = sseJobStore.get(jobId);
  if (!job) return;
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of job.clients) {
    try {
      client.write(payload);
    } catch (_err) {
      // Client may have disconnected
    }
  }
  // Close clients on done/error
  if (data.type === 'done' || data.type === 'error') {
    for (const client of job.clients) {
      try { client.end(); } catch (_e) { /* ignore */ }
    }
    job.clients = [];
    // Clean up job after 5 minutes
    setTimeout(() => sseJobStore.delete(jobId), 5 * 60 * 1000);
  }
}

/**
 * Core async scoring logic.
 * All candidates are scored in parallel up to MAX_CONCURRENT at once.
 * No inter-batch delay — pLimit handles the concurrency window automatically.
 */
async function processScoringJob(jobId, jd, candidates) {
  const job = sseJobStore.get(jobId);
  const limit = pLimit(MAX_CONCURRENT);
  const scored = [];

  await Promise.all(
    candidates.map((candidate) =>
      limit(async () => {
        const candidateName = candidate.parsed?.name || candidate.filename || 'Unknown';

        try {
          // Slim payload + reduced max_tokens = faster inference per candidate
          const payload = buildScoringPayload(jd, candidate.parsed);
          const scoreData = await callAI(SCORE_CANDIDATE_PROMPT, payload, { maxTokens: 600 });

          const result = {
            filename: candidate.filename,
            name: candidateName,
            parsed: candidate.parsed,
            scores: typeof scoreData === 'object' ? scoreData : null,
            status: typeof scoreData === 'object' ? 'success' : 'failed',
          };

          scored.push(result);
          job.current++;
          job.progress = Math.round((job.current / job.total) * 100);
          job.latestName = candidateName;

          broadcastSSE(jobId, {
            type: 'progress',
            progress: job.progress,
            current: job.current,
            total: job.total,
            latestName: candidateName,
          });
        } catch (err) {
          console.error(`[processScoringJob] Failed scoring ${candidateName}:`, err.message);
          scored.push({
            filename: candidate.filename,
            name: candidateName,
            parsed: candidate.parsed,
            scores: null,
            status: 'failed',
            error: err.message,
          });
          job.current++;
          job.progress = Math.round((job.current / job.total) * 100);
          broadcastSSE(jobId, {
            type: 'progress',
            progress: job.progress,
            current: job.current,
            total: job.total,
            latestName: candidateName,
          });
        }
      })
    )
  );

  // Sort by overallScore descending
  scored.sort((a, b) => {
    const scoreA = a.scores?.overallScore ?? 0;
    const scoreB = b.scores?.overallScore ?? 0;
    return scoreB - scoreA;
  });

  // Mark top 10 as shortlisted
  const rankedCandidates = scored.map((candidate, index) => ({
    ...candidate,
    rank: index + 1,
    shortlisted: index < 10,
  }));

  job.status = 'done';
  job.results = rankedCandidates;

  broadcastSSE(jobId, { type: 'done', candidates: rankedCandidates });
}
