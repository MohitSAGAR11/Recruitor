/**
 * Multi-provider LLM gateway.
 *
 * Provider priority (all zero-cost, no credit card):
 *   1. Groq      — fastest inference (500-800 tok/s), highest free RPD
 *   2. Gemini    — optional; only used if a *working* AIza key is present
 *   3. OpenRouter (Kimi etc.) — last-resort fallback so the app never fully breaks
 *
 * Every model in the chain is tried in order on 429/404/5xx until one succeeds.
 * Same public contract as the old openrouter.service: callAI() returns a parsed
 * JSON object when possible, else the raw string.
 */
import axios from 'axios';
import { config } from '../config/env.js';

// ── Model chain. Each entry: { provider, model }. ──────────────────────────
// Groq free tier: every model = 30 req/MIN, but RPD differs and each model has
// its OWN rate-limit bucket. So we route bulk extraction ('fast') and nuanced
// scoring ('quality') to DIFFERENT models → two buckets → a 20-CV batch
// (≈20 parse + ≈20 score) never trips the 30/min cap on either, and finishes
// in seconds. RPD: llama-3.1-8b = 14,400/day · llama-3.3-70b = 1,000/day.
//
// Each provider has its OWN independent rate-limit pool, so interleaving them
// (e.g. parse on Cerebras, score on Groq) ~doubles effective free throughput.
// 'fast'  → bulk extraction (CV/JD parsing): cheapest+fastest small models
// 'quality' → scoring / bias / interviews: smartest models first
// @param {'quality'|'fast'} tier
function buildChain(tier = 'quality') {
  const chain = [];
  const hasGroq = config.groqKeys.length > 0;
  const hasCerebras = config.cerebrasKeys.length > 0;

  // Groq stays PRIMARY (30 req/min absorbs bursts). Cerebras is FALLBACK only —
  // its free tier is just 5 req/min, but 2,400 req + 1M tokens/day on a SEPARATE
  // pool = great overflow when Groq is exhausted. Cerebras models are reasoning
  // models (gpt-oss-120b, zai-glm-4.7); clean JSON lands in message.content.
  if (tier === 'fast') {
    // Bulk extraction — keep on a different Groq model than scoring (own bucket)
    if (hasGroq) chain.push({ provider: 'groq', model: 'llama-3.1-8b-instant' });    // 14,400/day
    if (hasGroq) chain.push({ provider: 'groq', model: 'llama-3.3-70b-versatile' });
  } else {
    if (hasGroq) chain.push({ provider: 'groq', model: 'llama-3.3-70b-versatile' });
    if (hasGroq) chain.push({ provider: 'groq', model: 'openai/gpt-oss-120b' });
    if (hasGroq) chain.push({ provider: 'groq', model: 'llama-3.1-8b-instant' });
  }
  // Cerebras overflow (both tiers): smart + own pool, but rate-capped at 5/min
  if (hasCerebras) chain.push({ provider: 'cerebras', model: 'gpt-oss-120b' });
  if (hasCerebras) chain.push({ provider: 'cerebras', model: 'zai-glm-4.7' });

  if (config.geminiKey && config.geminiKey.startsWith('AIza')) {
    // Only when it's the working REST format AND the account has real free quota
    // (AQ.* keys auth but are quota-capped at 0).
    chain.push({ provider: 'gemini', model: 'gemini-2.0-flash' });
  }
  if (config.openrouterKeys.length) {
    chain.push({ provider: 'openrouter', model: 'moonshotai/kimi-k2.6:free' });
  }
  return chain;
}

// Per-provider key pools + a rotating cursor so load spreads across keys.
const KEY_POOLS = {
  groq: () => config.groqKeys,
  cerebras: () => config.cerebrasKeys,
  openrouter: () => config.openrouterKeys,
  gemini: () => (config.geminiKey ? [config.geminiKey] : []),
};
let rotation = 0; // module-level cursor; increments per call to spread load

function keysFor(provider) {
  const keys = (KEY_POOLS[provider] || (() => []))();
  if (keys.length <= 1) return keys;
  // Rotate the starting point so successive calls don't all hammer key[0]
  const start = rotation % keys.length;
  return [...keys.slice(start), ...keys.slice(0, start)];
}

// ── Robust JSON extraction ─────────────────────────────────────────────────
/**
 * Extracts a JSON value from possibly-messy model output:
 *  - strips ```json fences and any prose before/after
 *  - finds the first balanced {...} or [...] block (brace-aware, string-safe)
 * Returns the parsed value, or null if nothing parseable is found.
 */
