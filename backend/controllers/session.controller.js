import { query } from '../db/pool.js';

/**
 * GET /api/sessions  — list current user's past screenings (lightweight).
 */
export async function listSessions(req, res) {
  const { rows } = await query(
    `select id, title, candidate_count, created_at,
            (bias_report->>'biasDetected')::boolean as bias_detected
       from screening_sessions
      where user_id = $1
      order by created_at desc
      limit 100`,
    [req.user.id]
  );
  res.json({ success: true, data: rows });
}

/**
 * GET /api/sessions/:id — full session (jd, candidates, bias, interviews).
 */
export async function getSession(req, res) {
  const { rows } = await query(
    'select * from screening_sessions where id = $1 and user_id = $2',
    [req.params.id, req.user.id]
  );
  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Session not found.', code: 'NOT_FOUND' });
  }
  res.json({ success: true, data: rows[0] });
}

/**
 * POST /api/sessions — save a completed screening.
 * Body: { title, jd, candidates, biasReport, interviews? }
 */
export async function createSession(req, res) {
  const { title, jd, candidates, biasReport, interviews } = req.body || {};
  if (!jd || !Array.isArray(candidates)) {
    return res.status(400).json({ success: false, error: 'jd and candidates[] are required.', code: 'BAD_PAYLOAD' });
  }
  const { rows } = await query(
    `insert into screening_sessions (user_id, title, jd, candidates, bias_report, interviews, candidate_count)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning id, title, candidate_count, created_at`,
    [
      req.user.id,
      title || jd.title || 'Untitled role',
      jd,
      JSON.stringify(candidates),
      biasReport || null,
      interviews || {},
      candidates.length,
    ]
  );
  res.json({ success: true, data: rows[0] });
}

/**
 * PATCH /api/sessions/:id/interviews — merge a generated interview guide in.
 * Body: { candidateName, questions }
 */
export async function saveInterview(req, res) {
  const { candidateName, questions } = req.body || {};
  if (!candidateName || !questions) {
    return res.status(400).json({ success: false, error: 'candidateName and questions are required.', code: 'BAD_PAYLOAD' });
  }
  const { rowCount } = await query(
    `update screening_sessions
        set interviews = jsonb_set(coalesce(interviews, '{}'::jsonb), array[$1], $2::jsonb, true)
      where id = $3 and user_id = $4`,
    [candidateName, JSON.stringify(questions), req.params.id, req.user.id]
  );
  if (rowCount === 0) {
    return res.status(404).json({ success: false, error: 'Session not found.', code: 'NOT_FOUND' });
  }
  res.json({ success: true });
}

/**
 * DELETE /api/sessions/:id
 */
export async function deleteSession(req, res) {
  const { rowCount } = await query(
    'delete from screening_sessions where id = $1 and user_id = $2',
    [req.params.id, req.user.id]
  );
  if (rowCount === 0) {
    return res.status(404).json({ success: false, error: 'Session not found.', code: 'NOT_FOUND' });
  }
  res.json({ success: true });
}
