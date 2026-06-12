/**
 * requireAuth — verifies the Bearer JWT and attaches req.user = { id, email }.
 */
import { verifyToken } from '../services/auth.service.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required.', code: 'NO_TOKEN' });
  }
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid or expired session.', code: 'BAD_TOKEN' });
  }
}