export function safeParseJSON(text) {
  if (text == null) return null;
  if (typeof text === 'object') return text; // already parsed
  if (typeof text !== 'string') return null;

  // 1. Fast path: strip fences and try whole-string parse
  const stripped = text
    .replace(/^\s*```(?:json)?/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  try {
    return JSON.parse(stripped);
  } catch { /* fall through to extraction */ }

  // 2. Brace-matching: scan for the first balanced { } or [ ] block,
  //    ignoring braces that appear inside strings.
  const extracted = extractBalanced(stripped);
  if (extracted) {
    try {
      return JSON.parse(extracted);
    } catch { /* fall through */ }
  }

  console.warn('[safeParseJSON] Unparseable AI output (first 300 chars):', stripped.slice(0, 300));
  return null;
}

function extractBalanced(s) {
  const openers = { '{': '}', '[': ']' };
  let start = -1;
  let open = '';
  for (let i = 0; i < s.length; i++) {
    if (openers[s[i]]) { start = i; open = s[i]; break; }
  }
  if (start === -1) return null;

  const close = openers[open];
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return null; // unbalanced (truncated output)
}

// ── Per-provider request implementations ───────────────────────────────────
// gpt-oss / glm-4.x emit a separate `reasoning` field that burns output tokens
// before the JSON answer in `content`. Give them headroom + minimal reasoning.
const isReasoningModel = (model) => /gpt-oss|glm-4/i.test(model);

async function callOpenAICompatible({ baseUrl, apiKey, model, systemPrompt, userContent, maxTokens, json, extraHeaders }) {
  const reasoning = isReasoningModel(model);
  const body = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    temperature: 0.2,
    // Reasoning models need room for hidden reasoning + the JSON answer
    max_tokens: reasoning ? Math.max(maxTokens, 2048) : maxTokens,
  };
  if (json) body.response_format = { type: 'json_object' };
  if (/gpt-oss/i.test(model)) body.reasoning_effort = 'low'; // supported by gpt-oss only

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  try {
    const res = await axios.post(`${baseUrl}/chat/completions`, body, {
      headers,
      timeout: config.aiTimeoutMs,
    });
    const content = res.data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('empty choices');
    return content;
  } catch (err) {
    // Some models reject response_format → retry once without it
    if (json && err.response?.status === 400) {
      delete body.response_format;
      const res = await axios.post(`${baseUrl}/chat/completions`, body, {
        headers,
        timeout: config.aiTimeoutMs,
      });
      const content = res.data?.choices?.[0]?.message?.content;
      if (!content) throw new Error('empty choices');
      return content;
    }
    throw err;
  }
}

async function callGemini({ apiKey, model, systemPrompt, userContent, maxTokens, json }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userContent }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: maxTokens,
      ...(json ? { responseMimeType: 'application/json' } : {}),
    },
  };
  const res = await axios.post(url, body, {
    headers: { 'Content-Type': 'application/json' },
    timeout: config.aiTimeoutMs,
  });
  const content = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error('empty candidates');
  return content;
}

const OPENAI_COMPAT_BASE = {
  groq: 'https://api.groq.com/openai/v1',
  cerebras: 'https://api.cerebras.ai/v1',
};

async function callProvider(entry, apiKey, systemPrompt, userContent, maxTokens, json) {
  const { provider, model } = entry;
  if (provider === 'groq' || provider === 'cerebras') {
    return callOpenAICompatible({
      baseUrl: OPENAI_COMPAT_BASE[provider],
      apiKey,
      model, systemPrompt, userContent, maxTokens, json,
    });
  }
  if (provider === 'openrouter') {
    return callOpenAICompatible({
      baseUrl: config.openrouterBaseUrl,
      apiKey,
      model, systemPrompt, userContent, maxTokens, json,
      extraHeaders: { 'HTTP-Referer': config.corsOrigin, 'X-Title': 'RecruitAI' },
    });
  }
  if (provider === 'gemini') {
    return callGemini({ apiKey, model, systemPrompt, userContent, maxTokens, json });
  }
  throw new Error(`Unknown provider: ${provider}`);
}

// ── Public API ──────────────────────────────────────────────────────────────
/**
 * @param {string} systemPrompt
 * @param {string} userContent
 * @param {object} [options]
 * @param {number} [options.maxTokens=1200]
 * @param {boolean} [options.json=true]  request structured JSON output
 * @param {'quality'|'fast'} [options.tier='quality']  route to a model bucket
 * @returns {Promise<object|string>} parsed JSON object, or raw string if unparseable
 */
export async function callAI(systemPrompt, userContent, options = {}) {
  const maxTokens = options.maxTokens ?? 1200;
  const json = options.json ?? true;
  const chain = buildChain(options.tier);

  if (chain.length === 0) {
    throw new Error('No LLM provider configured. Set GROQ_API_KEY / CEREBRAS_API_KEY (or OPENROUTER_API_KEY) in env.');
  }

  rotation++; // advance the key cursor each call to spread load across the pool

  let lastErr;
  for (const entry of chain) {
    const keys = keysFor(entry.provider);
    for (const apiKey of keys) {
      const tag = `${entry.provider}/${entry.model}`;
      try {
        const raw = await callProvider(entry, apiKey, systemPrompt, userContent, maxTokens, json);
        const parsed = safeParseJSON(raw);
        if (parsed !== null) return parsed;
        console.warn(`[callAI] ${tag} returned unparseable JSON, trying next…`);
        lastErr = new Error(`Unparseable JSON from ${tag}`);
      } catch (err) {
        const status = err.response?.status;
        lastErr = err;
        // 429/quota → INSTANTLY try the next KEY in this provider's pool (keys
        // from separate accounts have independent token-per-minute pools, so
        // there's no reason to wait). Other errors → next model.
        if (status === 429) {
          console.warn(`[callAI] ${tag} rate-limited (429) — rotating key/model instantly`);
          continue; // next key in pool, no delay
        }
        console.warn(`[callAI] ${tag} failed${status ? ` (${status})` : ''}: ${err.message} — next model`);
        break; // non-rate-limit error: stop trying keys for this model, go to next entry
      }
    }
  }

  console.error('[callAI] All providers/keys/models exhausted.');
  throw lastErr || new Error('All LLM providers failed');
}

export default { callAI, safeParseJSON };
