/**
 * Centralized environment loading + normalization.
 *
 * Loads (in order, later does NOT override earlier — dotenv default):
 *   1. backend/.env            (standard location)
 *   2. <repo-root>/env         (the loose file the user keeps keys in)
 *
 * Then exposes a normalized `config` object so the rest of the app never has to
 * care whether a value came in as `GROQ_API_KEY`, `grok`, or `groq`.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

// 1. backend/.env  2. repo-root/env  (don't override already-set vars)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config({ path: path.resolve(repoRoot, 'env') });

const pick = (...names) => {
  for (const n of names) {
    if (process.env[n] && String(process.env[n]).trim()) return String(process.env[n]).trim();
  }
  return undefined;
};

// Same as pick(), but splits on commas → key POOL. Lets you paste several keys
// (from separate accounts) per provider; the gateway rotates through them.
const pickList = (...names) => {
  const raw = pick(...names);
  return raw ? raw.split(',').map((s) => s.trim()).filter(Boolean) : [];
};

export const config = {
  port: parseInt(pick('PORT') || '3024', 10),
  nodeEnv: pick('NODE_ENV') || 'development',

  // ── LLM provider key POOLS (comma-separate to add more, rotated on 429) ──
  groqKeys: pickList('GROQ_API_KEYS', 'GROQ_API_KEY', 'grok', 'groq'),
  cerebrasKeys: pickList('CEREBRAS_API_KEYS', 'CEREBRAS_API_KEY', 'cerebras'),
  openrouterKeys: pickList('OPENROUTER_API_KEYS', 'OPENROUTER_API_KEY', 'openrouter'),
  geminiKey: pick('GEMINI_API_KEY', 'gemini'),
  openrouterBaseUrl: pick('OPENROUTER_BASE_URL') || 'https://openrouter.ai/api/v1',

  // ── Database (direct Postgres via Supabase pooler) + auth ──
  databaseUrl: pick('DATABASE_URL'),
  jwtSecret: pick('JWT_SECRET') || 'dev-insecure-change-me',

  // ── Tuning ──
  aiTimeoutMs: parseInt(pick('AI_CALL_TIMEOUT_MS') || '45000', 10),
  maxConcurrentAiCalls: parseInt(pick('MAX_CONCURRENT_AI_CALLS') || '8', 10),
  corsOrigin: pick('CORS_ORIGIN') || 'https://recruitor-ai.netlify.app',
};

/** Logs which providers are configured (no secret values printed). */
export function logProviderStatus() {
  const providers = [];
  if (config.groqKeys.length) providers.push(`Groq(${config.groqKeys.length} key${config.groqKeys.length > 1 ? 's' : ''})`);
  if (config.cerebrasKeys.length) providers.push(`Cerebras(${config.cerebrasKeys.length})`);
  // AQ.* Gemini keys authenticate but have 0 free quota → only count usable AIza keys
  if (config.geminiKey?.startsWith('AIza')) providers.push('Gemini');
  else if (config.geminiKey) console.log('   (Gemini key present but not "AIza" format → skipped; no free API quota)');
  if (config.openrouterKeys.length) providers.push(`OpenRouter(${config.openrouterKeys.length})`);
  console.log(`   LLM providers active: ${providers.join(' → ') || '⚠️  NONE (set GROQ_API_KEY)'}`);
  console.log(`   Database: ${config.databaseUrl ? 'connected (Supabase Postgres)' : 'not configured (no login/history)'}`);
}

export default config;
